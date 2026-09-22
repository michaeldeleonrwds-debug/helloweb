<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RendererException;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class HeadingRenderer implements ComponentRenderer
{
    public function __construct(
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), $node['props']);
        $level = $props['level'] ?? 2;

        if (! is_int($level) || $level < 1 || $level > 6) {
            throw RendererException::invalidNode('Heading level must be an integer between 1 and 6.');
        }

        return new RenderResult(
            tag: "h{$level}",
            attributes: [
                'data-builder-id' => $node['id'],
                'data-builder-type' => $node['type'],
            ],
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            text: (string) ($props['text'] ?? ''),
        );
    }
}
