import type { ComponentRenderer } from './component-renderer';
import { fragment } from './render-result';
import type { ComponentRendererRegistry } from './renderer-registry';
import { RendererError } from './renderer-registry';
import { resolveStyles } from './style-resolver';

export const rootRenderer: ComponentRenderer = {
    render(_node, _definition, _context, children) {
        return fragment(children);
    },
};

export const sectionRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        return {
            tag: 'section',
            attributes: {
                'data-builder-id': node.id,
                'data-builder-type': node.type,
            },
            styles: resolveStyles(node, definition, context.breakpoint),
            children,
        };
    },
};

export const containerRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        return {
            tag: 'div',
            attributes: {
                'data-builder-id': node.id,
                'data-builder-type': node.type,
            },
            styles: resolveStyles(node, definition, context.breakpoint),
            children,
        };
    },
};

export const headingRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const level = props.level ?? 2;

        if (!Number.isInteger(level) || Number(level) < 1 || Number(level) > 6) {
            throw RendererError.invalidNode('Heading level must be an integer between 1 and 6.');
        }

        return {
            tag: `h${level}`,
            attributes: {
                'data-builder-id': node.id,
                'data-builder-type': node.type,
            },
            styles: resolveStyles(node, definition, context.breakpoint),
            text: String(props.text ?? ''),
            children: [],
        };
    },
};

export function registerBuiltInRenderers(registry: ComponentRendererRegistry): ComponentRendererRegistry {
    return registry
        .register('layout.root', rootRenderer)
        .register('layout.section', sectionRenderer)
        .register('layout.container', containerRenderer)
        .register('content.heading', headingRenderer);
}
