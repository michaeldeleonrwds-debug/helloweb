<?php

namespace App\Builder\Renderer\BuiltIn;

final class TextColorSegments
{
    public static function render(mixed $value): ?string
    {
        if (! is_array($value) || $value === []) {
            return null;
        }

        $html = '';

        foreach ($value as $segment) {
            if (! is_array($segment)) {
                continue;
            }

            $text = $segment['text'] ?? null;
            $color = $segment['color'] ?? null;

            if (! is_string($text) || $text === '' || ! is_string($color) || ! self::isSafeColor($color)) {
                continue;
            }

            $html .= sprintf(
                '<span style="color: %s">%s</span>',
                htmlspecialchars($color, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            );
        }

        return $html === '' ? null : $html;
    }

    private static function isSafeColor(string $value): bool
    {
        return preg_match('/^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i', $value) === 1;
    }
}
