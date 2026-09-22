<?php

namespace App\Builder\Renderer;

use App\Builder\Renderer\BuiltIn\ConfiguredRenderer;
use App\Builder\Renderer\BuiltIn\ContainerRenderer;
use App\Builder\Renderer\BuiltIn\HeadingRenderer;
use App\Builder\Renderer\BuiltIn\ImageRenderer;
use App\Builder\Renderer\BuiltIn\LinkRenderer;
use App\Builder\Renderer\BuiltIn\ReusableInstanceRenderer;
use App\Builder\Renderer\BuiltIn\RootRenderer;
use App\Builder\Renderer\BuiltIn\SectionRenderer;
use App\Builder\Renderer\BuiltIn\TextContentRenderer;

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
            'layout.stack' => new ConfiguredRenderer('div'),
            'layout.flex' => new ConfiguredRenderer('div'),
            'layout.grid' => new ConfiguredRenderer('div'),
            'layout.columns' => new ConfiguredRenderer('div'),
            'layout.spacer' => new ConfiguredRenderer('div'),
            'layout.divider' => new ConfiguredRenderer('hr'),
            'content.text' => new TextContentRenderer,
            'content.richtext' => new TextContentRenderer,
            'content.button' => new LinkRenderer,
            'content.link' => new LinkRenderer,
            'media.image' => new ImageRenderer,
            'marketing.card' => new ConfiguredRenderer('article'),
            'reusable.instance' => new ReusableInstanceRenderer,
        ];
    }

    public static function registry(): ComponentRendererRegistry
    {
        return new ComponentRendererRegistry(self::all());
    }
}
