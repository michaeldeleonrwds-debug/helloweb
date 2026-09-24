<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class ContainerRenderer implements ComponentRenderer
{
    public function __construct(
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        return new RenderResult(
            tag: 'div',
            attributes: NodeAttributes::for($node),
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            children: $children,
        );
    }
}
