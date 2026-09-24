import { hasVisibleCodeContent } from '../code-content';
import type { ResolvedStyle } from '../style/style';
import type { ComponentRenderer } from './component-renderer';
import { composeEffectsStyles } from './compose-effects';
import { ELEMENT_CUSTOM_CSS_SCOPE_ATTRIBUTE, readElementCustomCss } from './element-custom-css';
import type { RenderResult } from './render-result';
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
        const styles = resolveStyles(node, definition, context.breakpoint);
        const backgroundType = String(styles.backgroundType ?? 'solid');
        const backgroundVideo = String(styles.backgroundVideo ?? '');
        const renderedStyles = applyBackgroundStyles(styles);

        const content =
            backgroundType === 'video' && backgroundVideo
                ? {
                      tag: 'div',
                      attributes: { 'data-builder-background-content': 'true' },
                      styles: { position: 'relative', zIndex: 1 },
                      children,
                  }
                : null;

        return {
            tag: 'section',
            attributes: nodeAttributes(node),
            styles: renderedStyles,
            children:
                backgroundType === 'video' && backgroundVideo
                    ? [
                          {
                              tag: 'video',
                              attributes: {
                                  src: backgroundVideo,
                                  autoplay: 'true',
                                  muted: 'true',
                                  loop: 'true',
                                  playsinline: 'true',
                                  'aria-hidden': 'true',
                              },
                              styles: {
                                  position: 'absolute',
                                  inset: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: String(styles.backgroundSize ?? 'cover'),
                                  objectPosition: String(styles.backgroundPosition ?? 'center'),
                                  zIndex: 0,
                              },
                              children: [],
                          },
                          content!,
                      ]
                    : children,
        };
    },
};

export const containerRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        return {
            tag: 'div',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(resolveStyles(node, definition, context.breakpoint)),
            children,
        };
    },
};

export const headingRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const level = props.level ?? 2;
        const colorSegments = renderColorSegments(props.colorSegments);

        if (!Number.isInteger(level) || Number(level) < 1 || Number(level) > 6) {
            throw RendererError.invalidNode('Heading level must be an integer between 1 and 6.');
        }

        return {
            tag: `h${level}`,
            attributes: nodeAttributes(node),
            styles: resolveStyles(node, definition, context.breakpoint),
            text: colorSegments ? undefined : String(props.text ?? ''),
            html: colorSegments ?? undefined,
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
            const styles = resolveStyles(node, definition, context.breakpoint);
            if (node.type === 'layout.row' && node.props.fullWidth === true) {
                styles.maxWidth = 'none';
                styles.width = '100%';
                styles.margin = '0';
            }
            const emptyImage: RenderResult = {
                tag,
                attributes: nodeAttributes(node),
                styles: applyBackgroundStyles(styles),
                children,
            };
            return emptyImage;
        },
    };
}

function applyBackgroundStyles(styles: ResolvedStyle): ResolvedStyle {
    const renderedStyles = { ...styles };
    const backgroundType = String(styles.backgroundType ?? 'solid');

    delete renderedStyles.backgroundType;
    delete renderedStyles.backgroundGradient;
    delete renderedStyles.backgroundVideo;

    if (backgroundType === 'gradient' && styles.backgroundGradient) {
        renderedStyles.backgroundImage = String(styles.backgroundGradient);
    } else if (backgroundType === 'image' && styles.backgroundImage) {
        renderedStyles.backgroundImage = `url(${JSON.stringify(String(styles.backgroundImage))})`;
    } else if (backgroundType !== 'image') {
        delete renderedStyles.backgroundImage;
    }

    return composeEffectsStyles(renderedStyles);
}

function textRenderer(tag = 'p'): ComponentRenderer {
    return {
        render(node, definition, context, children) {
            const props = { ...(definition.defaultProps ?? {}), ...node.props };
            const colorSegments = renderColorSegments(props.colorSegments);

            return {
                tag,
                attributes: nodeAttributes(node),
                styles: applyBackgroundStyles(resolveStyles(node, definition, context.breakpoint)),
                text: colorSegments ? undefined : String(props.text ?? ''),
                html: colorSegments ?? undefined,
                children,
            };
        },
    };
}

function renderColorSegments(value: unknown): string | null {
    if (!Array.isArray(value) || value.length === 0) return null;

    const html = value
        .map((segment) => {
            if (!isColorSegment(segment)) return '';
            const text = escapeHtml(segment.text);
            if (text === '') return '';

            return `<span style="color: ${escapeHtml(segment.color)}">${text}</span>`;
        })
        .join('');

    return html === '' ? null : html;
}

function isColorSegment(value: unknown): value is { text: string; color: string } {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { text?: unknown }).text === 'string' &&
        typeof (value as { color?: unknown }).color === 'string' &&
        isSafeColor((value as { color: string }).color)
    );
}

function isSafeColor(value: string): boolean {
    return /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i.test(value);
}

function escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const linkRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        return {
            tag: 'a',
            attributes: { ...nodeAttributes(node), href: String(props.href ?? '#') },
            styles: resolveStyles(node, definition, context.breakpoint),
            text: String(props.text ?? ''),
            children,
        };
    },
};

const imageRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const src = String(props.src ?? '');
        const alt = String(props.alt ?? '');
        if (!src) {
            const emptyImage: RenderResult = {
                tag: 'div',
                attributes: { ...nodeAttributes(node), 'data-builder-empty-image': 'true' },
                styles: {
                    ...resolveStyles(node, definition, context.breakpoint),
                    minHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                text: 'Upload an image',
                children,
            };
            return emptyImage;
        }
        return {
            tag: 'img',
            attributes: { ...nodeAttributes(node), src, alt },
            styles: resolveStyles(node, definition, context.breakpoint),
            children: [],
        };
    },
};

const customCodeRenderer: ComponentRenderer = {
    render(node) {
        const code = typeof node.props.code === 'string' ? node.props.code : '';
        const className = node.metadata?.className;
        const stylableWrapper = (typeof className === 'string' && className.trim() !== '') || readElementCustomCss(node) !== null;
        const styles: ResolvedStyle = stylableWrapper || hasVisibleCodeContent(code) ? {} : { display: 'contents' };

        return {
            tag: 'div',
            attributes: nodeAttributes(node),
            styles,
            html: code,
            children: [],
        };
    },
};

export function registerBuiltInRenderers(registry: ComponentRendererRegistry): ComponentRendererRegistry {
    return registry
        .register('layout.root', rootRenderer)
        .register('layout.section', sectionRenderer)
        .register('layout.row', blockRenderer('div'))
        .register('layout.column', blockRenderer('div'))
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
        .register('code.customcode', customCodeRenderer)
        .register('marketing.card', blockRenderer('article'))
        .register('reusable.instance', reusableInstanceRenderer);
}

function nodeAttributes(node: { id: string; type: string; metadata?: Record<string, unknown> }): Record<string, string> {
    const attributes: Record<string, string> = {
        'data-builder-id': node.id,
        'data-builder-type': node.type,
    };
    const className = node.metadata?.className;
    if (typeof className === 'string' && className.trim() !== '') {
        attributes.class = className;
    }
    if (readElementCustomCss(node) !== null) {
        attributes[ELEMENT_CUSTOM_CSS_SCOPE_ATTRIBUTE] = node.id;
    }

    return attributes;
}
