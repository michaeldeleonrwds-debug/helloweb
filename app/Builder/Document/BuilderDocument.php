<?php

namespace App\Builder\Document;

use InvalidArgumentException;
use JsonException;

final readonly class BuilderDocument
{
    /**
     * @param  array<string, mixed>  $data
     */
    private function __construct(
        private array $data,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $validation = (new BuilderDocumentValidator)->validate($data);

        if ($validation->fails()) {
            throw new InvalidArgumentException(implode(' ', $validation->errors()));
        }

        return new self($data);
    }

    /**
     * @throws JsonException
     */
    public static function fromJson(string $json): self
    {
        $decoded = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($decoded)) {
            throw new InvalidArgumentException('Builder document JSON must decode to an object.');
        }

        return self::fromArray($decoded);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->data;
    }

    /**
     * @throws JsonException
     */
    public function toJson(): string
    {
        return json_encode($this->data, JSON_THROW_ON_ERROR);
    }

    public function schemaVersion(): int
    {
        return $this->data['schemaVersion'];
    }
}
