<?php

namespace Tests\Unit\Builder\Persistence;

use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Persistence\DocumentPersistenceValidator;
use App\Builder\Registry\BuiltInComponentDefinitions;
use PHPUnit\Framework\TestCase;

class DocumentPersistenceValidatorTest extends TestCase
{
    public function test_legacy_custom_css_nodes_are_migrated_to_custom_code(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'row', 'type' => 'layout.row', 'props' => [], 'styles' => [], 'children' => [[
                            'id' => 'column', 'type' => 'layout.column', 'props' => [], 'styles' => [], 'children' => [[
                                'id' => 'code', 'type' => 'code.customcss', 'props' => ['code' => '<div>x</div>'], 'styles' => [], 'children' => [], 'metadata' => [],
                            ]], 'metadata' => [],
                        ]], 'metadata' => [],
                    ]], 'metadata' => [],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $document = $validator->validate($data);

        $migratedType = $document->toArray()['root']['children'][0]['children'][0]['children'][0]['children'][0]['type'];

        $this->assertSame('code.customcode', $migratedType);
    }

    public function test_custom_code_nodes_validate_without_migration(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'row', 'type' => 'layout.row', 'props' => [], 'styles' => [], 'children' => [[
                            'id' => 'column', 'type' => 'layout.column', 'props' => [], 'styles' => [], 'children' => [[
                                'id' => 'code', 'type' => 'code.customcode', 'props' => ['code' => '<style>x{}</style>'], 'styles' => [], 'children' => [], 'metadata' => [],
                            ]], 'metadata' => [],
                        ]], 'metadata' => [],
                    ]], 'metadata' => [],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $document = $validator->validate($data);

        $this->assertSame(
            'code.customcode',
            $document->toArray()['root']['children'][0]['children'][0]['children'][0]['children'][0]['type'],
        );
    }

    public function test_custom_code_directly_under_section_is_kept_without_wrappers(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'code', 'type' => 'code.customcode', 'props' => ['code' => '<script></script>'], 'styles' => [], 'children' => [], 'metadata' => [],
                    ]],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $children = $validator->validate($data)->toArray()['root']['children'][0]['children'];

        $this->assertCount(1, $children);
        $this->assertSame('code.customcode', $children[0]['type']);
        $this->assertSame('code', $children[0]['id']);
    }

    public function test_wrapped_custom_code_in_section_is_unwrapped(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'code-migration-row-0', 'type' => 'layout.row', 'props' => [], 'styles' => [], 'children' => [[
                            'id' => 'code-migration-column-0', 'type' => 'layout.column', 'props' => [], 'styles' => [], 'children' => [[
                                'id' => 'code', 'type' => 'code.customcode', 'props' => ['code' => '<style>x{}</style>'], 'styles' => [], 'children' => [], 'metadata' => [],
                            ]], 'metadata' => [],
                        ]], 'metadata' => [],
                    ]],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $children = $validator->validate($data)->toArray()['root']['children'][0]['children'];

        $this->assertCount(1, $children);
        $this->assertSame('code.customcode', $children[0]['type']);
        $this->assertSame('code', $children[0]['id']);
    }

    public function test_legacy_direct_content_in_section_is_still_wrapped(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'heading', 'type' => 'content.heading', 'props' => ['text' => 'Legacy'], 'styles' => [], 'children' => [], 'metadata' => [],
                    ]],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $children = $validator->validate($data)->toArray()['root']['children'][0]['children'];

        $this->assertCount(1, $children);
        $this->assertSame('layout.row', $children[0]['type']);
        $this->assertSame('layout.column', $children[0]['children'][0]['type']);
        $this->assertSame('content.heading', $children[0]['children'][0]['children'][0]['type']);
    }

    public function test_migration_wrapped_content_in_section_stays_wrapped(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'heading-migration-row-0', 'type' => 'layout.row', 'props' => [], 'styles' => [], 'children' => [[
                            'id' => 'heading-migration-column-0', 'type' => 'layout.column', 'props' => [], 'styles' => [], 'children' => [[
                                'id' => 'heading', 'type' => 'content.heading', 'props' => ['text' => 'Legacy'], 'styles' => [], 'children' => [], 'metadata' => [],
                            ]], 'metadata' => [],
                        ]], 'metadata' => [],
                    ]],
                ]],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $children = $validator->validate($data)->toArray()['root']['children'][0]['children'];

        $this->assertCount(1, $children);
        $this->assertSame('heading-migration-row-0', $children[0]['id']);
        $this->assertSame('layout.row', $children[0]['type']);
        $this->assertSame('content.heading', $children[0]['children'][0]['children'][0]['type']);
    }
}
