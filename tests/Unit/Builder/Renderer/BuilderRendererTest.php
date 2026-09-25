<?php

namespace Tests\Unit\Builder\Renderer;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Renderer\BuilderRenderer;
use App\Builder\Renderer\BuiltIn\HeadingRenderer;
use App\Builder\Renderer\BuiltInRendererDefinitions;
use App\Builder\Renderer\CodeContent;
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

        $this->assertSame('900px', $container->styles()['maxWidth']);
        $this->assertStringContainsString('max-width: 900px', $container->toHtml());
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
            '<section data-builder-id="node_section_1" data-builder-type="layout.section" style="background-color: transparent; display: block; margin: 0 auto; min-height: 50px; padding: 10px; padding-bottom: 10px; padding-left: 0px; padding-right: 0px; padding-top: 3rem; position: relative; width: 100%"><div data-builder-id="node_container_1" data-builder-type="layout.container" style="background-color: transparent; display: block; margin: 0 auto; max-width: 64rem; padding: 10px; width: 100%"><h2 data-builder-id="node_heading_1" data-builder-type="content.heading" style="font-size: 2.5rem">Hello builder</h2></div></section>',
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

    public function test_element_custom_css_renders_a_scoped_style_block(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['children'][0]['children'][0]['metadata'] = [
            'customCss' => "color: red;\n&:hover { opacity: 0.5; }",
        ];

        $result = $this->renderer()->renderDocument(BuilderDocument::fromArray($data));
        $wrappedHeading = $result->children()[0]->children()[0]->children()[0];

        $this->assertNull($wrappedHeading->tag());
        $this->assertCount(2, $wrappedHeading->children());

        $style = $wrappedHeading->children()[0];
        $this->assertSame('style', $style->tag());
        $this->assertSame(
            "[data-builder-css-scope=\"node_heading_1\"] {\ncolor: red;\n&:hover { opacity: 0.5; }\n}",
            $style->text(),
        );

        $heading = $wrappedHeading->children()[1];
        $this->assertSame('h2', $heading->tag());
        $this->assertSame('node_heading_1', $heading->attributes()['data-builder-css-scope']);
    }

    public function test_element_custom_css_style_text_is_not_entity_escaped(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['children'][0]['children'][0]['metadata'] = [
            'customCss' => '&:hover { opacity: 0.5; }',
        ];

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString('&:hover { opacity: 0.5; }', $html);
        $this->assertStringNotContainsString('&amp;:hover', $html);
    }

    public function test_whitespace_only_element_custom_css_is_ignored(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['children'][0]['children'][0]['metadata'] = ['customCss' => "  \n "];

        $heading = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->children()[0]->children()[0]->children()[0];

        $this->assertSame('h2', $heading->tag());
        $this->assertArrayNotHasKey('data-builder-css-scope', $heading->attributes());
    }

    public function test_element_without_custom_css_has_no_scope_attribute_or_style_block(): void
    {
        $result = $this->renderer()->renderDocument($this->document());
        $heading = $result->children()[0]->children()[0]->children()[0];

        $this->assertSame('h2', $heading->tag());
        $this->assertArrayNotHasKey('data-builder-css-scope', $heading->attributes());
        $this->assertStringNotContainsString('<style>', $result->toHtml());
    }

    public function test_effects_compose_into_shadow_filter_and_backdrop_filter(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['styles']['desktop'] = array_merge(
            $data['root']['children'][0]['styles']['desktop'],
            [
                'dropShadowX' => 4,
                'dropShadowY' => 10,
                'dropShadowBlur' => 30,
                'dropShadowSpread' => 2,
                'dropShadowColor' => 'rgba(2,6,23,0.4)',
                'layerBlur' => 5,
                'backgroundBlur' => 6,
                'glassRefraction' => 40,
                'glassOpacity' => 20,
            ],
        );

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString('box-shadow: 4px 10px 30px 2px rgba(2,6,23,0.4)', $html);
        $this->assertStringContainsString('filter: blur(5px)', $html);
        $this->assertStringContainsString('backdrop-filter: blur(6px) saturate(140%) contrast(116%)', $html);
        $this->assertStringContainsString('background-image: linear-gradient(135deg, rgba(255,255,255,0.200), rgba(255,255,255,0.060) 45%, rgba(255,255,255,0))', $html);
        $this->assertStringNotContainsString('drop-shadow-x', $html);
        $this->assertStringNotContainsString('layer-blur', $html);
        $this->assertStringNotContainsString('background-blur', $html);
        $this->assertStringNotContainsString('glass-refraction', $html);
    }

    public function test_rgba_background_color_with_blur_renders_transparent_background(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['styles']['desktop'] = array_merge(
            $data['root']['children'][0]['styles']['desktop'],
            [
                'backgroundColor' => 'rgba(255, 255, 255, 0.55)',
                'backgroundBlur' => 8,
            ],
        );

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString('background-color: rgba(255, 255, 255, 0.55)', $html);
        $this->assertStringContainsString('backdrop-filter: blur(8px)', $html);
        $this->assertStringNotContainsString('background-color: white', $html);
    }

    public function test_inner_and_glass_shadow_layers_chain_with_existing_box_shadow(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['styles']['desktop'] = array_merge(
            $data['root']['children'][0]['styles']['desktop'],
            [
                'boxShadow' => '0 8px 24px rgba(0,0,0,.12)',
                'innerShadowX' => 0,
                'innerShadowY' => 1,
                'innerShadowBlur' => 4,
                'innerShadowSpread' => 0,
                'innerShadowColor' => 'rgba(255,255,255,0.5)',
                'glassDepth' => 24,
                'glassSplay' => 35,
                'glassLightDegree' => 90,
                'glassOpacity' => 16,
                'dropShadowY' => 8,
            ],
        );

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString(
            'box-shadow: inset 0px 1px 4px 0px rgba(255,255,255,0.5), inset 0 2.88px 9.6px rgba(255,255,255,0.325), inset 0 -1.73px 12px rgba(15,23,42,0.072), 0px 8px 24px 0px rgba(15,23,42,0.18), 0 8px 24px rgba(0,0,0,.12)',
            $html,
        );
        $this->assertStringNotContainsString('inner-shadow-y', $html);
        $this->assertStringNotContainsString('glass-depth', $html);
        $this->assertStringNotContainsString('drop-shadow-y', $html);
    }

    public function test_custom_code_element_renders_raw_html_style_and_script(): void
    {
        $data = $this->documentArray();
        $data['root']['children'][0]['children'][0]['children'][] = [
            'id' => 'node_custom_code_1',
            'type' => 'code.customcode',
            'props' => [
                'code' => "<div class=\"promo\">Hi &amp; bye</div>\n<style>.promo{color:red}</style>\n<script>window.__customCode = true;</script>",
            ],
            'styles' => [],
            'children' => [],
            'metadata' => [],
        ];

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString('data-builder-type="code.customcode"', $html);
        $this->assertStringContainsString('<div class="promo">Hi &amp; bye</div>', $html);
        $this->assertStringContainsString('<style>.promo{color:red}</style>', $html);
        $this->assertStringContainsString('<script>window.__customCode = true;</script>', $html);
        $this->assertStringNotContainsString('&lt;script&gt;', $html);
        $this->assertStringNotContainsString('&amp;amp;', $html);
        $this->assertStringNotContainsString('display: contents', $html);
    }

    public function test_empty_custom_code_wrapper_is_layout_neutral_in_rendered_html(): void
    {
        $code = "<style>.hidden{color:red}</style>\n<script>window.__emptyCode = true;</script>";

        $this->assertTrue(CodeContent::hasVisibleContent('<div>Hi</div>'));
        $this->assertTrue(CodeContent::hasVisibleContent('<img src="/x.png" alt="">'));
        $this->assertFalse(CodeContent::hasVisibleContent('<!-- comment only -->'));
        $this->assertFalse(CodeContent::hasVisibleContent($code));

        $data = $this->documentArray();
        $data['root']['children'][0]['children'][0]['children'][] = [
            'id' => 'node_custom_code_empty',
            'type' => 'code.customcode',
            'props' => ['code' => $code],
            'styles' => [],
            'children' => [],
            'metadata' => [],
        ];

        $html = $this->renderer()->renderDocument(BuilderDocument::fromArray($data))->toHtml();

        $this->assertStringContainsString('display: contents', $html);
        $this->assertStringNotContainsString('min-height: 56px', $html);

        $classed = $this->documentArray();
        $classed['root']['children'][0]['children'][0]['children'][] = [
            'id' => 'node_custom_code_classed',
            'type' => 'code.customcode',
            'props' => ['code' => $code],
            'styles' => [],
            'children' => [],
            'metadata' => ['className' => 'code-anchor'],
        ];

        $classedHtml = $this->renderer()->renderDocument(BuilderDocument::fromArray($classed))->toHtml();

        $this->assertStringNotContainsString('display: contents', $classedHtml);
        $this->assertStringContainsString('class="code-anchor"', $classedHtml);
    }

    /**
     * @param  array<string, mixed>  $headingProps
     */
    private function document(array $headingProps = ['text' => 'Hello builder', 'level' => 2], string $headingType = 'content.heading'): BuilderDocument
    {
        return BuilderDocument::fromArray($this->documentArray($headingProps, $headingType));
    }

    /**
     * @param  array<string, mixed>  $headingProps
     * @return array<string, mixed>
     */
    private function documentArray(array $headingProps = ['text' => 'Hello builder', 'level' => 2], string $headingType = 'content.heading'): array
    {
        return [
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
        ];
    }
}
