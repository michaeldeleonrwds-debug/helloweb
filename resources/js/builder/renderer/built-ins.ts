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

export const reusableInstanceRenderer: ComponentRenderer = {
    render() {
        throw RendererError.invalidNode('Reusable component references must be resolved before rendering.');
    },
};

function blockRenderer(tag: string): ComponentRenderer {
    return {
        render(node, definition, context, children) {
            return {
                tag,
                attributes: { 'data-builder-id': node.id, 'data-builder-type': node.type },
                styles: resolveStyles(node, definition, context.breakpoint),
                children,
            };
        },
    };
}

function textRenderer(tag = 'p'): ComponentRenderer {
    return {
        render(node, definition, context, children) {
            const props = { ...(definition.defaultProps ?? {}), ...node.props };
            return {
                tag,
                attributes: { 'data-builder-id': node.id, 'data-builder-type': node.type },
                styles: resolveStyles(node, definition, context.breakpoint),
                text: String(props.text ?? ''),
                children,
            };
        },
    };
}

const linkRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        return {
            tag: 'a',
            attributes: { 'data-builder-id': node.id, 'data-builder-type': node.type, href: String(props.href ?? '#') },
            styles: resolveStyles(node, definition, context.breakpoint),
            text: String(props.text ?? ''),
            children,
        };
    },
};

const imageRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        return {
            tag: 'img',
            attributes: { 'data-builder-id': node.id, 'data-builder-type': node.type, src: String(props.src ?? ''), alt: String(props.alt ?? '') },
            styles: resolveStyles(node, definition, context.breakpoint),
            children,
        };
    },
};

export function registerBuiltInRenderers(registry: ComponentRendererRegistry): ComponentRendererRegistry {
    return registry
        .register('layout.root', rootRenderer)
        .register('layout.section', sectionRenderer)
        .register('layout.container', containerRenderer)
        .register('content.heading', headingRenderer)
        .register('layout.stack', blockRenderer('div'))
        .register('layout.flex', blockRenderer('div'))
        .register('layout.grid', blockRenderer('div'))
        .register('layout.columns', blockRenderer('div'))
        .register('layout.spacer', blockRenderer('div'))
        .register('layout.divider', blockRenderer('hr'))
        .register('content.text', textRenderer())
        .register('content.richtext', textRenderer())
        .register('content.button', linkRenderer)
        .register('content.link', linkRenderer)
        .register('media.image', imageRenderer)
        .register('marketing.card', blockRenderer('article'))
        .register('reusable.instance', reusableInstanceRenderer);
}
