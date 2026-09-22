<?php

namespace App\Builder\Engine;

use InvalidArgumentException;

final readonly class TreeInsertPosition
{
    private const APPEND = 'append';

    private const BEFORE = 'before';

    private const AFTER = 'after';

    private function __construct(
        private string $mode,
        private ?string $siblingId = null,
    ) {
        if ($this->mode !== self::APPEND && $this->siblingId === null) {
            throw new InvalidArgumentException('Before and after positions require a sibling ID.');
        }
    }

    public static function append(): self
    {
        return new self(self::APPEND);
    }

    public static function before(string $siblingId): self
    {
        return new self(self::BEFORE, $siblingId);
    }

    public static function after(string $siblingId): self
    {
        return new self(self::AFTER, $siblingId);
    }

    public function mode(): string
    {
        return $this->mode;
    }

    public function siblingId(): ?string
    {
        return $this->siblingId;
    }

    public function indexFor(array $children): int
    {
        if ($this->mode === self::APPEND) {
            return count($children);
        }

        foreach ($children as $index => $child) {
            if (is_array($child) && ($child['id'] ?? null) === $this->siblingId) {
                return $this->mode === self::BEFORE ? $index : $index + 1;
            }
        }

        throw TreeOperationException::invalidPosition("Sibling node [{$this->siblingId}] was not found in the target parent.");
    }
}
