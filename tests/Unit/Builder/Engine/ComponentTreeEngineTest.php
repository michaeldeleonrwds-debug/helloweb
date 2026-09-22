<?php

namespace Tests\Unit\Builder\Engine;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Engine\ComponentTreeEngine;
use App\Builder\Engine\NodeIdGenerator;
use App\Builder\Engine\TreeInsertPosition;
use App\Builder\Engine\TreeOperationException;
use App\Builder\Registry\BuiltInComponentDefinitions;
use PHPUnit\Framework\TestCase;

class ComponentTreeEngineTest extends TestCase
{
    public function test_find_root(): void
    {
        $node = $this->engine()->find($this->document(), 'node_root');

        $this->assertSame('layout.root', $node['type']);
    }

    public function test_find_nested_node(): void
    {
        $node = $this->engine()->find($this->document(), 'node_heading_1');

        $this->assertSame('content.heading', $node['type']);
        $this->assertSame('Hello', $node['props']['text']);
    }

    public function test_find_missing_node_returns_null(): void
    {
        $this->assertNull($this->engine()->find($this->document(), 'node_missing'));
    }

    public function test_find_parent(): void
    {
        $parent = $this->engine()->findParent($this->document(), 'node_heading_1');

        $this->assertSame('node_container_1', $parent['id']);
        $this->assertNull($this->engine()->findParent($this->document(), 'node_root'));
    }

    public function test_insert_child(): void
    {
        $updated = $this->engine()->insert(
            $this->document(),
            'node_container_1',
            $this->heading('node_heading_2', 'Inserted'),
        );

        $this->assertSame('Inserted', $this->engine()->find($updated, 'node_heading_2')['props']['text']);
        $this->assertNull($this->engine()->find($this->document(), 'node_heading_2'));
    }

    public function test_append_child(): void
    {
        $updated = $this->engine()->insert(
            $this->document(),
            'node_container_1',
            $this->heading('node_heading_2', 'Second'),
            TreeInsertPosition::append(),
        );

        $children = $this->engine()->find($updated, 'node_container_1')['children'];

        $this->assertSame(['node_heading_1', 'node_heading_2'], array_column($children, 'id'));
    }

    public function test_insert_before_sibling(): void
    {
        $updated = $this->engine()->insert(
            $this->document(),
            'node_container_1',
            $this->heading('node_heading_2', 'Before'),
            TreeInsertPosition::before('node_heading_1'),
        );

        $children = $this->engine()->find($updated, 'node_container_1')['children'];

        $this->assertSame(['node_heading_2', 'node_heading_1'], array_column($children, 'id'));
    }

    public function test_insert_after_sibling(): void
    {
        $document = $this->engine()->insert(
            $this->document(),
            'node_container_1',
            $this->heading('node_heading_2', 'Second'),
        );

        $updated = $this->engine()->insert(
            $document,
            'node_container_1',
            $this->heading('node_heading_3', 'After'),
            TreeInsertPosition::after('node_heading_1'),
        );

        $children = $this->engine()->find($updated, 'node_container_1')['children'];

        $this->assertSame(['node_heading_1', 'node_heading_3', 'node_heading_2'], array_column($children, 'id'));
    }

    public function test_remove_node(): void
    {
        $updated = $this->engine()->remove($this->document(), 'node_heading_1');

        $this->assertNull($this->engine()->find($updated, 'node_heading_1'));
        $this->assertNotNull($this->engine()->find($this->document(), 'node_heading_1'));
    }

    public function test_remove_nested_subtree(): void
    {
        $updated = $this->engine()->remove($this->document(), 'node_container_1');

        $this->assertNull($this->engine()->find($updated, 'node_container_1'));
        $this->assertNull($this->engine()->find($updated, 'node_heading_1'));
    }

    public function test_move_node(): void
    {
        $document = $this->engine()->insert($this->document(), 'node_root', $this->section('node_section_2'));

        $updated = $this->engine()->move($document, 'node_heading_1', 'node_section_2');

        $this->assertSame('node_section_2', $this->engine()->findParent($updated, 'node_heading_1')['id']);
    }

    public function test_move_nested_subtree(): void
    {
        $document = $this->engine()->insert($this->document(), 'node_root', $this->section('node_section_2'));

        $updated = $this->engine()->move($document, 'node_container_1', 'node_section_2');

        $this->assertSame('node_section_2', $this->engine()->findParent($updated, 'node_container_1')['id']);
        $this->assertSame('node_container_1', $this->engine()->findParent($updated, 'node_heading_1')['id']);
    }

    public function test_invalid_parent_fails(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('Parent node [node_missing] was not found.');

        $this->engine()->insert($this->document(), 'node_missing', $this->heading('node_heading_2'));
    }

    public function test_invalid_child_relationship_fails(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('cannot accept child type');

        $this->engine()->insert($this->document(), 'node_heading_1', $this->heading('node_heading_2'));
    }

