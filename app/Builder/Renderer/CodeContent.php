<?php

namespace App\Builder\Renderer;

final class CodeContent
{
    public static function hasVisibleContent(string $html): bool
    {
        $remaining = preg_replace(
            [
                '/<!--[\s\S]*?-->/',
                '/<style\b[\s\S]*?<\/style>/i',
                '/<script\b[\s\S]*?<\/script>/i',
                '/<template\b[\s\S]*?<\/template>/i',
                '/<noscript\b[\s\S]*?<\/noscript>/i',
                '/<(?:meta|link|title|base|head|html|body)\b[^>]*>/i',
            ],
            '',
            $html,
        );

        $remaining = is_string($remaining) ? $remaining : $html;

        if (trim((string) preg_replace('/<[^>]+>/', '', $remaining)) !== '') {
            return true;
        }

        return preg_match('/<(?:img|video|audio|iframe|embed|object|canvas|svg|input|select|textarea|button|hr|table|picture|form)\b/i', $remaining) === 1;
    }
}
