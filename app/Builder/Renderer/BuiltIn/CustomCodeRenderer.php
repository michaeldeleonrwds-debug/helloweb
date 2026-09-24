<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\CodeContent;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\ElementCustomCss;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;

final readonly class CustomCodeRenderer implements ComponentRenderer
{
    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $code = is_string($node['props']['code'] ?? null) ? $node['props']['code'] : '';
        $className = $node['metadata']['className'] ?? null;
        $stylableWrapper = (is_string($className) && trim($className) !== '')
            || ElementCustomCss::read($node) !== null;

        return new RenderResult(
            tag: 'div',
            attributes: NodeAttributes::for($node),
            styles: $stylableWrapper || CodeContent::hasVisibleContent($code) ? [] : ['display' => 'contents'],
            html: $code,
        );
    }
}
