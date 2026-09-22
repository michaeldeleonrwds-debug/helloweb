<?php

namespace App\Builder\Engine;

use RuntimeException;

final class TreeOperationException extends RuntimeException
{
    public static function nodeNotFound(string $nodeId): self
    {
        return new self("Node [{$nodeId}] was not found.");
    }

    public static function parentNotFound(string $parentId): self
    {
        return new self("Parent node [{$parentId}] was not found.");
    }

    public static function invalidComponentType(string $type): self
    {
        return new self("Component type [{$type}] is not registered.");
    }

    public static function invalidChildRelationship(string $parentType, string $childType): self
    {
        return new self("Component type [{$parentType}] cannot accept child type [{$childType}].");
    }

    public static function invalidPosition(string $message): self
    {
        return new self($message);
    }

    public static function invalidRootOperation(string $operation): self
    {
        return new self("Cannot {$operation} the document root.");
    }

    public static function duplicateIdGenerated(string $nodeId): self
    {
        return new self("Generated duplicate node ID [{$nodeId}].");
    }

    public static function invalidProp(string $nodeType, string $propName, string $message): self
    {
        return new self("Invalid prop [{$propName}] for component [{$nodeType}]: {$message}");
    }

    public static function invalidStyle(string $nodeType, string $styleName, string $message): self
    {
        return new self("Invalid style [{$styleName}] for component [{$nodeType}]: {$message}");
    }
}
