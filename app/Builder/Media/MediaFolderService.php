<?php

namespace App\Builder\Media;

use App\Models\MediaFolder;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final readonly class MediaFolderService
{
    /**
     * Nested folder tree for the given user, ordered by name.
     *
     * @return list<array{id: int, name: string, parentId: int|null, assetCount: int, children: list<array{id: int, name: string, parentId: int|null, assetCount: int, children: list<mixed>}>}>
     */
    public function tree(User $user): array
    {
        $folders = $user->mediaFolders()
            ->withCount(['assets' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('name')
            ->get();

        $nodes = [];
        foreach ($folders as $folder) {
            $nodes[$folder->id] = [
                'id' => $folder->id,
                'name' => $folder->name,
                'parentId' => $folder->parent_id,
                'assetCount' => (int) $folder->assets_count,
                'children' => [],
            ];
        }

        $roots = [];
        foreach ($nodes as $id => $node) {
            $parentId = $node['parentId'];
            if ($parentId !== null && isset($nodes[$parentId])) {
                $nodes[$parentId]['children'][] = &$nodes[$id];
            } else {
                $roots[] = &$nodes[$id];
            }
        }

        return $roots;
    }

    public function create(User $user, ?MediaFolder $parent, string $name): MediaFolder
    {
        if ($parent !== null) {
            $this->assertOwner($user, $parent);
        }

        $name = $this->normalize($name);
        $this->assertNameAvailable($user, $parent, $name);

        return $user->mediaFolders()->create([
            'parent_id' => $parent?->id,
            'name' => $name,
        ]);
    }

    public function rename(User $user, MediaFolder $folder, string $name): MediaFolder
    {
        $this->assertOwner($user, $folder);

        $name = $this->normalize($name);
        $this->assertNameAvailable($user, $folder->parent, $name, $folder->id);

        $folder->forceFill(['name' => $name])->save();

        return $folder;
    }

    public function move(User $user, MediaFolder $folder, ?MediaFolder $destination): MediaFolder
    {
        $this->assertOwner($user, $folder);

        if ($destination !== null) {
            $this->assertOwner($user, $destination);

            if ($destination->id === $folder->id || $this->isDescendant($folder, $destination)) {
                throw ValidationException::withMessages([
                    'parent_id' => 'A folder cannot be moved inside itself.',
                ]);
            }
        }

        $this->assertNameAvailable($user, $destination, $folder->name, $folder->id);

        $folder->forceFill(['parent_id' => $destination?->id])->save();

        return $folder;
    }

    public function delete(User $user, MediaFolder $folder): void
    {
        $this->assertOwner($user, $folder);

        // Child folders cascade away and every asset that pointed at any folder in
        // this subtree falls back to the library root (folder_id nullOnDelete).
        $folder->delete();
    }

    public function assertOwner(User $user, MediaFolder $folder): void
    {
        abort_unless((int) $folder->user_id === (int) $user->id, 403);
    }

    private function normalize(string $name): string
    {
        $name = trim(Str::squish($name));

        if ($name === '') {
            throw ValidationException::withMessages(['name' => 'A folder name is required.']);
        }

        return Str::limit($name, 120, '');
    }

    private function assertNameAvailable(User $user, ?MediaFolder $parent, string $name, ?int $exceptId = null): void
    {
        $taken = $user->mediaFolders()
            ->when(
                $parent === null,
                fn ($query) => $query->whereNull('parent_id'),
                fn ($query) => $query->where('parent_id', $parent->id),
            )
            ->where('name', $name);

        if ($exceptId !== null) {
            $taken->where('id', '!=', $exceptId);
        }

        if ($taken->exists()) {
            throw ValidationException::withMessages([
                'name' => 'A folder with that name already exists here.',
            ]);
        }
    }

    private function isDescendant(MediaFolder $folder, MediaFolder $candidate): bool
    {
        $cursor = $candidate;
        $guard = 0;

        while ($cursor !== null && $guard < 100) {
            if ((int) $cursor->id === (int) $folder->id) {
                return true;
            }

            $parentId = $cursor->parent_id;
            $cursor = $parentId === null ? null : MediaFolder::find($parentId);
            $guard++;
        }

        return false;
    }
}
