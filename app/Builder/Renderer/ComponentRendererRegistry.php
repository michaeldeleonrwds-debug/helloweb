<?php

namespace App\Builder\Renderer;

final class ComponentRendererRegistry
{
    /**
     * @var array<string, ComponentRenderer>
     */
    private array $renderers = [];

    /**
     * @param  iterable<string, ComponentRenderer>  $renderers
     */
    public function __construct(iterable $renderers = [])
    {
        foreach ($renderers as $type => $renderer) {
            $this->register($type, $renderer);
        }
    }

    public function register(string $type, ComponentRenderer $renderer): self
    {
        if ($this->has($type)) {
            throw RendererException::duplicateRenderer($type);
        }

        $this->renderers[$type] = $renderer;

        return $this;
    }

    public function has(string $type): bool
    {
        return isset($this->renderers[$type]);
    }

    public function get(string $type): ComponentRenderer
    {
        if (! $this->has($type)) {
            throw RendererException::unknownRenderer($type);
        }

        return $this->renderers[$type];
    }

    /**
     * @return array<string, ComponentRenderer>
     */
    public function all(): array
    {
        return $this->renderers;
    }
}
