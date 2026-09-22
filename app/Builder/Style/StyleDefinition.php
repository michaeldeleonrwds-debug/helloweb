<?php

namespace App\Builder\Style;

final readonly class StyleDefinition
{
    /** @param list<string> $options */
    public function __construct(
        public string $key,
        public string $label,
        public string $group,
        public string $type,
        public bool $responsive = true,
        public mixed $default = null,
        public array $options = [],
    ) {}
}
