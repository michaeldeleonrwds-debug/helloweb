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
     * @param array<string, mixed> $data
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
        $children = array_map(fn (array $child): array => $this->normalizeNode($child), $node['children'] ?? []);

        if (($node['type'] ?? null) !== 'layout.section') {
            $node['children'] = $children;

            return $node;
        }

        $node['children'] = array_map(function (array $child, int $index): array {
            if (($child['type'] ?? null) === 'layout.row') {
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
                if (! in_array($key, $definition->styleCapabilities(), true)) {
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
            if ($type === 'integer' && ! is_int($value)) {
                throw new InvalidArgumentException("Property [{$name}] must be an integer.");
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
