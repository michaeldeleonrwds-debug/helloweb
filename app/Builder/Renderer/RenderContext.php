<?php

namespace App\Builder\Renderer;

use App\Builder\Registry\ComponentRegistry;
use InvalidArgumentException;

final readonly class RenderContext
{
    /**
     * @param  array<string, mixed>  $options
     */
    public function __construct(
        private ComponentRegistry $componentRegistry,
        private ComponentRendererRegistry $rendererRegistry,
        private string $breakpoint = 'desktop',
        private array $options = [],
    ) {
        if (! in_array($this->breakpoint, ['desktop', 'tablet', 'mobile'], true)) {
            throw new InvalidArgumentException('Render breakpoint must be desktop, tablet, or mobile.');
        }
    }

    public function componentRegistry(): ComponentRegistry
    {
        return $this->componentRegistry;
    }

    public function rendererRegistry(): ComponentRendererRegistry
    {
        return $this->rendererRegistry;
    }

    public function breakpoint(): string
    {
        return $this->breakpoint;
    }

    /**
     * @return array<string, mixed>
     */
    public function options(): array
    {
        return $this->options;
    }
}
