<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class TextContentRenderer implements ComponentRenderer
{
    public function __construct(
        private string $tag = 'p',
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), $node['props']);
        $colorSegments = TextColorSegments::render($props['colorSegments'] ?? null);

        return new RenderResult(
            tag: $this->tag,
            attributes: NodeAttributes::for($node),
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            text: $colorSegments === null ? (string) ($props['text'] ?? '') : null,
            html: $colorSegments,
            children: $children,
        );
    }
}
