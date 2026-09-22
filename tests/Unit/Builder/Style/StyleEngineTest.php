<?php

namespace Tests\Unit\Builder\Style;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Engine\ComponentTreeEngine;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Renderer\BuilderRenderer;
use App\Builder\Renderer\BuiltInRendererDefinitions;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Style\StyleSchema;
use PHPUnit\Framework\TestCase;

class StyleEngineTest extends TestCase
{
    public function test_style_schema_is_typed_and_data_driven(): void
    {
        $definitions = StyleSchema::definitions();

        $this->assertSame('length', $definitions['fontSize']->type);
        $this->assertContains('center', $definitions['textAlign']->options);
        $this->assertTrue($definitions['padding']->responsive);
    }

    public function test_invalid_style_values_and_keys_are_rejected_by_document_validation(): void
    {
        $this->expectExceptionMessage('fontSize has an invalid value');

        BuilderDocument::fromArray($this->document([
            'desktop' => ['fontSize' => 'banana'],
        ]));
    }

    public function test_unsupported_style_property_is_rejected(): void
    {
        $this->expectExceptionMessage('is not a supported style property');

        BuilderDocument::fromArray($this->document([
            'desktop' => ['customCss' => 'color:red'],
        ]));
    }

    public function test_responsive_resolution_cascades_partial_overrides(): void
    {
        $document = BuilderDocument::fromArray($this->document([
            'desktop' => ['fontSize' => '32px', 'padding' => '40px'],
            'mobile' => ['fontSize' => '22px'],
        ]));

        $this->assertSame('32px', $this->resolve($document, 'tablet')->styles()['fontSize']);
        $this->assertSame('40px', $this->resolve($document, 'tablet')->styles()['padding']);
        $this->assertSame('22px', $this->resolve($document, 'mobile')->styles()['fontSize']);
        $this->assertSame('40px', $this->resolve($document, 'mobile')->styles()['padding']);
    }

    public function test_style_mutation_is_immutable_and_preserves_other_node_data(): void
    {
        $document = BuilderDocument::fromArray($this->document(['desktop' => ['fontSize' => '32px']]));
        $before = $document->toArray();
        $engine = new ComponentTreeEngine(BuiltInComponentDefinitions::registry());

        $updated = $engine->updateStyles($document, 'heading', 'tablet', ['fontSize' => '28px']);

        $this->assertSame($before, $document->toArray());
        $this->assertSame('heading', $updated->toArray()['root']['children'][0]['children'][0]['id']);
        $this->assertSame(['text' => 'Hello', 'level' => 2], $updated->toArray()['root']['children'][0]['children'][0]['props']);
        $this->assertSame(['desktop' => ['fontSize' => '32px'], 'tablet' => ['fontSize' => '28px']], $updated->toArray()['root']['children'][0]['children'][0]['styles']);
    }

    public function test_style_override_can_be_cleared_without_affecting_other_breakpoints(): void
    {
        $document = BuilderDocument::fromArray($this->document([
            'desktop' => ['fontSize' => '32px'],
            'tablet' => ['fontSize' => '28px'],
        ]));
        $engine = new ComponentTreeEngine(BuiltInComponentDefinitions::registry());

        $updated = $engine->clearStyleOverride($document, 'heading', 'tablet', 'fontSize');

        $this->assertSame(['desktop' => ['fontSize' => '32px']], $updated->toArray()['root']['children'][0]['children'][0]['styles']);
    }

    public function test_style_serialization_is_stable_and_escaped(): void
    {
        $result = new RenderResult(tag: 'div', styles: ['color' => 'red', 'fontSize' => '32px']);

        $this->assertSame('<div style="color: red; font-size: 32px"></div>', $result->toHtml());
        $this->assertStringNotContainsString('onclick', (new RenderResult(tag: 'div', styles: ['color' => 'red']))->toHtml());
    }

    /** @param array<string, array<string, string>> $styles */
    private function document(array $styles): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [],
                'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [],
                    'children' => [[
                        'id' => 'heading', 'type' => 'content.heading', 'props' => ['text' => 'Hello', 'level' => 2], 'styles' => $styles, 'children' => [],
                    ]],
                ]],
            ],
        ];
    }

    private function resolve(BuilderDocument $document, string $breakpoint): RenderResult
    {
        return (new BuilderRenderer(new RenderContext(
            BuiltInComponentDefinitions::registry(),
            BuiltInRendererDefinitions::registry(),
            $breakpoint,
        )))->renderDocument($document)->children()[0]->children()[0];
    }
}
