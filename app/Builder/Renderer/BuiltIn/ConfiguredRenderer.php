<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class ConfiguredRenderer implements ComponentRenderer
{
    public function __construct(
        private string $tag,
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        return new RenderResult(
            tag: $this->tag,
            attributes: $this->attributes($node),
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            children: $children,
        );
    }

    /** @return array<string, string> */
    private function attributes(array $node): array
    {
        return ['data-builder-id' => $node['id'], 'data-builder-type' => $node['type']];
    }
}
