<?php

namespace App\Builder\Renderer;

use RuntimeException;

final class RendererException extends RuntimeException
{
    public static function unknownComponentType(string $type): self
    {
        return new self("Component type [{$type}] is not registered.");
    }

    public static function unknownRenderer(string $type): self
    {
        return new self("Renderer for component type [{$type}] is not registered.");
    }

    public static function duplicateRenderer(string $type): self
    {
        return new self("Renderer for component type [{$type}] is already registered.");
    }

    public static function invalidNode(string $message): self
    {
        return new self($message);
    }
}
