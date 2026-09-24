<?php

namespace App\Builder\Persistence;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Document\BuilderDocument;
use App\Builder\Registry\ComponentRegistry;
use InvalidArgumentException;

final readonly class DocumentPersistenceValidator
{
    public function __construct(
        private ComponentRegistry $registry,
    ) {}

    /** @param array<string, mixed> $data */
    public function validate(array $data): BuilderDocument
    {
        $document = BuilderDocument::fromArray($this->normalizeLegacyComposition($data));
        $this->validateNode($document->toArray()['root']);

        return $document;
    }

    /**
     * Legacy pages used Section -> Container (or direct content). Preserve their
     * content while upgrading the persisted shape to Section -> Row -> Column.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeLegacyComposition(array $data): array
    {
        $root = $data['root'] ?? null;
        if (! is_array($root)) {
            return $data;
        }

        $data['root'] = $this->normalizeNode($root);

        return $data;
    }

    /** @param array<string, mixed> $node */
    private function normalizeNode(array $node): array
    {
        if (($node['type'] ?? null) === 'code.customcss') {
            $node['type'] = 'code.customcode';
        }

        $children = array_map(fn (array $child): array => $this->normalizeNode($child), $node['children'] ?? []);

        if (($node['type'] ?? null) === 'layout.column') {
            $children = array_map(function (array $child): array {
                if (($child['type'] ?? null) === 'layout.row') {
                    $child['type'] = 'layout.flex';
                    unset($child['props']['fullWidth']);
                }

                return $child;
            }, $children);
        }

        if (($node['type'] ?? null) === 'layout.flex') {
            unset($node['props']['fullWidth']);
        }

        if (($node['type'] ?? null) === 'media.image' && is_array($node['props'] ?? null)) {
            $node['props']['src'] ??= '';
            $node['props']['alt'] ??= '';
        }

        foreach ($node['styles'] ?? [] as $breakpoint => $styles) {
            if (! is_array($styles) || ! array_key_exists('backgroundImage', $styles)) {
                continue;
            }

            if (is_array($styles['backgroundImage'])) {
                $node['styles'][$breakpoint]['backgroundImage'] = $styles['backgroundImage']['src']
                    ?? $styles['backgroundImage']['url']
                    ?? '';
            } elseif ($styles['backgroundImage'] !== null && ! is_string($styles['backgroundImage'])) {
                $node['styles'][$breakpoint]['backgroundImage'] = is_scalar($styles['backgroundImage'])
                    ? (string) $styles['backgroundImage']
                    : '';
            }
        }

        if (($node['type'] ?? null) === 'layout.root') {
            $node['children'] = array_map(function (array $child, int $index): array {
                if (($child['type'] ?? null) === 'layout.section') {
                    return $child;
                }

                return [
                    'id' => $child['id'].'-migration-section-'.$index,
                    'type' => 'layout.section',
                    'props' => [],
                    'styles' => [],
                    'children' => [[
                        'id' => $child['id'].'-migration-row-'.$index,
                        'type' => 'layout.row',
                        'props' => [],
                        'styles' => [],
                        'children' => [[
                            'id' => $child['id'].'-migration-column-'.$index,
                            'type' => 'layout.column',
                            'props' => [],
                            'styles' => [],
                            'children' => [$child],
                            'metadata' => [],
                        ]],
                        'metadata' => [],
                    ]],
                    'metadata' => [],
                ];
            }, $children, array_keys($children));

            return $node;
        }

        if (($node['type'] ?? null) !== 'layout.section') {
            $node['children'] = $children;

            return $node;
        }

        $allowedTypes = $this->registry->get('layout.section')->childRules()['allowedTypes'] ?? [];

        $node['children'] = array_map(function (array $child, int $index) use ($allowedTypes): array {
            $child = $this->unwrapMigrationWrapper($child, $allowedTypes);

            if (in_array($child['type'] ?? null, $allowedTypes, true)) {
                return $child;
            }

            return [
                'id' => $child['id'].'-migration-row-'.$index,
                'type' => 'layout.row',
                'props' => [],
                'styles' => [],
                'children' => [[
                    'id' => $child['id'].'-migration-column-'.$index,
                    'type' => 'layout.column',
                    'props' => [],
                    'styles' => [],
                    'children' => [$child],
                    'metadata' => [],
                ]],
                'metadata' => [],
            ];
        }, $children, array_keys($children));

        return $node;
    }

    /**
     * @param  array<string, mixed>  $child
     * @param  array<int, string>  $allowedTypes
     * @return array<string, mixed>
     */
    private function unwrapMigrationWrapper(array $child, array $allowedTypes): array
    {
        $current = $child;
        $peeled = false;

        while (
            str_contains($current['id'] ?? '', '-migration-')
            && count($current['children'] ?? []) === 1
            && ($current['props'] ?? []) === []
            && ($current['styles'] ?? []) === []
        ) {
            $current = $current['children'][0];
            $peeled = true;
        }

        if ($peeled && in_array($current['type'] ?? null, $allowedTypes, true)) {
            return $current;
        }

        return $child;
    }

    /** @param array<string, mixed> $node */
    private function validateNode(array $node): void
    {
        $type = $node['type'];

        if (! is_string($type) || ! $this->registry->has($type)) {
            throw new InvalidArgumentException("Component type [{$type}] is not registered.");
        }

        $definition = $this->registry->get($type);
        $this->validateProps($node['props'], $definition);

        if (array_key_exists('reusableReference', $node)) {
            $reference = $node['reusableReference'];
            if (! is_array($reference) || ($reference['type'] ?? null) !== 'reusable-component' || ! isset($reference['id']) || ! is_int($reference['id']) || $reference['id'] < 1) {
                throw new InvalidArgumentException("Node [{$node['id']}] has an invalid reusable component reference.");
            }
            if ($type !== 'reusable.instance') {
                throw new InvalidArgumentException("Node [{$node['id']}] cannot carry a reusable component reference.");
            }
        }
        if ($type === 'reusable.instance' && ! array_key_exists('reusableReference', $node)) {
            throw new InvalidArgumentException("Node [{$node['id']}] is missing a reusable component reference.");
        }

        $allowedTypes = $definition->childRules()['allowedTypes'] ?? [];
        foreach ($node['children'] as $child) {
            if (! in_array($child['type'] ?? null, $allowedTypes, true)) {
                throw new InvalidArgumentException("Component type [{$type}] cannot accept child type [{$child['type']}].");
            }
        }

        foreach ($node['styles'] as $properties) {
            if (! is_array($properties)) {
                continue;
            }

            foreach ($properties as $key => $_value) {
                $supportsShorthand = str_starts_with($key, 'margin')
                    ? in_array('margin', $definition->styleCapabilities(), true)
                    : (str_starts_with($key, 'padding')
                        ? in_array('padding', $definition->styleCapabilities(), true)
                        : (str_starts_with($key, 'border') && str_ends_with($key, 'Width')
                            ? in_array('borderWidth', $definition->styleCapabilities(), true)
                            : str_starts_with($key, 'border') && str_ends_with($key, 'Radius') && in_array('borderRadius', $definition->styleCapabilities(), true)));
                if (! in_array($key, $definition->styleCapabilities(), true) && ! $supportsShorthand) {
                    throw new InvalidArgumentException("Style property [{$key}] is not supported by component [{$type}].");
                }
            }
        }

        foreach ($node['children'] as $child) {
            $this->validateNode($child);
        }
    }

    /** @param array<string, mixed> $props */
    private function validateProps(array $props, ComponentDefinition $definition): void
    {
        foreach ($props as $name => $value) {
            $schema = $definition->propSchema()[$name] ?? null;

            if (! is_array($schema)) {
                throw new InvalidArgumentException("Property [{$name}] is not supported by component [{$definition->type()}].");
            }

            $type = $schema['type'] ?? null;
            if ($type === 'string' && ! is_string($value)) {
                throw new InvalidArgumentException("Property [{$name}] must be a string.");
            }
            if ($type === 'boolean' && ! is_bool($value)) {
                throw new InvalidArgumentException("Property [{$name}] must be a boolean.");
            }
            if ($type === 'integer' && ! is_int($value)) {
                throw new InvalidArgumentException("Property [{$name}] must be an integer.");
            }
            if ($type === 'array' && ! is_array($value)) {
                throw new InvalidArgumentException("Property [{$name}] must be an array.");
            }
            if (isset($schema['min']) && is_int($value) && $value < $schema['min']) {
                throw new InvalidArgumentException("Property [{$name}] is below its minimum.");
            }
            if (isset($schema['max']) && is_int($value) && $value > $schema['max']) {
                throw new InvalidArgumentException("Property [{$name}] is above its maximum.");
            }
            if (isset($schema['values']) && is_array($schema['values']) && ! in_array($value, $schema['values'], true)) {
                throw new InvalidArgumentException("Property [{$name}] has an unsupported value.");
            }
        }
    }
}
