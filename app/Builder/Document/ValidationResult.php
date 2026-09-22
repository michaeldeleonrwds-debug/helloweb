<?php

namespace App\Builder\Document;

final readonly class ValidationResult
{
    /**
     * @param list<string> $errors
     */
    public function __construct(
        private array $errors = [],
    ) {
    }

    public function passes(): bool
    {
        return $this->errors === [];
    }

    public function fails(): bool
    {
        return ! $this->passes();
    }

    /**
     * @return list<string>
     */
    public function errors(): array
    {
        return $this->errors;
    }
}
