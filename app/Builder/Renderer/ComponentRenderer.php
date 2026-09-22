<?php

namespace App\Builder\Renderer;

use App\Builder\Component\ComponentDefinition;

interface ComponentRenderer
{
    /**
     * @param  array<string, mixed>  $node
     * @param  list<RenderResult>  $children
     */
    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult;
}
