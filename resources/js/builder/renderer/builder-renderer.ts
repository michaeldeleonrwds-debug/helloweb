import type { BuilderComponentNode, BuilderPageDocument } from '../document';
import { readElementCustomCss, wrapElementCustomCss } from './element-custom-css';
import type { RenderContext } from './render-context';
import { fragment, type RenderResult } from './render-result';
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
        const result = renderer.render(node, definition, this.context, children);
        const customCss = readElementCustomCss(node);

        if (customCss === null) {
            return result;
        }

        return fragment([
            {
                tag: 'style',
                attributes: {},
                styles: {},
                text: wrapElementCustomCss(node.id, customCss),
                children: [],
            },
            result,
        ]);
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
