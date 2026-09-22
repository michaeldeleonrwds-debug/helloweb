<?php

namespace App\Builder\Media;

use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Support\Str;

final readonly class MediaAssetService
{
    public function __construct(
        private MediaStorage $storage,
    ) {}

    /** @param array<string, mixed> $metadata */
    public function store(User $user, string $originalFilename, string $mimeType, string $contents, array $metadata = []): MediaAsset
    {
        $extension = pathinfo($originalFilename, PATHINFO_EXTENSION);
        $key = 'builder/'.$user->id.'/'.Str::uuid().($extension === '' ? '' : '.'.strtolower($extension));
        $this->storage->store($key, $contents, $mimeType);

        try {
            return $user->mediaAssets()->create([
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

    public function archive(User $user, MediaAsset $asset): void
    {
        $this->assertOwner($user, $asset);
        $asset->forceFill(['status' => 'archived'])->save();
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
