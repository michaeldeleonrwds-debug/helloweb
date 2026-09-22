<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RendererException;
use App\Builder\Renderer\RenderResult;

final class ReusableInstanceRenderer implements ComponentRenderer
{
    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        throw RendererException::invalidNode('Reusable component references must be resolved before rendering.');
    }
}
