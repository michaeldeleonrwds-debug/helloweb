<?php

namespace App\Builder\Renderer;

use App\Builder\Component\ComponentDefinition;

final class StyleResolver
{
    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>
     */
    public function resolve(array $node, ComponentDefinition $definition, string $breakpoint): array
    {
        $styles = [];

        foreach ([$definition->defaultStyles(), $node['styles'] ?? []] as $styleSource) {
            if (! is_array($styleSource)) {
                continue;
            }

            $styles = array_replace($styles, $styleSource['desktop'] ?? []);

            if ($breakpoint === 'tablet' || $breakpoint === 'mobile') {
                $styles = array_replace($styles, $styleSource['tablet'] ?? []);
            }

            if ($breakpoint === 'mobile') {
                $styles = array_replace($styles, $styleSource['mobile'] ?? []);
            }
        }

        $styles = (new EffectsComposer)->apply($styles);

        ksort($styles);

        return $styles;
    }
}
