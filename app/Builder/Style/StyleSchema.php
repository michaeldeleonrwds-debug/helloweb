<?php

namespace App\Builder\Style;

final class StyleSchema
{
    /** @return array<string, StyleDefinition> */
    public static function definitions(): array
    {
        $length = static fn (string $key, string $label, string $group): StyleDefinition => new StyleDefinition($key, $label, $group, 'length');
        $enum = static fn (string $key, string $label, string $group, array $options): StyleDefinition => new StyleDefinition($key, $label, $group, 'enum', options: $options);
        $definitions = [
            $enum('display', 'Display', 'layout', ['block', 'inline', 'inline-block', 'flex', 'grid', 'none']), $length('width', 'Width', 'layout'), $length('height', 'Height', 'layout'),
            $length('minWidth', 'Minimum width', 'layout'), $length('maxWidth', 'Maximum width', 'layout'), $length('minHeight', 'Minimum height', 'layout'), $length('maxHeight', 'Maximum height', 'layout'),
            $length('margin', 'Margin', 'layout'), $length('padding', 'Padding', 'layout'), $length('paddingTop', 'Padding top', 'layout'), $length('paddingBottom', 'Padding bottom', 'layout'), $length('gap', 'Gap', 'layout'), $enum('gridTemplateColumns', 'Grid columns', 'layout', ['1fr', 'repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))']),
            $enum('flexDirection', 'Direction', 'flex', ['row', 'row-reverse', 'column', 'column-reverse']), $enum('justifyContent', 'Justify', 'flex', ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']), $enum('alignItems', 'Align', 'flex', ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']), $enum('flexWrap', 'Wrap', 'flex', ['nowrap', 'wrap', 'wrap-reverse']),
            $enum('position', 'Position', 'position', ['static', 'relative', 'absolute', 'fixed', 'sticky']), $length('top', 'Top', 'position'), $length('right', 'Right', 'position'), $length('bottom', 'Bottom', 'position'), $length('left', 'Left', 'position'), new StyleDefinition('zIndex', 'Z index', 'position', 'number'),
            new StyleDefinition('backgroundColor', 'Background color', 'background', 'color'), $length('borderWidth', 'Border width', 'border'), $enum('borderStyle', 'Border style', 'border', ['none', 'solid', 'dashed', 'dotted', 'double']), new StyleDefinition('borderColor', 'Border color', 'border', 'color'), $length('borderRadius', 'Border radius', 'border'), $enum('objectFit', 'Object fit', 'layout', ['contain', 'cover', 'fill', 'none']),
            new StyleDefinition('color', 'Color', 'text', 'color'), $length('fontSize', 'Font size', 'text'), new StyleDefinition('fontWeight', 'Font weight', 'text', 'number'), new StyleDefinition('lineHeight', 'Line height', 'text', 'number'), $enum('textAlign', 'Text align', 'text', ['left', 'center', 'right', 'justify']), $length('letterSpacing', 'Letter spacing', 'text'), $enum('textTransform', 'Text transform', 'text', ['none', 'uppercase', 'lowercase', 'capitalize']), $enum('textDecoration', 'Text decoration', 'text', ['none', 'underline', 'line-through']), new StyleDefinition('boxShadow', 'Shadow', 'border', 'enum', options: ['none', '0 1px 2px rgba(0,0,0,.08)', '0 8px 24px rgba(0,0,0,.12)']), new StyleDefinition('opacity', 'Opacity', 'background', 'number'),
        ];
        $result = [];
        foreach ($definitions as $definition) {
            $result[$definition->key] = $definition;
        }

        return $result;
    }
}
