<?php

namespace App\Builder\Renderer;

final class ElementCustomCss
{
    public const SCOPE_ATTRIBUTE = 'data-builder-css-scope';

    /** @param array<string, mixed> $node */
    public static function read(array $node): ?string
    {
        $css = $node['metadata']['customCss'] ?? null;

        if (! is_string($css) || trim($css) === '') {
            return null;
        }

        return $css;
    }

    public static function selector(string $nodeId): string
    {
        $escaped = str_replace(['\\', '"'], ['\\\\', '\\"'], $nodeId);

        return sprintf('[%s="%s"]', self::SCOPE_ATTRIBUTE, $escaped);
    }

    public static function wrap(string $nodeId, string $css): string
    {
        return sprintf("%s {\n%s\n}", self::selector($nodeId), $css);
    }
}
