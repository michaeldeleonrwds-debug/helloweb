<?php

namespace Tests\Unit\Builder\Renderer;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Renderer\BuilderRenderer;
use App\Builder\Renderer\BuiltIn\HeadingRenderer;
use App\Builder\Renderer\BuiltInRendererDefinitions;
use App\Builder\Renderer\ComponentRendererRegistry;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RendererException;
use PHPUnit\Framework\TestCase;

class BuilderRendererTest extends TestCase
{
    public function test_rendering_the_root_returns_child_output_without_extra_markup(): void
    {
        $result = $this->renderer()->renderDocument($this->document());

        $this->assertNull($result->tag());
        $this->assertCount(1, $result->children());
        $this->assertSame('section', $result->children()[0]->tag());
    }

    public function test_rendering_section(): void
    {
        $section = $this->renderer()->renderDocument($this->document())->children()[0];

        $this->assertSame('section', $section->tag());
        $this->assertSame('node_section_1', $section->attributes()['data-builder-id']);
        $this->assertSame('layout.section', $section->attributes()['data-builder-type']);
    }

    public function test_rendering_container(): void
    {
        $container = $this->renderer()->renderDocument($this->document())->children()[0]->children()[0];

        $this->assertSame('div', $container->tag());
        $this->assertSame('node_container_1', $container->attributes()['data-builder-id']);
    }

    public function test_rendering_heading(): void
    {
        $heading = $this->headingResult();

        $this->assertSame('h2', $heading->tag());
        $this->assertSame('Hello builder', $heading->text());
    }

    public function test_recursive_nested_rendering(): void
    {
        $html = $this->renderer()->renderDocument($this->document())->toHtml();

        $this->assertStringContainsString('<section', $html);
        $this->assertStringContainsString('<div', $html);
        $this->assertStringContainsString('<h2', $html);
        $this->assertStringContainsString('Hello builder', $html);
    }

    public function test_correct_heading_level(): void
    {
        $document = $this->document(headingProps: ['text' => 'Level three', 'level' => 3]);

        $this->assertSame('h3', $this->renderer()->renderDocument($document)->children()[0]->children()[0]->children()[0]->tag());
    }

    public function test_heading_text_rendering_is_escaped(): void
    {
        $document = $this->document(headingProps: ['text' => '<Hello>', 'level' => 2]);

        $this->assertStringContainsString('&lt;Hello&gt;', $this->renderer()->renderDocument($document)->toHtml());
    }

    public function test_default_styles_are_rendered(): void
    {
        $container = $this->renderer()->renderDocument($this->document())->children()[0]->children()[0];

        $this->assertSame('72rem', $container->styles()['maxWidth']);
        $this->assertStringContainsString('max-width: 72rem', $container->toHtml());
    }

    public function test_responsive_style_resolution(): void
    {
        $heading = $this->renderer('mobile')->renderDocument($this->document())->children()[0]->children()[0]->children()[0];

        $this->assertSame('2rem', $heading->styles()['fontSize']);
        $this->assertSame('700', $heading->styles()['fontWeight']);
    }

    public function test_unknown_component_renderer_fails(): void
    {
        $this->expectException(RendererException::class);
        $this->expectExceptionMessage('Renderer for component type [content.heading] is not registered.');

        $registry = BuiltInRendererDefinitions::registry();
        $registry = new ComponentRendererRegistry([
            'layout.root' => $registry->get('layout.root'),
            'layout.section' => $registry->get('layout.section'),
            'layout.container' => $registry->get('layout.container'),
        ]);

        $this->renderer(rendererRegistry: $registry)->renderDocument($this->document());
    }

    public function test_unknown_component_type_fails(): void
    {
        $this->expectException(RendererException::class);
        $this->expectExceptionMessage('Component type [content.unknown] is not registered.');

        $this->renderer()->renderDocument($this->document(headingType: 'content.unknown'));
    }

    public function test_duplicate_renderer_registration_fails(): void
    {
        $this->expectException(RendererException::class);
        $this->expectExceptionMessage('already registered');

        BuiltInRendererDefinitions::registry()->register('content.heading', new HeadingRenderer);
    }

