<?php

namespace App\Builder\Commands;

use App\Builder\Document\BuilderDocument;
use App\Builder\Engine\ComponentTreeEngine;
use App\Builder\Engine\TreeInsertPosition;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Registry\ComponentRegistry;
use App\Models\Page;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use InvalidArgumentException;

final readonly class EditorCommandService
{
    public function __construct(
        private BuilderPagePersistenceService $pages,
        private ?ComponentRegistry $registry = null,
    ) {}

    /**
     * @param  array<string, mixed>  $command
     * @return array<string, mixed>
     */
    public function execute(User $user, Page $page, array $command): array
    {
        Gate::forUser($user)->authorize('update', $page);

        $type = $this->string($command, 'type');
        $document = $this->pages->loadDocument($page);
        $expectedVersion = (int) ($command['expectedVersion'] ?? $page->document_version);
        $engine = new ComponentTreeEngine($this->componentRegistry());

        return match ($type) {
            'get_page' => $this->result(false, $page, $document, ['document' => $document->toArray()]),
            'get_element', 'get_selected_element' => $this->inspectElement($engine, $page, $document, $this->string($command, 'elementId')),
            'find_elements' => $this->findElements($page, $document, $command),
            'get_components' => $this->components($page),
            'get_design_tokens' => $this->designTokens($page),
            'create_element' => $this->createElement($page, $document, $expectedVersion, $engine, $command),
            'create_section' => $this->createPreset($page, $document, $expectedVersion, (string) ($document->toArray()['root']['id'] ?? 'root'), 'layout.section'),
            'create_row' => $this->createPreset($page, $document, $expectedVersion, $this->string($command, 'parentId'), 'layout.row'),
            'create_column' => $this->createPreset($page, $document, $expectedVersion, $this->string($command, 'parentId'), 'layout.column'),
            'update_element' => $this->mutate($page, $expectedVersion, $engine->updateProps(
                $document,
                $this->string($command, 'elementId'),
                $this->array($command, 'props'),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'update_content' => $this->mutate($page, $expectedVersion, $engine->updateProps(
                $document,
                $this->string($command, 'elementId'),
                ['text' => $this->string($command, 'text')],
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'replace_image' => $this->mutate($page, $expectedVersion, $engine->updateProps(
                $document,
                $this->string($command, 'elementId'),
                ['src' => $this->string($command, 'src'), 'alt' => (string) ($command['alt'] ?? '')],
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'update_styles' => $this->mutate($page, $expectedVersion, $engine->updateStyles(
                $document,
                $this->string($command, 'elementId'),
                'desktop',
                $this->array($command, 'styles'),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'update_responsive_styles', 'resize_element' => $this->mutate($page, $expectedVersion, $engine->updateStyles(
                $document,
                $this->string($command, 'elementId'),
                $this->breakpoint($command),
                $this->array($command, 'styles'),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'move_element' => $this->mutate($page, $expectedVersion, $engine->move(
                $document,
                $this->string($command, 'elementId'),
                $this->string($command, 'parentId'),
                $this->position($command),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'duplicate_element' => $this->mutate($page, $expectedVersion, $engine->duplicate(
                $document,
                $this->string($command, 'elementId'),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            'delete_element' => $this->mutate($page, $expectedVersion, $engine->remove(
                $document,
                $this->string($command, 'elementId'),
            ), ['command' => $type, 'elementId' => $this->string($command, 'elementId')]),
            default => throw new InvalidArgumentException("Unsupported editor command [{$type}]."),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function mutate(Page $page, int $expectedVersion, BuilderDocument $document, array $meta): array
    {
        $saved = $this->pages->saveDraft($page, $document->toArray(), $expectedVersion);

        return [
            'success' => true,
            'pageId' => $saved->id,
            'version' => (int) $saved->document_version,
            'source' => 'editor_command',
            ...$meta,
        ];
    }

    private function inspectElement(ComponentTreeEngine $engine, Page $page, BuilderDocument $document, string $elementId): array
    {
        $node = $engine->find($document, $elementId);
        if ($node === null) {
            throw new InvalidArgumentException("Element [{$elementId}] was not found.");
        }

        return $this->result(false, $page, $document, ['element' => $node]);
    }

    private function findElements(Page $page, BuilderDocument $document, array $command): array
    {
        $type = isset($command['componentType']) ? (string) $command['componentType'] : null;
        $text = isset($command['text']) ? mb_strtolower((string) $command['text']) : null;
        $matches = [];
        $this->walk($document->toArray()['root'], function (array $node) use (&$matches, $type, $text): void {
            if ($type !== null && ($node['type'] ?? null) !== $type) {
                return;
            }
            if ($text !== null && ! str_contains(mb_strtolower(json_encode($node['props'] ?? []) ?: ''), $text)) {
                return;
            }
            $matches[] = ['id' => $node['id'] ?? null, 'type' => $node['type'] ?? null, 'props' => $node['props'] ?? []];
        });

        return $this->result(false, $page, $document, ['elements' => $matches]);
    }

    private function components(Page $page): array
    {
        return ['success' => true, 'pageId' => $page->id, 'components' => array_map(fn ($definition) => $definition->toArray(), $this->componentRegistry()->all())];
    }

    private function designTokens(Page $page): array
    {
        return [
            'success' => true,
            'pageId' => $page->id,
            'tokens' => [
                'colors' => [
                    'primary' => 'hsl(158 64% 32%)',
                    'accent' => 'hsl(158 64% 48%)',
                    'dark' => '#0B0B0B',
                    'background' => 'hsl(0 0% 100%)',
                ],
                'typography' => ['default' => 'Inter', 'system' => 'Instrument Sans'],
            ],
        ];
    }

    private function createElement(Page $page, BuilderDocument $document, int $expectedVersion, ComponentTreeEngine $engine, array $command): array
    {
        $node = $this->makeNode($document, $this->string($command, 'componentType'));
        $createdId = $node['id'];

        return $this->mutate($page, $expectedVersion, $engine->insert(
            $document,
            $this->string($command, 'parentId'),
            $node,
            $this->position($command),
        ), ['command' => 'create_element', 'createdId' => $createdId]);
    }

    private function createPreset(Page $page, BuilderDocument $document, int $expectedVersion, string $parentId, string $componentType): array
    {
        $engine = new ComponentTreeEngine($this->componentRegistry());
        $node = $this->makeNode($document, $componentType);
        $createdId = $node['id'];

        return $this->mutate($page, $expectedVersion, $engine->insert($document, $parentId, $node), [
            'command' => 'create_'.$componentType,
            'createdId' => $createdId,
        ]);
    }

    /** @return array<string, mixed> */
    private function makeNode(BuilderDocument $document, string $componentType): array
    {
        $definition = $this->componentRegistry()->get($componentType);

        return [
            'id' => $this->nextNodeId($document),
            'type' => $componentType,
            'props' => $definition->defaultProps(),
            'styles' => $definition->defaultStyles(),
            'metadata' => [],
            'children' => [],
        ];
    }

    private function nextNodeId(BuilderDocument $document): string
    {
        $ids = [];
        $this->walk($document->toArray()['root'], function (array $node) use (&$ids): void {
            $ids[(string) ($node['id'] ?? '')] = true;
        });

        for ($index = 1; ; $index++) {
            $id = "node_{$index}";
            if (! isset($ids[$id])) {
                return $id;
            }
        }
    }

    private function position(array $command): TreeInsertPosition
    {
        $mode = (string) ($command['position']['mode'] ?? $command['mode'] ?? 'append');
        $siblingId = (string) ($command['position']['siblingId'] ?? $command['siblingId'] ?? '');

        return match ($mode) {
            'before' => TreeInsertPosition::before($siblingId),
            'after' => TreeInsertPosition::after($siblingId),
            default => TreeInsertPosition::append(),
        };
    }

    private function breakpoint(array $command): string
    {
        $breakpoint = (string) ($command['breakpoint'] ?? 'desktop');
        if (! in_array($breakpoint, ['desktop', 'tablet', 'mobile'], true)) {
            throw new InvalidArgumentException("Breakpoint [{$breakpoint}] is not supported.");
        }

        return $breakpoint;
    }

    private function componentRegistry(): ComponentRegistry
    {
        return $this->registry ?? BuiltInComponentDefinitions::registry();
    }

    private function string(array $data, string $key): string
    {
        if (! isset($data[$key]) || ! is_string($data[$key]) || trim($data[$key]) === '') {
            throw new InvalidArgumentException("Command field [{$key}] must be a non-empty string.");
        }

        return $data[$key];
    }

    /** @return array<string, mixed> */
    private function array(array $data, string $key): array
    {
        if (! isset($data[$key]) || ! is_array($data[$key]) || array_is_list($data[$key])) {
            throw new InvalidArgumentException("Command field [{$key}] must be an object.");
        }

        return $data[$key];
    }

    private function result(bool $mutated, Page $page, BuilderDocument $document, array $payload): array
    {
        return ['success' => true, 'mutated' => $mutated, 'pageId' => $page->id, 'version' => (int) $page->document_version, ...$payload];
    }

    private function walk(array $node, callable $visitor): void
    {
        $visitor($node);
        foreach (($node['children'] ?? []) as $child) {
            if (is_array($child)) {
                $this->walk($child, $visitor);
            }
        }
    }
}
