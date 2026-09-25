<?php

namespace App\Builder\Engine;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Registry\ComponentRegistry;
use App\Builder\Style\StyleValidator;

final readonly class ComponentTreeEngine
{
    /**
     * @param  list<string>  $rootAllowedTypes
     */
    public function __construct(
        private ComponentRegistry $registry,
        private NodeIdGenerator $idGenerator = new SequentialNodeIdGenerator,
        private array $rootAllowedTypes = ['layout.section', 'layout.navbar'],
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function find(BuilderDocument $document, string $nodeId): ?array
    {
        return $this->findInNode($document->toArray()['root'], $nodeId);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findParent(BuilderDocument $document, string $nodeId): ?array
    {
        $root = $document->toArray()['root'];

        if (($root['id'] ?? null) === $nodeId) {
            return null;
        }

        return $this->findParentInNode($root, $nodeId);
    }

    /**
     * @param  array<string, mixed>  $node
     */
    public function insert(
        BuilderDocument $document,
        string $parentId,
        array $node,
        ?TreeInsertPosition $position = null,
    ): BuilderDocument {
        $data = $document->toArray();
        $position ??= TreeInsertPosition::append();
        $existingIds = $this->collectIds($data['root']);

        $this->assertNodeCanBeInserted($data, $parentId, $node, $existingIds);

        $inserted = $this->insertIntoNode($data['root'], $parentId, $node, $position);

        if (! $inserted) {
            throw TreeOperationException::parentNotFound($parentId);
        }

        return BuilderDocument::fromArray($data);
    }

    public function remove(BuilderDocument $document, string $nodeId): BuilderDocument
    {
        $data = $document->toArray();

        if (($data['root']['id'] ?? null) === $nodeId) {
            throw TreeOperationException::invalidRootOperation('remove');
        }

        $removed = $this->removeFromNode($data['root'], $nodeId);

        if (! $removed) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }

        return BuilderDocument::fromArray($data);
    }

    public function move(
        BuilderDocument $document,
        string $nodeId,
        string $newParentId,
        ?TreeInsertPosition $position = null,
    ): BuilderDocument {
        $data = $document->toArray();
        $position ??= TreeInsertPosition::append();

        if (($data['root']['id'] ?? null) === $nodeId) {
            throw TreeOperationException::invalidRootOperation('move');
        }

        $node = $this->findInNode($data['root'], $nodeId);

        if ($node === null) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }

        if ($position->mode() !== 'append' && $position->siblingId() === $nodeId) {
            throw TreeOperationException::invalidPosition('A node cannot be moved before or after itself.');
        }

        if ($this->findInNode($node, $newParentId) !== null) {
            throw TreeOperationException::invalidChildRelationship($node['type'], $newParentId);
        }

        if ($this->findInNode($data['root'], $newParentId) === null) {
            throw TreeOperationException::parentNotFound($newParentId);
        }

        $this->assertParentAccepts($data, $newParentId, $node['type']);
        $this->removeFromNode($data['root'], $nodeId);

        $inserted = $this->insertIntoNode($data['root'], $newParentId, $node, $position);

        if (! $inserted) {
            throw TreeOperationException::parentNotFound($newParentId);
        }

        return BuilderDocument::fromArray($data);
    }

    public function duplicate(BuilderDocument $document, string $nodeId): BuilderDocument
    {
        $data = $document->toArray();

        if (($data['root']['id'] ?? null) === $nodeId) {
            throw TreeOperationException::invalidRootOperation('duplicate');
        }

        $node = $this->findInNode($data['root'], $nodeId);

        if ($node === null) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }

        $parent = $this->findParentInNode($data['root'], $nodeId);

        if ($parent === null) {
            throw TreeOperationException::invalidRootOperation('duplicate');
        }

        $existingIds = $this->collectIds($data['root']);
        $duplicate = $this->duplicateNode($node, $existingIds);

        $inserted = $this->insertIntoNode($data['root'], $parent['id'], $duplicate, TreeInsertPosition::after($nodeId));

        if (! $inserted) {
            throw TreeOperationException::parentNotFound($parent['id']);
        }

        return BuilderDocument::fromArray($data);
    }

    /**
     * @param  array<string, mixed>  $patch
     */
    public function updateProps(BuilderDocument $document, string $nodeId, array $patch): BuilderDocument
    {
        $data = $document->toArray();
        $node = $this->findInNode($data['root'], $nodeId);

        if ($node === null) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }

        $definition = $this->registry->get($node['type']);

        foreach ($patch as $name => $value) {
            $schema = $definition->propSchema()[$name] ?? null;

            if (! is_array($schema)) {
                throw TreeOperationException::invalidProp($node['type'], $name, 'property is not editable.');
            }

            $this->assertValidProp($node['type'], $name, $value, $schema);
        }

        $this->updateNodeProps($data['root'], $nodeId, $patch);

        return BuilderDocument::fromArray($data);
    }

    /** @param array<string, mixed> $patch */
    public function updateStyles(BuilderDocument $document, string $nodeId, string $breakpoint, array $patch): BuilderDocument
    {
        if (! in_array($breakpoint, BuilderDocumentSchema::BREAKPOINTS, true)) {
            throw TreeOperationException::invalidStyle('', $breakpoint, 'breakpoint is not supported.');
        }
        $data = $document->toArray();
        $node = $this->findInNode($data['root'], $nodeId);
        if ($node === null) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }
        $definition = $this->registry->get($node['type']);
        foreach ((new StyleValidator)->validate([$breakpoint => $patch], 'styles') as $error) {
            throw TreeOperationException::invalidStyle($node['type'], 'patch', $error);
        }
        foreach ($patch as $key => $_value) {
            if (! in_array($key, $definition->styleCapabilities(), true)) {
                throw TreeOperationException::invalidStyle($node['type'], $key, 'property is not supported.');
            }
        }
        $this->updateNodeStyles($data['root'], $nodeId, $breakpoint, $patch);

        return BuilderDocument::fromArray($data);
    }

    public function clearStyleOverride(BuilderDocument $document, string $nodeId, string $breakpoint, string $key): BuilderDocument
    {
        $data = $document->toArray();
        $node = $this->findInNode($data['root'], $nodeId);
        if ($node === null) {
            throw TreeOperationException::nodeNotFound($nodeId);
        }
        if (isset($node['styles'][$breakpoint])) {
            unset($node['styles'][$breakpoint][$key]);
            if ($node['styles'][$breakpoint] === []) {
                unset($node['styles'][$breakpoint]);
            }
        }
        $this->replaceNode($data['root'], $nodeId, $node);

        return BuilderDocument::fromArray($data);
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>|null
     */
    private function findInNode(array $node, string $nodeId): ?array
    {
        if (($node['id'] ?? null) === $nodeId) {
            return $node;
        }

        foreach (($node['children'] ?? []) as $child) {
            if (! is_array($child)) {
                continue;
            }

            $found = $this->findInNode($child, $nodeId);

            if ($found !== null) {
                return $found;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>|null
     */
    private function findParentInNode(array $node, string $nodeId): ?array
    {
        foreach (($node['children'] ?? []) as $child) {
            if (! is_array($child)) {
                continue;
            }

            if (($child['id'] ?? null) === $nodeId) {
                return $node;
            }

            $found = $this->findParentInNode($child, $nodeId);

            if ($found !== null) {
                return $found;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $document
     * @param  array<string, mixed>  $node
     * @param  array<string, true>  $existingIds
     */
    private function assertNodeCanBeInserted(array $document, string $parentId, array $node, array $existingIds): void
    {
        $this->assertNodeTreeIsInsertable($node, $existingIds);
        $this->assertParentAccepts($document, $parentId, $node['type']);
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, true>  $existingIds
     */
    private function assertNodeTreeIsInsertable(array $node, array &$existingIds): void
    {
        if (! isset($node['type']) || ! is_string($node['type']) || ! $this->registry->has($node['type'])) {
            throw TreeOperationException::invalidComponentType((string) ($node['type'] ?? ''));
        }

        if (! isset($node['id']) || ! is_string($node['id']) || isset($existingIds[$node['id']])) {
            throw TreeOperationException::duplicateIdGenerated((string) ($node['id'] ?? ''));
        }

        $existingIds[$node['id']] = true;

        foreach (($node['children'] ?? []) as $child) {
            if (! is_array($child)) {
                continue;
            }

            $allowedTypes = $this->registry->get($node['type'])->childRules()['allowedTypes'] ?? [];
            $childType = $child['type'] ?? '';

            if (! is_string($childType) || ! is_array($allowedTypes) || ! in_array($childType, $allowedTypes, true)) {
                throw TreeOperationException::invalidChildRelationship($node['type'], (string) $childType);
            }

            $this->assertNodeTreeIsInsertable($child, $existingIds);
        }
    }

    /**
     * @param  array<string, mixed>  $document
     */
    private function assertParentAccepts(array $document, string $parentId, string $childType): void
    {
        $parent = $this->findInNode($document['root'], $parentId);

        if ($parent === null) {
            throw TreeOperationException::parentNotFound($parentId);
        }

        $parentType = $parent['type'];

        if ($parentId === $document['root']['id']) {
            if (! in_array($childType, $this->rootAllowedTypes, true)) {
                throw TreeOperationException::invalidChildRelationship($parentType, $childType);
            }

            return;
        }

        if (! is_string($parentType) || ! $this->registry->has($parentType)) {
            throw TreeOperationException::invalidComponentType((string) $parentType);
        }

        $definition = $this->registry->get($parentType);
        $allowedTypes = $definition->childRules()['allowedTypes'] ?? [];

        if (! is_array($allowedTypes) || ! in_array($childType, $allowedTypes, true)) {
            throw TreeOperationException::invalidChildRelationship($parentType, $childType);
        }
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, mixed>  $newNode
     */
    private function insertIntoNode(array &$node, string $parentId, array $newNode, TreeInsertPosition $position): bool
    {
        if (($node['id'] ?? null) === $parentId) {
            $index = $position->indexFor($node['children']);
            array_splice($node['children'], $index, 0, [$newNode]);

            return true;
        }

        foreach ($node['children'] as &$child) {
            if (is_array($child) && $this->insertIntoNode($child, $parentId, $newNode, $position)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function removeFromNode(array &$node, string $nodeId): bool
    {
        foreach ($node['children'] as $index => $child) {
            if (! is_array($child)) {
                continue;
            }

            if (($child['id'] ?? null) === $nodeId) {
                array_splice($node['children'], $index, 1);

                return true;
            }

            if ($this->removeFromNode($child, $nodeId)) {
                $node['children'][$index] = $child;

                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, true>
     */
    private function collectIds(array $node): array
    {
        $ids = [$node['id'] => true];

        foreach (($node['children'] ?? []) as $child) {
            if (is_array($child)) {
                $ids += $this->collectIds($child);
            }
        }

        return $ids;
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, true>  $existingIds
     * @return array<string, mixed>
     */
    private function duplicateNode(array $node, array &$existingIds): array
    {
        $copy = $node;
        $copy['id'] = $this->idGenerator->generate($node['id'], $existingIds);

        if (isset($existingIds[$copy['id']])) {
            throw TreeOperationException::duplicateIdGenerated($copy['id']);
        }

        $existingIds[$copy['id']] = true;
        $copy['children'] = [];

        foreach ($node['children'] as $child) {
            $copy['children'][] = $this->duplicateNode($child, $existingIds);
        }

        return $copy;
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, mixed>  $patch
     */
    private function updateNodeProps(array &$node, string $nodeId, array $patch): bool
    {
        if (($node['id'] ?? null) === $nodeId) {
            $node['props'] = [...$node['props'], ...$patch];

            return true;
        }

        foreach ($node['children'] as &$child) {
            if (is_array($child) && $this->updateNodeProps($child, $nodeId, $patch)) {
                return true;
            }
        }

        return false;
    }

    private function updateNodeStyles(array &$node, string $nodeId, string $breakpoint, array $patch): bool
    {
        if (($node['id'] ?? null) === $nodeId) {
            $node['styles'][$breakpoint] = [...($node['styles'][$breakpoint] ?? []), ...$patch];

            return true;
        }
        foreach ($node['children'] as &$child) {
            if (is_array($child) && $this->updateNodeStyles($child, $nodeId, $breakpoint, $patch)) {
                return true;
            }
        }

        return false;
    }

    private function replaceNode(array &$node, string $nodeId, array $replacement): bool
    {
        if (($node['id'] ?? null) === $nodeId) {
            $node = $replacement;

            return true;
        }
        foreach ($node['children'] as &$child) {
            if (is_array($child) && $this->replaceNode($child, $nodeId, $replacement)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $schema
     */
    private function assertValidProp(string $nodeType, string $name, mixed $value, array $schema): void
    {
        $type = $schema['type'] ?? null;

        if ($type === 'string' && ! is_string($value)) {
            throw TreeOperationException::invalidProp($nodeType, $name, 'expected a string.');
        }

        if ($type === 'integer' && ! is_int($value)) {
            throw TreeOperationException::invalidProp($nodeType, $name, 'expected an integer.');
        }

        if (isset($schema['min']) && is_int($value) && $value < $schema['min']) {
            throw TreeOperationException::invalidProp($nodeType, $name, "must be at least {$schema['min']}.");
        }

        if (isset($schema['max']) && is_int($value) && $value > $schema['max']) {
            throw TreeOperationException::invalidProp($nodeType, $name, "must be at most {$schema['max']}.");
        }

        if (isset($schema['values']) && is_array($schema['values']) && ! in_array($value, $schema['values'], true)) {
            throw TreeOperationException::invalidProp($nodeType, $name, 'value is not allowed.');
        }
    }
}