    public function test_deterministic_output(): void
    {
        $first = $this->renderer()->renderDocument($this->document())->toHtml();
        $second = $this->renderer()->renderDocument($this->document())->toHtml();

        $this->assertSame($first, $second);
    }

    public function test_rendering_does_not_mutate_source_document(): void
    {
        $document = $this->document();
        $before = $document->toArray();

        $this->renderer('mobile')->renderDocument($document);

        $this->assertSame($before, $document->toArray());
    }

    public function test_invalid_node_data_fails_clearly(): void
    {
        $this->expectException(RendererException::class);
        $this->expectExceptionMessage('Node is missing required key [props].');

        $node = $this->document()->toArray()['root']['children'][0];
        unset($node['props']);

        $this->renderer()->renderNode($node);
    }

    public function test_renderer_does_not_require_react_or_editor_state(): void
    {
        $context = new RenderContext(
            componentRegistry: BuiltInComponentDefinitions::registry(),
            rendererRegistry: BuiltInRendererDefinitions::registry(),
            breakpoint: 'desktop',
            options: ['surface' => 'public'],
        );

        $result = (new BuilderRenderer($context))->renderDocument($this->document());

        $this->assertStringContainsString('Hello builder', $result->toHtml());
    }

    public function test_registry_lookup_behavior(): void
    {
        $registry = BuiltInRendererDefinitions::registry();

        $this->assertTrue($registry->has('layout.root'));
        $this->assertTrue($registry->has('content.heading'));
        $this->assertInstanceOf(HeadingRenderer::class, $registry->get('content.heading'));
        $this->assertArrayHasKey('content.heading', $registry->all());
    }

    public function test_complete_sample_document_renders_successfully(): void
    {
        $html = $this->renderer('tablet')->renderDocument($this->document())->toHtml();

        $this->assertSame(
            '<section data-builder-id="node_section_1" data-builder-type="layout.section" style="display: block; padding-top: 3rem"><div data-builder-id="node_container_1" data-builder-type="layout.container" style="max-width: 64rem"><h2 data-builder-id="node_heading_1" data-builder-type="content.heading" style="font-size: 2.5rem">Hello builder</h2></div></section>',
            $html,
        );
    }

    private function headingResult()
    {
        return $this->renderer()->renderDocument($this->document())->children()[0]->children()[0]->children()[0];
    }

    private function renderer(
        string $breakpoint = 'desktop',
        ?ComponentRendererRegistry $rendererRegistry = null,
    ): BuilderRenderer {
        return new BuilderRenderer(new RenderContext(
            componentRegistry: BuiltInComponentDefinitions::registry(),
            rendererRegistry: $rendererRegistry ?? BuiltInRendererDefinitions::registry(),
            breakpoint: $breakpoint,
        ));
    }

    /**
     * @param  array<string, mixed>  $headingProps
     */
    private function document(array $headingProps = ['text' => 'Hello builder', 'level' => 2], string $headingType = 'content.heading'): BuilderDocument
    {
        return BuilderDocument::fromArray([
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'node_root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'node_section_1',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => ['paddingTop' => '4rem'],
                            'tablet' => ['paddingTop' => '3rem'],
                            'mobile' => ['paddingTop' => '2rem'],
                        ],
                        'children' => [
                            [
                                'id' => 'node_container_1',
                                'type' => 'layout.container',
                                'props' => [],
                                'styles' => [
                                    'tablet' => ['maxWidth' => '64rem'],
                                ],
                                'children' => [
                                    [
                                        'id' => 'node_heading_1',
                                        'type' => $headingType,
                                        'props' => $headingProps,
                                        'styles' => [
                                            'desktop' => ['fontSize' => '3rem'],
                                            'tablet' => ['fontSize' => '2.5rem'],
                                            'mobile' => ['fontSize' => '2rem', 'fontWeight' => '700'],
                                        ],
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
            'metadata' => [],
        ]);
    }
}
