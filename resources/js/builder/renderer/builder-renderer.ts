import type { BuilderComponentNode, BuilderPageDocument } from '../document';
import type { RenderContext } from './render-context';
import type { RenderResult } from './render-result';
import { RendererError } from './renderer-registry';

export class BuilderRenderer {
    constructor(private readonly context: RenderContext) {}

    renderDocument(document: BuilderPageDocument): RenderResult {
        return this.renderNode(document.root);
    }

    renderNode(node: BuilderComponentNode): RenderResult {
        assertValidNode(node);

        if (!this.context.componentRegistry.has(node.type)) {
            throw RendererError.unknownComponentType(node.type);
        }

        const definition = this.context.componentRegistry.get(node.type);
        const renderer = this.context.rendererRegistry.get(node.type);
        const children = node.children.map((child) => this.renderNode(child));

        return renderer.render(node, definition, this.context, children);
    }
}

function assertValidNode(node: BuilderComponentNode): void {
    if (!node.id || typeof node.id !== 'string') {
        throw RendererError.invalidNode('Node id must be a non-empty string.');
    }

    if (!node.type || typeof node.type !== 'string') {
        throw RendererError.invalidNode('Node type must be a non-empty string.');
    }

    if (!node.props || !node.styles || !Array.isArray(node.children)) {
        throw RendererError.invalidNode('Node props, styles, and children must be present.');
    }
}
