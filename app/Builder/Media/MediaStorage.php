<?php

namespace App\Builder\Media;

interface MediaStorage
{
    public function store(string $key, string $contents, string $mimeType): void;

    public function delete(string $key): void;

    public function url(string $key): string;
}
