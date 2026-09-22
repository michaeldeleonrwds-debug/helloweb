<?php

namespace App\Builder\Renderer;

use App\Builder\Document\BuilderDocument;

final readonly class BuilderRenderer
{
    public function __construct(
        private RenderContext $context,
    ) {}

    public function renderDocument(BuilderDocument $document): RenderResult
    {
        $data = $document->toArray();

        return $this->renderNode($data['root']);
    }

    /**
     * @param  array<string, mixed>  $node
     */
    public function renderNode(array $node): RenderResult
    {
        $this->assertValidNode($node);

        $type = $node['type'];

        if (! $this->context->componentRegistry()->has($type)) {
            throw RendererException::unknownComponentType($type);
        }

        $definition = $this->context->componentRegistry()->get($type);
        $renderer = $this->context->rendererRegistry()->get($type);
        $children = array_map(
            fn (array $child): RenderResult => $this->renderNode($child),
            $node['children'],
        );

        return $renderer->render($node, $definition, $this->context, $children);
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function assertValidNode(array $node): void
    {
        foreach (['id', 'type', 'props', 'styles', 'children'] as $key) {
            if (! array_key_exists($key, $node)) {
                throw RendererException::invalidNode("Node is missing required key [{$key}].");
            }
        }

        if (! is_string($node['id']) || trim($node['id']) === '') {
            throw RendererException::invalidNode('Node id must be a non-empty string.');
        }

        if (! is_string($node['type']) || trim($node['type']) === '') {
            throw RendererException::invalidNode('Node type must be a non-empty string.');
        }

        if (! is_array($node['props']) || ! is_array($node['styles']) || ! is_array($node['children'])) {
            throw RendererException::invalidNode('Node props, styles, and children must be arrays.');
        }
    }
}
