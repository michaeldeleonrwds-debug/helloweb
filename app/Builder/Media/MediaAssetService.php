<?php

namespace App\Builder\Media;

use App\Models\MediaAsset;
use App\Models\MediaFolder;
use App\Models\User;
use Illuminate\Support\Str;

final readonly class MediaAssetService
{
    public function __construct(
        private MediaStorage $storage,
        private MediaFolderService $folders = new MediaFolderService,
    ) {}

    /** @param array<string, mixed> $metadata */
    public function store(User $user, string $originalFilename, string $mimeType, string $contents, array $metadata = [], ?MediaFolder $folder = null): MediaAsset
    {
        if ($folder !== null) {
            $this->folders->assertOwner($user, $folder);
        }

        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION);
        $key = 'builder/'.$user->id.'/'.Str::uuid().($extension === '' ? '' : '.'.strtolower($extension));
        $this->storage->store($key, $contents, $mimeType);

        try {
            return $user->mediaAssets()->create([
                'folder_id' => $folder?->id,
                'original_filename' => $originalFilename,
                'storage_disk' => 'public',
                'storage_key' => $key,
                'mime_type' => $mimeType,
                'file_size' => strlen($contents),
                'width' => $metadata['width'] ?? null,
                'height' => $metadata['height'] ?? null,
                'alt_text' => $metadata['altText'] ?? null,
                'metadata' => $metadata,
                'status' => 'active',
            ]);
        } catch (\Throwable $exception) {
            $this->storage->delete($key);
            throw $exception;
        }
    }

    /**
     * Apply any subset of the editable fields. `folder_id` must be present in
     * `$data` (even when null) for the asset to be moved.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, MediaAsset $asset, array $data): MediaAsset
    {
        $this->assertOwner($user, $asset);

        $changes = [];

        if (array_key_exists('original_filename', $data)) {
            $name = trim((string) ($data['original_filename'] ?? ''));
            if ($name !== '') {
                $changes['original_filename'] = $name;
            }
        }

        if (array_key_exists('alt_text', $data)) {
            $changes['alt_text'] = $data['alt_text'] !== null ? trim((string) $data['alt_text']) : null;
        }

        if (array_key_exists('folder_id', $data)) {
            $folder = null;
            if ($data['folder_id'] !== null) {
                $folder = MediaFolder::where('user_id', $user->id)->find($data['folder_id']);
                abort_unless($folder instanceof MediaFolder, 422, 'That folder no longer exists.');
            }
            $changes['folder_id'] = $folder?->id;
        }

        if ($changes !== []) {
            $asset->forceFill($changes)->save();
        }

        return $asset->refresh();
    }

    public function archive(User $user, MediaAsset $asset): void
    {
        $this->assertOwner($user, $asset);
        $asset->forceFill(['status' => 'archived'])->save();
    }

    public function restore(User $user, MediaAsset $asset): MediaAsset
    {
        $this->assertOwner($user, $asset);
        $asset->forceFill(['status' => 'active'])->save();

        return $asset;
    }

    public function destroy(User $user, MediaAsset $asset): void
    {
        $this->assertOwner($user, $asset);
        $this->storage->delete($asset->storage_key);
        $asset->delete();
    }

    public function reference(User $user, MediaAsset $asset): StoredMediaReference
    {
        $this->assertOwner($user, $asset);

        return new StoredMediaReference($asset->id, $asset->mime_type, $this->storage->url($asset->storage_key), $asset->alt_text);
    }

    public function assertOwner(User $user, MediaAsset $asset): void
    {
        abort_unless((int) $asset->user_id === (int) $user->id, 403);
    }
}
