<?php

namespace Tests\Unit\Builder\Registry;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Renderer\BuilderRenderer;
use App\Builder\Renderer\BuiltInRendererDefinitions;
use App\Builder\Renderer\RenderContext;
use PHPUnit\Framework\TestCase;

class ComponentLibraryTest extends TestCase
{
    public function test_foundational_component_library_is_registered(): void
    {
        $registry = BuiltInComponentDefinitions::registry();

        foreach (['layout.section', 'layout.container', 'layout.stack', 'layout.flex', 'layout.grid', 'layout.columns', 'layout.spacer', 'layout.divider', 'content.heading', 'content.text', 'content.richtext', 'content.button', 'content.link', 'media.image', 'marketing.card'] as $type) {
            $this->assertTrue($registry->has($type), "Missing component [{$type}].");
        }

        $this->assertContains('gap', $registry->get('layout.stack')->styleCapabilities());
        $this->assertContains('fontSize', $registry->get('content.text')->styleCapabilities());
        $this->assertSame(['type' => 'string'], $registry->get('content.button')->propSchema()['text']);
    }

    public function test_foundational_components_render_through_the_renderer_registry(): void
    {
        $document = BuilderDocument::fromArray([
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root', 'type' => 'layout.root', 'props' => [], 'styles' => [], 'children' => [[
                    'id' => 'section', 'type' => 'layout.section', 'props' => [], 'styles' => [], 'children' => [[
                        'id' => 'stack', 'type' => 'layout.stack', 'props' => [], 'styles' => [], 'children' => [
                            ['id' => 'heading', 'type' => 'content.heading', 'props' => ['text' => 'Hello', 'level' => 2], 'styles' => [], 'children' => []],
                            ['id' => 'text', 'type' => 'content.text', 'props' => ['text' => 'Body copy'], 'styles' => [], 'children' => []],
                            ['id' => 'button', 'type' => 'content.button', 'props' => ['text' => 'Start', 'href' => '/start'], 'styles' => [], 'children' => []],
                            ['id' => 'card', 'type' => 'marketing.card', 'props' => [], 'styles' => [], 'children' => []],
                        ],
                    ]],
                ]],
            ],
        ]);

        $html = (new BuilderRenderer(new RenderContext(BuiltInComponentDefinitions::registry(), BuiltInRendererDefinitions::registry(), 'desktop')))->renderDocument($document)->toHtml();

        $this->assertStringContainsString('<h2', $html);
        $this->assertStringContainsString('Body copy', $html);
        $this->assertStringContainsString('href="/start"', $html);
        $this->assertStringContainsString('<article', $html);
    }
}
