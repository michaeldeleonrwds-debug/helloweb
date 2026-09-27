<?php

namespace Tests\Unit\Builder\Registry;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Registry\ComponentRegistry;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ComponentRegistryTest extends TestCase
{
    public function test_registering_and_retrieving_component_definition(): void
    {
        $registry = new ComponentRegistry;
        $definition = $this->definition();

        $registry->register($definition);

        $this->assertSame($definition, $registry->get('content.heading'));
    }

    public function test_has_checks_component_existence(): void
    {
        $registry = new ComponentRegistry([$this->definition()]);

        $this->assertTrue($registry->has('content.heading'));
        $this->assertFalse($registry->has('layout.section'));
    }

    public function test_all_lists_registered_components_by_type(): void
    {
        $registry = new ComponentRegistry([$this->definition()]);

        $this->assertSame(['content.heading'], array_keys($registry->all()));
    }

    public function test_duplicate_registration_fails(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('already registered');

        $registry = new ComponentRegistry([$this->definition()]);
        $registry->register($this->definition());
    }

    public function test_unknown_component_lookup_fails(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('is not registered');

        (new ComponentRegistry)->get('content.missing');
    }

    public function test_component_metadata_capabilities_defaults_and_child_rules_are_available(): void
    {
        $definition = $this->definition();

        $this->assertSame('content.heading', $definition->type());
        $this->assertSame('Heading', $definition->name());
        $this->assertSame('content', $definition->category());
        $this->assertSame('Text heading content primitive.', $definition->description());
        $this->assertTrue($definition->supports('supportsText'));
        $this->assertFalse($definition->supports('canAcceptChildren'));
        $this->assertSame(['text' => 'Heading', 'level' => 2], $definition->defaultProps());
        $this->assertSame(['desktop' => ['fontSize' => '2rem']], $definition->defaultStyles());
        $this->assertSame(['allowedTypes' => []], $definition->childRules());
        $this->assertSame(['text' => ['type' => 'string']], $definition->propSchema());
        $this->assertSame(['rendererKey' => 'content.heading'], $definition->integration());
    }

    public function test_builtin_components_are_registered(): void
    {
        $registry = BuiltInComponentDefinitions::registry();

        $this->assertTrue($registry->has('layout.section'));
        $this->assertTrue($registry->has('layout.container'));
        $this->assertTrue($registry->has('content.heading'));
    }

    public function test_builtin_components_express_capabilities_and_child_rules(): void
    {
        $registry = BuiltInComponentDefinitions::registry();

        $section = $registry->get('layout.section');
        $row = $registry->get('layout.row');
        $container = $registry->get('layout.container');
        $heading = $registry->get('content.heading');

        $this->assertTrue($section->supports('canAcceptChildren'));
        $this->assertContains('layout.container', $section->childRules()['allowedTypes']);
        $this->assertContains('code.customcode', $section->childRules()['allowedTypes']);
        $this->assertContains('layout.column', $row->childRules()['allowedTypes']);
        $this->assertContains('code.customcode', $row->childRules()['allowedTypes']);
        $this->assertContains('content.heading', $container->childRules()['allowedTypes']);
        $this->assertTrue($heading->supports('supportsText'));
        $this->assertFalse($heading->supports('canAcceptChildren'));
        $this->assertSame([], $heading->childRules()['allowedTypes']);
    }

    public function test_custom_code_defaults_to_invisible_style_and_script_example(): void
    {
        $registry = BuiltInComponentDefinitions::registry();
        $defaultCode = $registry->get('code.customcode')->defaultProps()['code'];

        $this->assertIsString($defaultCode);
        $this->assertStringNotContainsString('<div', $defaultCode);
        $this->assertStringContainsString('<style>', $defaultCode);
        $this->assertStringContainsString('<script>', $defaultCode);
    }

    public function test_styled_list_supports_text_color_controls(): void
    {
        $list = BuiltInComponentDefinitions::registry()->get('content.list');

        $this->assertContains('color', $list->styleCapabilities());
        $this->assertContains('fontSize', $list->styleCapabilities());
        $this->assertContains('fontWeight', $list->styleCapabilities());
        $this->assertContains('lineHeight', $list->styleCapabilities());
    }

