<?php

namespace App\Builder\Media;

final readonly class StoredMediaReference
{
    public function __construct(
        public int $id,
        public string $mimeType,
        public string $url,
        public ?string $altText = null,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'type' => 'media-asset',
            'id' => $this->id,
            'mimeType' => $this->mimeType,
            'url' => $this->url,
            'altText' => $this->altText,
        ];
    }
}
