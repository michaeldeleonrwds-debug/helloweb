<?php

namespace App\Builder\Document;

final class BuilderDocumentSchema
{
    public const VERSION = 1;

    public const BREAKPOINTS = [
        'desktop',
        'tablet',
        'mobile',
    ];

    public static function supports(int $version): bool
    {
        return $version === self::VERSION;
    }
}