    public function test_registry_does_not_mutate_through_returned_definition_arrays(): void
    {
        $registry = BuiltInComponentDefinitions::registry();

        $props = $registry->get('content.heading')->defaultProps();
        $props['text'] = 'Changed';

        $all = $registry->all();
        unset($all['content.heading']);

        $this->assertTrue($registry->has('content.heading'));
        $this->assertSame('Heading', $registry->get('content.heading')->defaultProps()['text']);
    }

    public function test_invalid_component_definition_fails(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new ComponentDefinition(
            type: 'heading',
            name: 'Heading',
            category: 'content',
        );
    }

    public function test_logo_marquee_supports_extended_props_and_new_components_exist(): void
    {
        $registry = BuiltInComponentDefinitions::registry();

        $this->assertTrue($registry->has('marketing.logomarquee'));
        $marquee = $registry->get('marketing.logomarquee');
        $schema = $marquee->propSchema();

        $this->assertArrayHasKey('pauseOnHover', $schema);
        $this->assertSame('boolean', $schema['pauseOnHover']['type']);
        $this->assertArrayHasKey('fadeEdges', $schema);
        $this->assertSame('boolean', $schema['fadeEdges']['type']);
        $this->assertArrayHasKey('fadeWidth', $schema);
        $this->assertArrayHasKey('grayscale', $schema);
        $this->assertArrayHasKey('logoCardStyle', $schema);
        $this->assertArrayHasKey('gap', $schema);

        $this->assertTrue($registry->has('marketing.countdown'));
        $this->assertTrue($registry->has('content.socialicons'));
        $this->assertTrue($registry->has('content.alert'));
        $this->assertTrue($registry->has('marketing.progressbar'));
    }

    public function test_document_validator_accepts_marquee_with_pause_on_hover_and_new_components(): void
    {
        $validator = new \App\Builder\Persistence\DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());

        $document = [
            'schemaVersion' => 1,
            'root' => [
                'id' => 'root-1',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
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
                                                'id' => 'marquee-1',
                                                'type' => 'marketing.logomarquee',
                                                'props' => [
                                                    'pauseOnHover' => true,
                                                    'fadeEdges' => true,
                                                    'fadeWidth' => '80px',
                                                    'grayscale' => true,
                                                    'logoCardStyle' => 'card',
                                                    'gap' => '24px',
                                                    'speed' => '20s',
                                                    'direction' => 'left',
                                                ],
                                                'styles' => [],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'countdown-1',
                                                'type' => 'marketing.countdown',
                                                'props' => [
                                                    'targetDate' => '2026-12-31T23:59:59',
                                                    'styleVariant' => 'card',
                                                    'showDays' => true,
                                                ],
                                                'styles' => [],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'social-1',
                                                'type' => 'content.socialicons',
                                                'props' => [
                                                    'items' => [
                                                        ['platform' => 'facebook', 'url' => 'https://facebook.com'],
                                                    ],
                                                    'iconStyle' => 'brand',
                                                ],
                                                'styles' => [],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'alert-1',
                                                'type' => 'content.alert',
                                                'props' => [
                                                    'variant' => 'info',
                                                    'title' => 'Notice',
                                                    'message' => 'Hello',
                                                ],
                                                'styles' => [],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'prog-1',
                                                'type' => 'marketing.progressbar',
                                                'props' => [
                                                    'percentage' => 75,
                                                    'label' => 'Progress',
                                                ],
                                                'styles' => [],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        // Should not throw any InvalidArgumentException
        $validator->validate($document);
        $this->assertTrue(true);
    }

    private function definition(): ComponentDefinition
    {
        return new ComponentDefinition(
            type: 'content.heading',
            name: 'Heading',
            category: 'content',
            description: 'Text heading content primitive.',
            capabilities: [
                'supportsText' => true,
                'supportsResponsiveStyles' => true,
            ],
            defaultProps: [
                'text' => 'Heading',
                'level' => 2,
            ],
            defaultStyles: [
                'desktop' => [
                    'fontSize' => '2rem',
                ],
            ],
            propSchema: [
                'text' => ['type' => 'string'],
            ],
            childRules: [
                'allowedTypes' => [],
            ],
            integration: [
                'rendererKey' => 'content.heading',
            ],
        );
    }
}
