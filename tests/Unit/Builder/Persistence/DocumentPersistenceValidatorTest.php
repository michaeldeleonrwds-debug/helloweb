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

    public function test_navbar_validates_at_root(): void
    {
        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'nav-1',
                        'type' => 'layout.navbar',
                        'props' => [
                            'brandName' => 'HelloWeb',
                            'brandLogo' => '',
                            'brandHref' => '/',
                            'links' => [
                                ['label' => 'Home', 'href' => '/'],
                            ],
                            'ctaText' => 'Get Started',
                            'ctaHref' => '#',
                            'showCta' => true,
                            'sticky' => false,
                        ],
                        'styles' => [
                            'desktop' => [
                                'display' => 'block',
                                'width' => '100%',
                                'backgroundColor' => '#ffffff',
                                'color' => '#0f172a',
                                'paddingTop' => ['value' => 16, 'unit' => 'px'],
                                'paddingBottom' => ['value' => 16, 'unit' => 'px'],
                                'paddingLeft' => ['value' => 24, 'unit' => 'px'],
                                'paddingRight' => ['value' => 24, 'unit' => 'px'],
                                'borderBottomWidth' => ['value' => 1, 'unit' => 'px'],
                                'borderStyle' => 'solid',
                                'borderColor' => '#e2e8f0',
                            ],
                        ],
                        'children' => [],
                        'metadata' => [],
                    ],
                ],
            ],
        ];

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $document = $validator->validate($data);

        $this->assertSame('layout.navbar', $document->toArray()['root']['children'][0]['type']);
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

    public function test_new_components_validate_successfully(): void
    {
        $registry = BuiltInComponentDefinitions::registry();
        $validator = new DocumentPersistenceValidator($registry);

        $data = [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'nav-1',
                        'type' => 'layout.navbar',
                        'props' => $registry->get('layout.navbar')->defaultProps(),
                        'styles' => $registry->get('layout.navbar')->defaultStyles(),
                        'children' => [],
                        'metadata' => [],
                    ],
                    [
                        'id' => 'sec-1',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [],
                        'children' => [
                            [
                                'id' => 'row-1',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [],
                                'children' => [
                                    [
                                        'id' => 'col-1',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [],
                                        'children' => [
                                            [
                                                'id' => 'blurb-1',
                                                'type' => 'marketing.blurb',
                                                'props' => $registry->get('marketing.blurb')->defaultProps(),
                                                'styles' => $registry->get('marketing.blurb')->defaultStyles(),
                                                'children' => [],
                                                'metadata' => [],
                                            ],
                                            [
                                                'id' => 'list-1',
                                                'type' => 'content.list',
                                                'props' => $registry->get('content.list')->defaultProps(),
                                                'styles' => $registry->get('content.list')->defaultStyles(),
                                                'children' => [],
                                                'metadata' => [],
                                            ],
                                            [
                                                'id' => 'feature-1',
                                                'type' => 'marketing.imagefeature',
                                                'props' => $registry->get('marketing.imagefeature')->defaultProps(),
                                                'styles' => $registry->get('marketing.imagefeature')->defaultStyles(),
                                                'children' => [],
                                                'metadata' => [],
                                            ],
                                            [
                                                'id' => 'gallery-1',
                                                'type' => 'media.gallery',
                                                'props' => $registry->get('media.gallery')->defaultProps(),
                                                'styles' => $registry->get('media.gallery')->defaultStyles(),
                                                'children' => [],
                                                'metadata' => [],
                                            ],
                                        ],
                                        'metadata' => [],
                                    ],
                                ],
                                'metadata' => [],
                            ],
                        ],
                        'metadata' => [],
                    ],
                ],
                'metadata' => [],
            ],
        ];

        $doc = $validator->validate($data);
        $this->assertInstanceOf(\App\Builder\Document\BuilderDocument::class, $doc);
    }
}

