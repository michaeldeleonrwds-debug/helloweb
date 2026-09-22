<?php

namespace App\Builder\Renderer;

use App\Builder\Renderer\BuiltIn\ContainerRenderer;
use App\Builder\Renderer\BuiltIn\HeadingRenderer;
use App\Builder\Renderer\BuiltIn\RootRenderer;
use App\Builder\Renderer\BuiltIn\SectionRenderer;

final class BuiltInRendererDefinitions
{
    /**
     * @return array<string, ComponentRenderer>
     */
    public static function all(): array
    {
        return [
            'layout.root' => new RootRenderer,
            'layout.section' => new SectionRenderer,
            'layout.container' => new ContainerRenderer,
            'content.heading' => new HeadingRenderer,
        ];
    }

    public static function registry(): ComponentRendererRegistry
    {
        return new ComponentRendererRegistry(self::all());
    }
}
