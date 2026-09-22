<?php

namespace App\Builder\Media;

use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;

final readonly class LaravelMediaStorage implements MediaStorage
{
    public function __construct(
        private FilesystemFactory $filesystem,
        private string $disk = 'public',
    ) {}

    public function store(string $key, string $contents, string $mimeType): void
    {
        $this->filesystem->disk($this->disk)->put($key, $contents, ['ContentType' => $mimeType]);
    }

    public function delete(string $key): void
    {
        $this->filesystem->disk($this->disk)->delete($key);
    }

    public function url(string $key): string
    {
        return $this->filesystem->disk($this->disk)->url($key);
    }
}
