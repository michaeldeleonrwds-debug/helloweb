<?php

namespace App\Builder\Registry;

use App\Builder\Component\ComponentDefinition;
use InvalidArgumentException;

final class ComponentRegistry
{
    /**
     * @var array<string, ComponentDefinition>
     */
    private array $definitions = [];

    /**
     * @param  iterable<ComponentDefinition>  $definitions
     */
    public function __construct(iterable $definitions = [])
    {
        foreach ($definitions as $definition) {
            $this->register($definition);
        }
    }

    public function register(ComponentDefinition $definition): self
    {
        if ($this->has($definition->type())) {
            throw new InvalidArgumentException("Component type [{$definition->type()}] is already registered.");
        }

        $this->definitions[$definition->type()] = $definition;

        return $this;
    }

    public function has(string $type): bool
    {
        return isset($this->definitions[$type]);
    }

    public function get(string $type): ComponentDefinition
    {
        if (! $this->has($type)) {
            throw new InvalidArgumentException("Component type [{$type}] is not registered.");
        }

        return $this->definitions[$type];
    }

    /**
     * @return array<string, ComponentDefinition>
     */
    public function all(): array
    {
        return $this->definitions;
    }
}
