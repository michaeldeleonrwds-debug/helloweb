<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Renderer\ElementCustomCss;

final class NodeAttributes
{
    /** @return array<string, string> */
    public static function for(array $node, array $extra = []): array
    {
        $attributes = [
            'data-builder-id' => $node['id'],
            'data-builder-type' => $node['type'],
            ...$extra,
        ];

        $className = $node['metadata']['className'] ?? null;
        if (is_string($className) && trim($className) !== '') {
            $attributes['class'] = $className;
        }

        if (ElementCustomCss::read($node) !== null) {
            $attributes[ElementCustomCss::SCOPE_ATTRIBUTE] = $node['id'];
        }

        return $attributes;
    }
}
