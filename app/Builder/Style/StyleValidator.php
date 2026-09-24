<?php

namespace App\Builder\Style;

final class StyleValidator
{
    /** @return list<string> */
    public function validate(array $styles, string $path = 'styles'): array
    {
        $errors = [];
        foreach ($styles as $breakpoint => $properties) {
            if (! in_array($breakpoint, ['desktop', 'tablet', 'mobile'], true)) {
                $errors[] = "{$path} contains unsupported breakpoint {$breakpoint}.";

                continue;
            }
            if (! is_array($properties) || array_is_list($properties)) {
                $errors[] = "{$path}.{$breakpoint} must be an object.";

                continue;
            }
            foreach ($properties as $key => $value) {
                $definition = StyleSchema::definitions()[$key] ?? null;
                if (! $definition) {
                    $errors[] = "{$path}.{$breakpoint}.{$key} is not a supported style property.";

                    continue;
                }
                if (! $this->validValue($definition, $value)) {
                    $errors[] = "{$path}.{$breakpoint}.{$key} has an invalid value.";
                }
            }
        }

        return $errors;
    }

    private function validValue(StyleDefinition $definition, mixed $value): bool
    {
        return match ($definition->type) {
            'enum' => is_string($value) && in_array($value, $definition->options, true),
            'number' => is_int($value) || is_float($value) || (is_string($value) && preg_match('/^\d+$/', $value) === 1),
            'length' => is_int($value) || is_float($value) || $this->isStructuredLength($value) || (is_string($value) && preg_match('/^(auto|0|-?\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc))(\s+(auto|0|-?\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc))){0,3}$/', $value) === 1),
            'color' => is_string($value) && preg_match('/^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i', $value) === 1,
            'string' => is_string($value) || $value === null,
            default => false,
        };
    }

    private function isStructuredLength(mixed $value): bool
    {
        return is_array($value)
            && ! array_is_list($value)
            && (is_int($value['value'] ?? null) || is_float($value['value'] ?? null))
            && in_array($value['unit'] ?? null, ['px', 'rem', 'em', '%', 'vw', 'vh', 'vmin', 'vmax', 'ch', 'ex', 'cm', 'mm', 'in', 'pt', 'pc'], true);
    }
}
