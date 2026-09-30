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

        $hasIndividualCornerRadius = isset($styles['borderTopLeftRadius'])
            || isset($styles['borderTopRightRadius'])
            || isset($styles['borderBottomRightRadius'])
            || isset($styles['borderBottomLeftRadius']);

        if ($hasIndividualCornerRadius && isset($styles['borderRadius'])) {
            unset($styles['borderRadius']);
        }

        $hasIndividualBorderWidth = isset($styles['borderTopWidth'])
            || isset($styles['borderRightWidth'])
            || isset($styles['borderBottomWidth'])
            || isset($styles['borderLeftWidth']);

        if ($hasIndividualBorderWidth && isset($styles['borderWidth'])) {
            unset($styles['borderWidth']);
        }

        $styles = (new EffectsComposer)->apply($styles);

        ksort($styles);

        return $styles;
    }
}
