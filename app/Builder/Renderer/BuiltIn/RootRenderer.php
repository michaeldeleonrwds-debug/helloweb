<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;

final class RootRenderer implements ComponentRenderer
{
    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        return RenderResult::fragment($children);
    }
}
