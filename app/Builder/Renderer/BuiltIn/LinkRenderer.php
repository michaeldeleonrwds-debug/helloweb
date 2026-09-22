<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class LinkRenderer implements ComponentRenderer
{
    public function __construct(
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), $node['props']);

        return new RenderResult(
            tag: 'a',
            attributes: ['data-builder-id' => $node['id'], 'data-builder-type' => $node['type'], 'href' => (string) ($props['href'] ?? '#')],
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            text: (string) ($props['text'] ?? ''),
            children: $children,
        );
    }
}