    public function test_invalid_component_type_fails(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('Component type [content.unknown] is not registered.');

        $this->engine()->insert($this->document(), 'node_container_1', [
            'id' => 'node_unknown',
            'type' => 'content.unknown',
            'props' => [],
            'styles' => [],
            'children' => [],
        ]);
    }

    public function test_invalid_position_fails(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('Sibling node [node_missing]');

        $this->engine()->insert(
            $this->document(),
            'node_container_1',
            $this->heading('node_heading_2'),
            TreeInsertPosition::before('node_missing'),
        );
    }

    public function test_duplicate_node(): void
    {
        $updated = $this->engine(['node_heading_copy'])->duplicate($this->document(), 'node_heading_1');
        $children = $this->engine()->find($updated, 'node_container_1')['children'];

        $this->assertSame(['node_heading_1', 'node_heading_copy'], array_column($children, 'id'));
        $this->assertSame('Hello', $this->engine()->find($updated, 'node_heading_copy')['props']['text']);
    }

    public function test_duplicate_nested_subtree_preserves_structure_with_unique_ids(): void
    {
        $updated = $this->engine(['node_container_copy', 'node_heading_copy'])
            ->duplicate($this->document(), 'node_container_1');

        $copy = $this->engine()->find($updated, 'node_container_copy');

        $this->assertSame('layout.container', $copy['type']);
        $this->assertSame(['node_heading_copy'], array_column($copy['children'], 'id'));
        $this->assertSame('content.heading', $copy['children'][0]['type']);
        $this->assertSame('Hello', $copy['children'][0]['props']['text']);
        $this->assertCount(6, $this->collectIds($updated->toArray()['root']));
        $this->assertCount(6, array_unique($this->collectIds($updated->toArray()['root'])));
    }

    public function test_duplicated_subtree_does_not_share_mutable_data(): void
    {
        $updated = $this->engine(['node_container_copy', 'node_heading_copy'])
            ->duplicate($this->document(), 'node_container_1')
            ->toArray();

        $updated['root']['children'][0]['children'][0]['children'][0]['props']['text'] = 'Changed';

        $copy = $updated['root']['children'][0]['children'][1]['children'][0];

        $this->assertSame('Hello', $copy['props']['text']);
    }

    public function test_root_constraints(): void
    {
        $engine = $this->engine();

        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('Cannot remove the document root.');

        $engine->remove($this->document(), 'node_root');
    }

    public function test_root_only_accepts_allowed_top_level_types(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('layout.root');

        $this->engine()->insert($this->document(), 'node_root', $this->heading('node_heading_2'));
    }

    public function test_duplicate_id_generation_failure_is_reported(): void
    {
        $this->expectException(TreeOperationException::class);
        $this->expectExceptionMessage('Generated duplicate node ID [node_heading_1].');

        $this->engine(['node_heading_1'])->duplicate($this->document(), 'node_heading_1');
    }

    /**
     * @param  list<string>  $generatedIds
     */
    private function engine(array $generatedIds = []): ComponentTreeEngine
    {
        return new ComponentTreeEngine(
            BuiltInComponentDefinitions::registry(),
            new class($generatedIds) implements NodeIdGenerator
            {
                /**
                 * @param  list<string>  $ids
                 */
                public function __construct(private array $ids) {}

                /**
                 * @param  array<string, true>  $existingIds
                 */
                public function generate(string $sourceNodeId, array $existingIds): string
                {
                    return array_shift($this->ids) ?? "{$sourceNodeId}_copy";
                }
            },
        );
    }

    private function document(): BuilderDocument
    {
        return BuilderDocument::fromArray([
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'node_root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    $this->section('node_section_1', [
                        $this->container('node_container_1', [
                            $this->heading('node_heading_1', 'Hello'),
                        ]),
                    ]),
                ],
                'metadata' => [],
            ],
            'metadata' => [],
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $children
     * @return array<string, mixed>
     */
    private function section(string $id, array $children = []): array
    {
        return [
            'id' => $id,
            'type' => 'layout.section',
            'props' => [],
            'styles' => [],
            'children' => $children,
            'metadata' => [],
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $children
     * @return array<string, mixed>
     */
    private function container(string $id, array $children = []): array
    {
        return [
            'id' => $id,
            'type' => 'layout.container',
            'props' => [],
            'styles' => [],
            'children' => $children,
            'metadata' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function heading(string $id, string $text = 'Heading'): array
    {
        return [
            'id' => $id,
            'type' => 'content.heading',
            'props' => ['text' => $text, 'level' => 2],
            'styles' => ['desktop' => ['fontSize' => '2rem']],
            'children' => [],
            'metadata' => ['label' => $text],
        ];
    }

    /**
     * @param  array<string, mixed>  $node
     * @return list<string>
     */
    private function collectIds(array $node): array
    {
        $ids = [$node['id']];

        foreach ($node['children'] as $child) {
            $ids = [...$ids, ...$this->collectIds($child)];
        }

        return $ids;
    }
}
