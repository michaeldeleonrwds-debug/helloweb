import { hasVisibleCodeContent } from '../code-content';
import { renderIconSvg } from '../icons/icon-pack';
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

export const buttonRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const text = String(props.text ?? '');
        const href = String(props.href ?? '#');
        const icon = String(props.icon ?? '');
        const customIcon = String(props.customIcon ?? '');
        const iconPosition = String(props.iconPosition ?? 'left');
        const iconSpacing = String(props.iconSpacing ?? '8px');
        const iconSize = String(props.iconSize ?? '16px');
        const showIcon = props.showIcon ?? Boolean(icon || customIcon);

        const hasIcon = showIcon && Boolean(icon || customIcon);

        const linkTarget = props.linkTarget === '_blank' ? '_blank' : undefined;
        const targetAttrs: Record<string, string> = linkTarget ? { target: '_blank', rel: 'noopener noreferrer' } : {};

        if (!hasIcon) {
            return {
                tag: 'a',
                attributes: { ...nodeAttributes(node), href, ...targetAttrs },
                styles: applyBackgroundStyles(styles),
                text,
                children,
            };
        }

        styles.display = styles.display || 'inline-flex';
        styles.alignItems = styles.alignItems || 'center';
        styles.justifyContent = styles.justifyContent || 'center';
        styles.gap = styles.gap || iconSpacing;

        const iconSvg = renderIconSvg(customIcon || icon, { size: iconSize });
        const textHtml = `<span>${escapeHtml(text)}</span>`;
        const html = iconPosition === 'right' ? `${textHtml}${iconSvg}` : `${iconSvg}${textHtml}`;

        return {
            tag: 'a',
            attributes: { ...nodeAttributes(node), href, ...targetAttrs },
            styles: applyBackgroundStyles(styles),
            html,
            children,
        };
    },
};

const linkRenderer: ComponentRenderer = {
    render(node, definition, context, children) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const linkTarget = props.linkTarget === '_blank' ? '_blank' : undefined;
        const targetAttrs: Record<string, string> = linkTarget ? { target: '_blank', rel: 'noopener noreferrer' } : {};

        return {
            tag: 'a',
            attributes: { ...nodeAttributes(node), href: String(props.href ?? '#'), ...targetAttrs },
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

export const navbarRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        if (props.sticky) {
            styles.position = 'sticky';
            styles.top = '0';
            styles.zIndex = 50;
        }
        const brandName = typeof props.brandName === 'string' ? props.brandName : '';
        const brandLogo = String(props.brandLogo ?? '');
        const brandHref = String(props.brandHref ?? '/');
        const rawLinks = Array.isArray(props.links) ? props.links : [];
        const links = rawLinks
            .map((l) => {
                if (typeof l === 'object' && l !== null && !Array.isArray(l)) {
                    const record = l as Record<string, unknown>;
                    return {
                        label: String(record.label ?? ''),
                        href: String(record.href ?? '#'),
                        target: record.target === '_blank' ? '_blank' : undefined,
                    };
                }
                return {
                    label: String(l ?? ''),
                    href: '#',
                    target: undefined,
                };
            })
            .filter((l) => l.label);
        const showCta = props.showCta !== false;
        const ctaText = String(props.ctaText ?? 'Get Started');
        const ctaHref = String(props.ctaHref ?? '#');
        const ctaTarget = props.ctaTarget === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
        const isMobileNav = context.breakpoint === 'mobile';

        const formatLinkTag = (l: { label: string; href: string; target?: string }, extraStyle = '') => {
            const targetAttr = l.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${escapeHtml(l.href)}"${targetAttr} style="text-decoration: none; color: inherit; opacity: 0.85; transition: opacity 0.15s; ${extraStyle}">${escapeHtml(l.label)}</a>`;
        };

        const html = `
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; max-width: 1200px; margin: 0 auto; flex-wrap: wrap;">
    <a href="${escapeHtml(brandHref)}" style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.125rem; text-decoration: none; color: inherit;">
        ${brandLogo ? `<img src="${escapeHtml(brandLogo)}" alt="${escapeHtml(brandName || 'Logo')}" style="height: 32px; width: auto; object-fit: contain;" />` : ''}
        ${brandName ? `<span>${escapeHtml(brandName)}</span>` : ''}
    </a>
    <nav class="hw-navbar-desktop-links" style="display: ${isMobileNav ? 'none' : 'flex'}; align-items: center; gap: 24px; font-size: 0.875rem; font-weight: 500;">
        ${links.map((l) => formatLinkTag(l)).join('')}
    </nav>
    <div style="display: flex; align-items: center; gap: 12px;">
        ${showCta ? `<a href="${escapeHtml(ctaHref)}"${ctaTarget} class="hw-navbar-cta" style="display: ${isMobileNav ? 'none' : 'inline-flex'}; align-items: center; justify-content: center; padding: 8px 18px; border-radius: 9999px; background: #0f172a; color: #ffffff; font-size: 0.75rem; font-weight: 600; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: opacity 0.15s;">${escapeHtml(ctaText)}</a>` : ''}
        <button type="button" class="hw-navbar-toggle-btn" data-hw-nav-toggle="true" aria-label="Toggle navigation" style="display: ${isMobileNav ? 'inline-flex' : 'none'}; padding: 6px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.15); background: transparent; cursor: pointer;">
            <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>
</div>
<div class="hw-navbar-mobile-menu" data-hw-nav-menu="true" style="display: none; flex-direction: column; gap: 12px; width: 100%; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08); margin-top: 12px;">
    ${links.map((l) => formatLinkTag(l, 'padding: 4px 0; font-size: 0.875rem;')).join('')}
    ${showCta ? `<a href="${escapeHtml(ctaHref)}"${ctaTarget} style="display: inline-flex; align-items: center; justify-content: center; padding: 8px 18px; border-radius: 9999px; background: #0f172a; color: #ffffff; font-size: 0.75rem; font-weight: 600; text-decoration: none; margin-top: 4px; text-align: center;">${escapeHtml(ctaText)}</a>` : ''}
</div>
<style>
    .hw-navbar-mobile-menu.is-open { display: flex; }
    header.hw-nav-open,
    header[data-builder-type="layout.navbar"]:has(.hw-navbar-mobile-menu.is-open),
    nav.hw-nav-open,
    nav:has(.hw-navbar-mobile-menu.is-open) {
        border-radius: 20px !important;
        transition: border-radius 0.2s ease;
    }
</style>
`;

        const attrs = nodeAttributes(node);
        attrs.class = attrs.class ? `${attrs.class} hw-navbar-wrapper` : 'hw-navbar-wrapper';

        return {
            tag: 'header',
            attributes: attrs,
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

export const blurbRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const title = String(props.title ?? 'Modern & Intuitive');
        const description = String(props.description ?? '');
        const icon = String(props.icon ?? 'sparkles');
        const customIcon = String(props.customIcon ?? '');
        const iconColor = String(props.iconColor ?? '#2563eb');
        const iconBg = String(props.iconBg ?? '#eff6ff');
        const iconPosition = String(props.iconPosition ?? 'top');
        const iconShape = String(props.iconShape ?? 'rounded');
        const linkText = String(props.linkText ?? '');
        const linkHref = String(props.linkHref ?? '#');

        let borderRadius = '12px';
        if (iconShape === 'circle') borderRadius = '9999px';
        else if (iconShape === 'square') borderRadius = '0px';
        else if (iconShape === 'none') borderRadius = '0px';

        const iconBoxBg = iconShape === 'none' ? 'transparent' : iconBg;
        const iconHtml = renderIconSvg(customIcon || icon, { size: 22, color: iconColor });

        const iconContainer = `
<div style="display: flex; width: 44px; height: 44px; align-items: center; justify-content: center; border-radius: ${borderRadius}; background-color: ${escapeHtml(iconBoxBg)}; color: ${escapeHtml(iconColor)}; flex-shrink: 0;">
    ${iconHtml}
</div>
`;

        const textContent = `
<div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
    <h3 style="font-size: 1rem; font-weight: 600; line-height: 1.35; margin: 0; color: inherit;">${escapeHtml(title)}</h3>
    ${description ? `<p style="font-size: 0.8125rem; line-height: 1.55; opacity: 0.8; margin: 0; color: inherit;">${escapeHtml(description)}</p>` : ''}
    ${linkText ? `<a href="${escapeHtml(linkHref)}" style="font-size: 0.75rem; font-weight: 600; text-decoration: none; color: ${escapeHtml(iconColor)}; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px;">${escapeHtml(linkText)}</a>` : ''}
</div>
`;

        const isLeft = iconPosition === 'left';
        const html = isLeft
            ? `<div style="display: flex; align-items: flex-start; gap: 14px; width: 100%;">${iconContainer}${textContent}</div>`
            : `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px; width: 100%;">${iconContainer}${textContent}</div>`;

        return {
            tag: 'div',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

export const listRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const listType = String(props.listType ?? 'check');
        const iconColor = String(props.iconColor ?? '#10b981');
        const iconName = String(props.icon ?? 'check');
        const customIcon = String(props.customIcon ?? '');
        const iconSize = String(props.iconSize ?? '16px');
        let items: string[] = [];
        if (typeof props.text === 'string' && props.text.trim()) {
            items = props.text.split('\n').map((s) => s.trim()).filter(Boolean);
        } else if (Array.isArray(props.items)) {
            items = props.items.map(String).filter(Boolean);
        }
        if (items.length === 0) {
            items = ['Item 1', 'Item 2', 'Item 3'];
        }

        const html = items
            .map((item, index) => {
                let iconSvg = '';
                if (listType === 'check') {
                    iconSvg = `<span style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 9999px; background: ${escapeHtml(iconColor)}22; color: ${escapeHtml(iconColor)}; flex-shrink: 0; margin-top: 2px;">
                    <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>`;
                } else if (listType === 'number') {
                    iconSvg = `<span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: ${escapeHtml(iconColor)}18; color: ${escapeHtml(iconColor)}; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px;">
                    ${index + 1}
                </span>`;
                } else if (listType === 'icon') {
                    iconSvg = `<span style="display: flex; align-items: center; justify-content: center; width: ${escapeHtml(iconSize)}; height: ${escapeHtml(iconSize)}; color: ${escapeHtml(iconColor)}; flex-shrink: 0; margin-top: 2px;">
                    ${renderIconSvg(customIcon || iconName, { size: iconSize, color: iconColor })}
                </span>`;
                } else {
                    iconSvg = `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${escapeHtml(iconColor)}; flex-shrink: 0; margin-top: 7px; margin-left: 6px; margin-right: 6px;"></span>`;
                }

                return `<li style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.875rem; line-height: 1.5; color: inherit; list-style: none;">
                ${iconSvg}
                <span style="flex: 1;">${escapeHtml(item)}</span>
            </li>`;
            })
            .join('');

        return {
            tag: 'ul',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

export const pricingRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const showBadge = props.showBadge !== false;
        const badge = showBadge ? String(props.badge ?? '').trim() : '';
        const planName = String(props.planName ?? 'Pro').trim();
        const description = String(props.description ?? '').trim();
        const price = String(props.price ?? '$49').trim();
        const period = String(props.period ?? '/ month').trim();
        const ctaText = String(props.ctaText ?? '').trim();
        const ctaHref = String(props.ctaHref ?? '#');
        const accentColor = String(props.accentColor ?? '#2563eb');
        const highlighted = props.highlighted !== false;
        const features = String(props.featureText ?? '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        const featureHtml = features
            .map((feature) => `<li style="display: flex; align-items: flex-start; gap: 10px; min-width: 0; color: inherit;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex: 0 0 18px; margin-top: 2px; border-radius: 9999px; background: ${escapeHtml(accentColor)}1f; color: ${escapeHtml(accentColor)};">
        <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
    <span style="flex: 1; min-width: 0; overflow-wrap: anywhere;">${escapeHtml(feature)}</span>
</li>`)
            .join('');

        const html = `
<div class="hw-pricing-card-inner" style="display: flex; min-width: 0; width: 100%; flex-direction: column; gap: 18px;">
    <div style="display: flex; min-width: 0; flex-direction: column; gap: 10px;">
        ${badge ? `<span style="display: inline-flex; width: fit-content; max-width: 100%; align-items: center; border-radius: 9999px; background: ${escapeHtml(accentColor)}17; color: ${escapeHtml(accentColor)}; padding: 5px 10px; font-size: 0.6875rem; font-weight: 700; line-height: 1.2; text-transform: uppercase; overflow-wrap: anywhere;">${escapeHtml(badge)}</span>` : ''}
        <h3 style="margin: 0; color: inherit; font-size: 1.25rem; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere;">${escapeHtml(planName)}</h3>
        ${description ? `<p style="margin: 0; color: inherit; font-size: 0.875rem; line-height: 1.6; opacity: 0.76; overflow-wrap: anywhere;">${escapeHtml(description)}</p>` : ''}
    </div>
    <div style="display: flex; min-width: 0; align-items: baseline; gap: 8px; flex-wrap: wrap; padding-top: 2px;">
        <span style="color: inherit; font-size: ${context.breakpoint === 'mobile' ? '2rem' : '2.5rem'}; font-weight: 800; line-height: 1; overflow-wrap: anywhere;">${escapeHtml(price)}</span>
        ${period ? `<span style="color: inherit; font-size: 0.875rem; line-height: 1.4; opacity: 0.68; overflow-wrap: anywhere;">${escapeHtml(period)}</span>` : ''}
    </div>
    ${featureHtml ? `<ul style="display: flex; flex-direction: column; gap: 11px; margin: 0; padding: 0; list-style: none; font-size: 0.875rem; line-height: 1.5;">${featureHtml}</ul>` : ''}
    ${ctaText ? `<a href="${escapeHtml(ctaHref)}" style="display: inline-flex; min-height: 44px; width: 100%; align-items: center; justify-content: center; border-radius: 12px; background: ${escapeHtml(accentColor)}; color: #ffffff; padding: 11px 16px; text-align: center; text-decoration: none; font-size: 0.875rem; font-weight: 700; line-height: 1.2; box-shadow: ${highlighted ? '0 12px 24px rgba(37, 99, 235, 0.22)' : 'none'}; overflow-wrap: anywhere;">${escapeHtml(ctaText)}</a>` : ''}
</div>
`;

        return {
            tag: 'article',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

function objectItems(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
        : [];
}

export const carouselRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const slides = objectItems(props.slides);
        const aspectRatio = String(props.aspectRatio ?? '16/9');
        const accentColor = String(props.accentColor ?? '#2563eb');
        const html = `<div style="display: flex; width: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: thin;">
${slides.map((slide) => {
    const src = String(slide.src ?? '');
    const title = String(slide.title ?? '');
    const caption = String(slide.caption ?? '');
    return `<figure style="position: relative; flex: 0 0 100%; min-width: 0; aspect-ratio: ${escapeHtml(aspectRatio)}; scroll-snap-align: start; margin: 0; background: #e2e8f0;">
        ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(title || caption)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` : ''}
        ${(title || caption) ? `<figcaption style="position: absolute; inset-inline: 0; bottom: 0; padding: ${context.breakpoint === 'mobile' ? '28px 16px 14px' : '48px 24px 18px'}; background: linear-gradient(transparent, rgba(2, 6, 23, 0.76)); color: #ffffff;">
            ${title ? `<strong style="display: block; font-size: 1rem; line-height: 1.25; overflow-wrap: anywhere;">${escapeHtml(title)}</strong>` : ''}
            ${caption ? `<span style="display: block; margin-top: 4px; font-size: 0.8125rem; line-height: 1.45; opacity: 0.86; overflow-wrap: anywhere;">${escapeHtml(caption)}</span>` : ''}
        </figcaption>` : ''}
    </figure>`;
}).join('')}
</div><div aria-hidden="true" style="display: flex; justify-content: center; gap: 6px; padding: 10px;">${slides.map((_slide, index) => `<span style="width: 7px; height: 7px; border-radius: 9999px; background: ${index === 0 ? escapeHtml(accentColor) : '#cbd5e1'};"></span>`).join('')}</div>`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const logoMarqueeRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const logoImages = parseEnhancedLogoImages(props.logos, props.logoImages);
        const direction = String(props.direction ?? 'left') === 'right' ? 'reverse' : 'normal';
        const speed = String(props.speed ?? '25s');
        const pauseOnHover = props.pauseOnHover !== false;
        const fadeEdges = props.fadeEdges !== false;
        const fadeWidth = String(props.fadeWidth ?? (context.breakpoint === 'mobile' ? '36px' : '72px'));
        const grayscale = props.grayscale !== false;
        const logoCardStyle = String(props.logoCardStyle ?? 'card');
        const logoBackground = String(props.logoBackground ?? '#ffffff');
        const borderColor = String(props.borderColor ?? '#e2e8f0');
        const logoHeight = String(props.logoHeight ?? (context.breakpoint === 'mobile' ? '32px' : '48px'));
        const itemHeight = props.itemHeight ? String(props.itemHeight) : '';
        const itemWidth = props.itemWidth ? String(props.itemWidth) : '';
        const badgeShape = String(props.badgeShape ?? 'rounded');
        const objectFit = String(props.objectFit ?? 'contain');
        const gap = String(props.gap ?? (context.breakpoint === 'mobile' ? '16px' : '28px'));
        const className = `hw-marquee-${node.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        const showPartnerNames = Boolean(props.showPartnerNames);
        const isCard = logoCardStyle === 'card';

        let borderRadius = '12px';
        if (badgeShape === 'circle') {
            borderRadius = '50%';
        } else if (badgeShape === 'pill') {
            borderRadius = '9999px';
        } else if (badgeShape === 'square') {
            borderRadius = '0px';
        }

        const sizeStyles = [
            itemHeight ? `height: ${escapeHtml(itemHeight)};` : '',
            itemWidth && itemWidth !== 'auto' ? `width: ${escapeHtml(itemWidth)};` : '',
            badgeShape === 'circle' && itemHeight && (!itemWidth || itemWidth === 'auto') ? `width: ${escapeHtml(itemHeight)}; aspect-ratio: 1 / 1;` : '',
        ].filter(Boolean).join(' ');

        const cardStyleString = isCard
            ? `border: 1px solid ${escapeHtml(borderColor)}; border-radius: ${borderRadius}; background: ${escapeHtml(logoBackground)}; padding: ${context.breakpoint === 'mobile' ? '8px 14px' : '10px 20px'}; box-shadow: 0 1px 3px rgba(0,0,0,0.06); ${sizeStyles}`
            : `background: transparent; padding: 4px; ${sizeStyles}`;

        const logoItemHtml = (logo: { src: string; alt: string; href?: string; name?: string }) => {
            const inner = `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt)}" loading="lazy" style="display: block; width: auto; height: ${escapeHtml(logoHeight)}; max-width: 100%; object-fit: ${escapeHtml(objectFit)}; ${badgeShape === 'circle' ? `border-radius: 50%;` : ''} ${grayscale ? 'filter: grayscale(100%) opacity(0.75); transition: filter 0.25s, opacity 0.25s, transform 0.2s;' : 'transition: transform 0.2s;'}" class="${grayscale ? 'hw-marquee-logo-img' : ''}" />${showPartnerNames && logo.name ? `<span style="font-size: 11px; font-weight: 600; color: inherit; opacity: 0.85; white-space: nowrap;">${escapeHtml(logo.name)}</span>` : ''}`;

            if (logo.href && logo.href.trim() !== '') {
                return `<a href="${escapeHtml(logo.href)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; flex: 0 0 auto; min-width: max-content; align-items: center; justify-content: center; gap: 8px; text-decoration: none; box-sizing: border-box; ${cardStyleString}" class="hw-marquee-item">${inner}</a>`;
            }

            return `<span style="display: inline-flex; flex: 0 0 auto; min-width: max-content; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; ${cardStyleString}" class="hw-marquee-item">${inner}</span>`;
        };

        const logoGroup = logoImages.map(logoItemHtml).join('');

        const maskStyle = fadeEdges
            ? `mask-image: linear-gradient(90deg, transparent 0%, #000 ${fadeWidth}, #000 calc(100% - ${fadeWidth}), transparent 100%); -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 ${fadeWidth}, #000 calc(100% - ${fadeWidth}), transparent 100%);`
            : '';

        const html = `
<div class="${className} hw-marquee-wrapper" style="display: flex; overflow: hidden; width: 100%; position: relative; ${maskStyle}">
    <div class="hw-marquee-track" style="display: flex; width: max-content; min-width: max-content; align-items: center; animation: ${className}-scroll ${escapeHtml(speed)} linear infinite; animation-direction: ${direction}; will-change: transform;">
        <div style="display: flex; flex: 0 0 auto; align-items: center; gap: ${gap}; padding-right: ${gap};">${logoGroup}</div>
        <div aria-hidden="true" style="display: flex; flex: 0 0 auto; align-items: center; gap: ${gap}; padding-right: ${gap};">${logoGroup}</div>
        <div aria-hidden="true" style="display: flex; flex: 0 0 auto; align-items: center; gap: ${gap}; padding-right: ${gap};">${logoGroup}</div>
    </div>
</div>
<style>
    @keyframes ${className}-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-33.333333%); }
    }
    ${pauseOnHover ? `.${className}:hover .hw-marquee-track { animation-play-state: paused !important; }` : ''}
    ${grayscale ? `.${className} .hw-marquee-item:hover .hw-marquee-logo-img { filter: grayscale(0%) opacity(1) !important; transform: scale(1.05); }` : ''}
    .${className} .hw-marquee-item { transition: transform 0.2s, box-shadow 0.2s; }
    .${className} .hw-marquee-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
</style>
`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

function parseEnhancedLogoImages(logos: unknown, fallbackText: unknown): Array<{ src: string; alt: string; href?: string; name?: string }> {
    if (Array.isArray(logos)) {
        const parsed = logos
            .map((item) => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const record = item as Record<string, unknown>;
                    return {
                        src: String(record.src ?? ''),
                        alt: String(record.alt ?? 'Logo'),
                        href: record.href ? String(record.href) : undefined,
                        name: record.name ? String(record.name) : undefined,
                    };
                }
                return { src: String(item), alt: 'Logo' };
            })
            .filter((logo) => logo.src !== '');

        if (parsed.length > 0) return parsed;
    }

    if (typeof fallbackText === 'string' && fallbackText.trim() !== '') {
        return fallbackText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const parts = line.split('|').map((part) => part.trim());
                return {
                    src: parts[0] || '',
                    alt: parts[1] || 'Logo',
                    href: parts[2] || undefined,
                };
            })
            .filter((logo) => logo.src !== '');
    }

    return [{ src: '/images/helloweb-logo-dark.png', alt: 'HelloWeb' }];
}

export const accordionRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const accentColor = String(props.accentColor ?? '#2563eb');
        const items = objectItems(props.items);
        const html = items.map((item, index) => {
            const title = String(item.title ?? `Item ${index + 1}`);
            const body = String(item.body ?? '');
            return `<details ${index === 0 ? 'open' : ''} style="border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; overflow: hidden;">
    <summary style="cursor: pointer; padding: 16px 18px; color: inherit; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere;">${escapeHtml(title)}</summary>
    <div style="border-top: 1px solid #e2e8f0; padding: 0 18px 16px; color: inherit; font-size: 0.875rem; line-height: 1.6; opacity: 0.78; overflow-wrap: anywhere; box-shadow: inset 3px 0 0 ${escapeHtml(accentColor)};">${escapeHtml(body)}</div>
</details>`;
        }).join('');
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const tabsRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const accentColor = String(props.accentColor ?? '#2563eb');
        const tabs = objectItems(props.tabs);
        const html = `<div style="display: grid; gap: 12px;">
    <div role="tablist" style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${tabs.map((tab, index) => `<span role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" style="display: inline-flex; align-items: center; border-radius: 9999px; border: 1px solid ${index === 0 ? escapeHtml(accentColor) : '#e2e8f0'}; background: ${index === 0 ? escapeHtml(accentColor) : '#ffffff'}; color: ${index === 0 ? '#ffffff' : 'inherit'}; padding: 9px 14px; font-size: 0.8125rem; font-weight: 700; line-height: 1;">${escapeHtml(String(tab.label ?? `Tab ${index + 1}`))}</span>`).join('')}
    </div>
    <div style="border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; padding: ${context.breakpoint === 'mobile' ? '18px' : '22px'}; color: inherit; font-size: 0.9375rem; line-height: 1.65; overflow-wrap: anywhere;">${escapeHtml(String(tabs[0]?.body ?? ''))}</div>
</div>`;
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const statsRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const accentColor = String(props.accentColor ?? '#2563eb');
        const stats = objectItems(props.stats);
        const columns = context.breakpoint === 'mobile' ? Number(props.columnsMobile ?? 1) : context.breakpoint === 'tablet' ? Number(props.columnsTablet ?? 3) : Number(props.columnsDesktop ?? 3);
        const html = `<div style="display: grid; grid-template-columns: repeat(${Math.max(1, columns)}, minmax(0, 1fr)); gap: 14px; width: 100%;">
${stats.map((stat) => `<div style="min-width: 0; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; padding: 20px; text-align: center;">
    <div style="color: ${escapeHtml(accentColor)}; font-size: ${context.breakpoint === 'mobile' ? '1.8rem' : '2.2rem'}; font-weight: 800; line-height: 1; overflow-wrap: anywhere;">${escapeHtml(String(stat.value ?? ''))}</div>
    <div style="margin-top: 8px; color: inherit; font-size: 0.8125rem; line-height: 1.4; opacity: 0.72; overflow-wrap: anywhere;">${escapeHtml(String(stat.label ?? ''))}</div>
</div>`).join('')}</div>`;
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const testimonialRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const accentColor = String(props.accentColor ?? '#2563eb');
        const html = `<figure style="display: flex; flex-direction: column; gap: 18px; margin: 0; min-width: 0;">
    <blockquote style="margin: 0; border-left: 4px solid ${escapeHtml(accentColor)}; padding-left: 16px; color: inherit; font-size: ${context.breakpoint === 'mobile' ? '1rem' : '1.125rem'}; font-weight: 600; line-height: 1.55; overflow-wrap: anywhere;">${escapeHtml(String(props.quote ?? ''))}</blockquote>
    <figcaption style="display: flex; flex-direction: column; gap: 3px; color: inherit;">
        <strong style="font-size: 0.9375rem; line-height: 1.3; overflow-wrap: anywhere;">${escapeHtml(String(props.author ?? ''))}</strong>
        <span style="font-size: 0.8125rem; line-height: 1.4; opacity: 0.68; overflow-wrap: anywhere;">${escapeHtml(String(props.role ?? ''))}</span>
    </figcaption>
</figure>`;
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export function normalizeVideoEmbedUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return '';
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|v\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return trimmed;
}

export const videoEmbedRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const rawSrc = String(props.src ?? '');
        const src = normalizeVideoEmbedUrl(rawSrc);
        const title = String(props.title ?? 'Embedded video');
        const aspectRatio = String(props.aspectRatio ?? '16/9');
        const html = src
            ? `<iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="display: block; width: 100%; aspect-ratio: ${escapeHtml(aspectRatio)}; height: auto; border: 0;"></iframe>`
            : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: ${escapeHtml(aspectRatio)}; color: #94a3b8; font-size: 0.875rem;">No video URL</div>`;
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const contactFormRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const accentColor = String(props.accentColor ?? '#2563eb');
        const fieldStyle = 'width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; color: #0f172a; padding: 11px 12px; font: inherit; min-width: 0;';
        const html = `<form style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; flex-direction: column; gap: 6px;">
        <h3 style="margin: 0; color: inherit; font-size: ${context.breakpoint === 'mobile' ? '1.25rem' : '1.5rem'}; line-height: 1.25; overflow-wrap: anywhere;">${escapeHtml(String(props.title ?? ''))}</h3>
        <p style="margin: 0; color: inherit; font-size: 0.875rem; line-height: 1.55; opacity: 0.72; overflow-wrap: anywhere;">${escapeHtml(String(props.description ?? ''))}</p>
    </div>
    <label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">${escapeHtml(String(props.nameLabel ?? 'Name'))}<input type="text" style="${fieldStyle}" /></label>
    <label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">${escapeHtml(String(props.emailLabel ?? 'Email'))}<input type="email" style="${fieldStyle}" /></label>
    <label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">${escapeHtml(String(props.messageLabel ?? 'Message'))}<textarea rows="5" style="${fieldStyle} resize: vertical;"></textarea></label>
    <button type="button" style="display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: ${escapeHtml(accentColor)}; color: #ffffff; padding: 11px 16px; font-size: 0.875rem; font-weight: 800; cursor: pointer;">${escapeHtml(String(props.buttonText ?? 'Send'))}</button>
</form>`;
        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const imageFeatureRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const showBadge = props.showBadge !== false;
        const badge = showBadge ? String(props.badge ?? '').trim() : '';
        const showTitle = props.showTitle !== false;
        const title = showTitle ? String(props.title ?? '').trim() : '';
        const showDescription = props.showDescription !== false;
        const description = showDescription ? String(props.description ?? '').trim() : '';
        const showCta = props.showCta !== false;
        const ctaText = showCta ? String(props.ctaText ?? '').trim() : '';
        const ctaHref = String(props.ctaHref ?? '#');
        const imageSrc = String(props.imageSrc ?? '');
        const imageAlt = String(props.imageAlt ?? '');
        const imagePosition = String(props.imagePosition ?? 'right');
        const cardStyle = props.cardStyle !== false;

        let flexDirection = 'row';
        if (imagePosition === 'left') {
            flexDirection = 'row-reverse';
        } else if (imagePosition === 'top') {
            flexDirection = 'column-reverse';
        } else if (imagePosition === 'bottom') {
            flexDirection = 'column';
        }

        const isStacked = imagePosition === 'top' || imagePosition === 'bottom';
        const stacksAtMobile = context.breakpoint === 'mobile';
        if (stacksAtMobile) {
            flexDirection = 'column';
        }
        const gap = stacksAtMobile || isStacked ? '24px' : '40px';
        const cardClass = cardStyle ? 'hw-image-feature-card' : '';

        if (cardStyle) {
            styles.backgroundColor = styles.backgroundColor || 'var(--card, #ffffff)';
            styles.borderRadius = styles.borderRadius || '16px';
            styles.borderWidth = styles.borderWidth || '1px';
            styles.borderStyle = styles.borderStyle || 'solid';
            styles.borderColor = styles.borderColor || 'var(--border, #e2e8f0)';
            styles.padding = styles.padding || (stacksAtMobile ? '20px' : '32px');
            styles.boxShadow = styles.boxShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)';
        }

        const html = `
<div class="hw-image-feature ${cardClass}" style="display: flex; flex-direction: ${flexDirection}; align-items: center; gap: ${gap}; width: 100%; flex-wrap: wrap;">
    <div style="flex: 1 1 320px; min-width: 280px; width: 100%; display: flex; flex-direction: column; gap: 14px; text-align: left;">
        ${badge ? `<span style="display: inline-block; width: fit-content; padding: 4px 12px; border-radius: 9999px; background: rgba(59, 130, 246, 0.1); color: #2563eb; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">${escapeHtml(badge)}</span>` : ''}
        ${title ? `<h2 style="font-size: 1.75rem; font-weight: 700; line-height: 1.25; margin: 0; color: inherit;">${escapeHtml(title)}</h2>` : ''}
        ${description ? `<p style="font-size: 0.875rem; line-height: 1.6; opacity: 0.8; margin: 0; color: inherit;">${escapeHtml(description)}</p>` : ''}
        ${ctaText ? `<a href="${escapeHtml(ctaHref)}" style="display: inline-flex; align-items: center; justify-content: center; width: fit-content; padding: 10px 22px; border-radius: 10px; background: #0f172a; color: #ffffff; font-size: 0.8125rem; font-weight: 600; text-decoration: none; margin-top: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: opacity 0.15s;">${escapeHtml(ctaText)} →</a>` : ''}
    </div>
    <div style="flex: 1 1 340px; min-width: 280px; width: 100%;">
        ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageAlt)}" style="width: 100%; height: auto; max-height: ${isStacked ? '420px' : '380px'}; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);" />` : `<div style="height: 220px; background: #f1f5f9; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.875rem;">No image selected</div>`}
    </div>
</div>
`;

        return {
            tag: 'div',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

export const galleryRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const colsDesktop = Number(props.columnsDesktop ?? props.columns ?? 3);
        const colsTablet = Number(props.columnsTablet ?? 2);
        const colsMobile = Number(props.columnsMobile ?? 1);
        const gapDesktop = String(props.gapDesktop ?? props.gap ?? '16px');
        const gapTablet = String(props.gapTablet ?? '12px');
        const gapMobile = String(props.gapMobile ?? '8px');
        const aspectRatio = String(props.aspectRatio ?? '4/3');
        const images = Array.isArray(props.images) ? props.images : [];

        let activeCols = colsDesktop;
        let activeGap = gapDesktop;
        if (context.breakpoint === 'tablet') {
            activeCols = colsTablet;
            activeGap = gapTablet;
        } else if (context.breakpoint === 'mobile') {
            activeCols = colsMobile;
            activeGap = gapMobile;
        }

        const galleryClass = `hw-gallery-${node.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        const html = `
<div class="hw-gallery-grid ${galleryClass}" style="display: grid; grid-template-columns: repeat(${activeCols}, 1fr); gap: ${escapeHtml(activeGap)}; width: 100%;">
    ${images
        .map((imgItem: unknown, idx: number) => {
            const img =
                typeof imgItem === 'object' && imgItem !== null && !Array.isArray(imgItem)
                    ? (imgItem as Record<string, unknown>)
                    : {};
            const src = String(img.src ?? '');
            const caption = String(img.caption ?? '');
            return `<div class="hw-gallery-item" data-hw-gallery-item="true" data-index="${idx}" data-src="${escapeHtml(src)}" data-caption="${escapeHtml(caption)}" style="position: relative; overflow: hidden; border-radius: 12px; aspect-ratio: ${escapeHtml(aspectRatio)}; cursor: pointer; background: #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" loading="lazy" />
            ${caption ? `<div style="position: absolute; inset-inline: 0; bottom: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 20px 12px 10px; color: #ffffff; font-size: 0.75rem; font-weight: 500;">${escapeHtml(caption)}</div>` : ''}
        </div>`;
        })
        .join('')}
</div>
<style>
    @media (max-width: 1024px) {
        .${galleryClass} { grid-template-columns: repeat(${colsTablet}, 1fr) !important; gap: ${escapeHtml(gapTablet)} !important; }
    }
    @media (max-width: 640px) {
        .${galleryClass} { grid-template-columns: repeat(${colsMobile}, 1fr) !important; gap: ${escapeHtml(gapMobile)} !important; }
    }
</style>
`;

        return {
            tag: 'div',
            attributes: nodeAttributes(node),
            styles: applyBackgroundStyles(styles),
            html,
            children: [],
        };
    },
};

export const countdownRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const targetDate = String(props.targetDate ?? '2026-12-31T23:59:59');
        const styleVariant = String(props.styleVariant ?? 'card');
        const showDays = props.showDays !== false;
        const showHours = props.showHours !== false;
        const showMinutes = props.showMinutes !== false;
        const showSeconds = props.showSeconds !== false;
        const labelDays = String(props.labelDays ?? 'Days');
        const labelHours = String(props.labelHours ?? 'Hours');
        const labelMinutes = String(props.labelMinutes ?? 'Minutes');
        const labelSeconds = String(props.labelSeconds ?? 'Seconds');
        const digitColor = String(props.digitColor ?? '#0f172a');
        const labelColor = String(props.labelColor ?? '#64748b');
        const cardBg = String(props.cardBackground ?? '#ffffff');
        const cardBorder = String(props.cardBorderColor ?? '#e2e8f0');
        const accentColor = String(props.accentColor ?? '#2563eb');
        const expiryText = String(props.expiryText ?? 'Special offer has ended!');
        const className = `hw-countdown-${node.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        // Compute initial static diff
        const now = Date.now();
        const targetMs = new Date(targetDate).getTime();
        const diff = Math.max(0, isNaN(targetMs) ? 86400000 : targetMs - now);
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        const pad = (n: number) => String(n).padStart(2, '0');

        const isMobile = context.breakpoint === 'mobile';
        const cardRadius = styleVariant === 'circle' ? '9999px' : styleVariant === 'minimal' ? '0' : '16px';
        const cardBorderString = styleVariant === 'card' ? `1px solid ${escapeHtml(cardBorder)}` : 'none';
        const cardShadow = styleVariant === 'card' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none';
        const cardBgString = styleVariant === 'minimal' ? 'transparent' : cardBg;
        const blockSize = styleVariant === 'circle' ? (isMobile ? '70px' : '90px') : 'auto';

        const blockItem = (id: string, val: string, label: string) => `
<div class="hw-countdown-block" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1 1 0; min-width: ${isMobile ? '60px' : '80px'}; width: ${blockSize}; height: ${blockSize}; padding: ${isMobile ? '10px 6px' : '16px 12px'}; background: ${escapeHtml(cardBgString)}; border: ${cardBorderString}; border-radius: ${cardRadius}; box-shadow: ${cardShadow}; text-align: center;">
    <span class="hw-countdown-digit ${id}" style="font-family: inherit; font-size: ${isMobile ? '1.5rem' : '2.25rem'}; font-weight: 800; line-height: 1; color: ${escapeHtml(digitColor)};">${escapeHtml(val)}</span>
    <span style="margin-top: 6px; font-size: ${isMobile ? '9px' : '11px'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${escapeHtml(labelColor)};">${escapeHtml(label)}</span>
</div>`;

        const html = `
<div class="${className} hw-countdown-container" style="display: flex; align-items: center; justify-content: center; gap: ${isMobile ? '8px' : '16px'}; width: 100%;" data-target="${escapeHtml(targetDate)}">
    ${showDays ? blockItem('hw-cd-days', pad(d), labelDays) : ''}
    ${showHours ? blockItem('hw-cd-hours', pad(h), labelHours) : ''}
    ${showMinutes ? blockItem('hw-cd-minutes', pad(m), labelMinutes) : ''}
    ${showSeconds ? blockItem('hw-cd-seconds', pad(s), labelSeconds) : ''}
</div>
<div class="${className}-expired" style="display: none; text-align: center; padding: 20px; font-weight: 700; color: ${escapeHtml(accentColor)};">${escapeHtml(expiryText)}</div>
<script>
(function() {
    var container = document.querySelector('.${className}');
    if (!container) return;
    var target = new Date(container.getAttribute('data-target')).getTime();
    if (isNaN(target)) return;
    function update() {
        var diff = target - Date.now();
        if (diff <= 0) {
            container.style.display = 'none';
            var exp = document.querySelector('.${className}-expired');
            if (exp) exp.style.display = 'block';
            return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff / 3600000) % 24);
        var m = Math.floor((diff / 60000) % 60);
        var s = Math.floor((diff / 1000) % 60);
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        var elD = container.querySelector('.hw-cd-days'); if (elD) elD.textContent = pad(d);
        var elH = container.querySelector('.hw-cd-hours'); if (elH) elH.textContent = pad(h);
        var elM = container.querySelector('.hw-cd-minutes'); if (elM) elM.textContent = pad(m);
        var elS = container.querySelector('.hw-cd-seconds'); if (elS) elS.textContent = pad(s);
    }
    update();
    setInterval(update, 1000);
})();
</script>
`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

const SOCIAL_SVG_PATHS: Record<string, string> = {
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    linkedin: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    github: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z',
    tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    whatsapp: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z',
};

const SOCIAL_BRAND_COLORS: Record<string, string> = {
    facebook: '#1877F2',
    twitter: '#000000',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    github: '#24292F',
    tiktok: '#000000',
    whatsapp: '#25D366',
};

export const socialIconsRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const items = Array.isArray(props.items) ? props.items : [];
        const iconStyle = String(props.iconStyle ?? 'brand');
        const shape = String(props.shape ?? 'circle');
        const size = String(props.size ?? 'md');
        const align = String(props.align ?? 'center');
        const customColor = String(props.customColor ?? '#2563eb');
        const customBg = String(props.customBg ?? '#eff6ff');
        const openInNewTab = props.openInNewTab !== false;
        const gap = String(props.gap ?? '12px');

        const sizePx = size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px';
        const svgSize = size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px';
        const borderRadius = shape === 'circle' ? '9999px' : shape === 'square' ? '0px' : '10px';
        const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

        const html = `
<div class="hw-social-icons" style="display: flex; align-items: center; justify-content: ${justify}; gap: ${escapeHtml(gap)}; flex-wrap: wrap; width: 100%;">
    ${items
        .map((item: any) => {
            const platform = String(item.platform ?? 'website').toLowerCase();
            const url = String(item.url ?? '#');
            const label = String(item.label ?? platform);
            const path = SOCIAL_SVG_PATHS[platform] ?? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z';
            const brandColor = SOCIAL_BRAND_COLORS[platform] ?? '#2563eb';

            let bg = customBg;
            let color = customColor;
            let border = 'none';

            if (iconStyle === 'brand') {
                bg = brandColor;
                color = '#ffffff';
            } else if (iconStyle === 'outline') {
                bg = 'transparent';
                color = brandColor;
                border = `1.5px solid ${brandColor}`;
            }

            return `
        <a href="${escapeHtml(url)}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" style="display: inline-flex; align-items: center; justify-content: center; width: ${sizePx}; height: ${sizePx}; border-radius: ${borderRadius}; background: ${escapeHtml(bg)}; color: ${escapeHtml(color)}; border: ${border}; text-decoration: none; transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
            <svg style="width: ${svgSize}; height: ${svgSize}; fill: currentColor;" viewBox="0 0 24 24">${path}</svg>
        </a>`;
        })
        .join('')}
</div>
`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const alertRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const variant = String(props.variant ?? 'info');
        const title = String(props.title ?? '');
        const message = String(props.message ?? '');
        const showIcon = props.showIcon !== false;
        const actionText = String(props.actionText ?? '').trim();
        const actionHref = String(props.actionHref ?? '#');
        const dismissible = Boolean(props.dismissible);
        const isMobile = context.breakpoint === 'mobile';

        const VARIANTS: Record<string, { bg: string; border: string; text: string; iconColor: string; svg: string }> = {
            info: {
                bg: '#eff6ff',
                border: '#bfdbfe',
                text: '#1e3a8a',
                iconColor: '#2563eb',
                svg: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
            },
            success: {
                bg: '#f0fdf4',
                border: '#bbf7d0',
                text: '#14532d',
                iconColor: '#16a34a',
                svg: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
            },
            warning: {
                bg: '#fffbeb',
                border: '#fde68a',
                text: '#78350f',
                iconColor: '#d97706',
                svg: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
            },
            destructive: {
                bg: '#fef2f2',
                border: '#fecaca',
                text: '#7f1d1d',
                iconColor: '#dc2626',
                svg: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
            },
            neutral: {
                bg: '#f8fafc',
                border: '#e2e8f0',
                text: '#0f172a',
                iconColor: '#64748b',
                svg: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
            },
        };

        const v = VARIANTS[variant] ?? VARIANTS.info;
        const className = `hw-alert-${node.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        const html = `
<div class="${className} hw-alert" role="alert" style="display: flex; align-items: flex-start; gap: 12px; padding: ${isMobile ? '12px 14px' : '16px 20px'}; border-radius: 12px; background: ${v.bg}; border: 1px solid ${v.border}; color: ${v.text}; width: 100%;">
    ${showIcon ? `<span style="flex-shrink: 0; color: ${v.iconColor}; margin-top: 2px;"><svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v.svg}</svg></span>` : ''}
    <div style="flex: 1 1 0; min-width: 0;">
        ${title ? `<div style="font-size: 0.875rem; font-weight: 700; line-height: 1.3; margin-bottom: ${message ? '4px' : '0'};">${escapeHtml(title)}</div>` : ''}
        ${message ? `<div style="font-size: 0.8125rem; line-height: 1.55; opacity: 0.9;">${escapeHtml(message)}</div>` : ''}
        ${actionText ? `<div style="margin-top: 8px;"><a href="${escapeHtml(actionHref)}" style="display: inline-flex; font-size: 0.8125rem; font-weight: 700; color: ${v.iconColor}; text-decoration: underline;">${escapeHtml(actionText)}</a></div>` : ''}
    </div>
    ${dismissible ? `<button type="button" onclick="this.closest('.${className}').style.display='none'" aria-label="Close" style="background: transparent; border: 0; padding: 4px; cursor: pointer; color: inherit; opacity: 0.6; line-height: 1; font-size: 16px;">✕</button>` : ''}
</div>
`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
    },
};

export const progressBarRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        const label = String(props.label ?? 'Progress');
        const pct = Math.min(100, Math.max(0, Number(props.percentage ?? 80)));
        const showPct = props.showPercentage !== false;
        const barHeight = String(props.barHeight ?? '12px');
        const barColor = String(props.barColor ?? '#2563eb');
        const trackColor = String(props.trackColor ?? '#e2e8f0');
        const striped = Boolean(props.striped);
        const animated = Boolean(props.animated);
        const radius = String(props.borderRadius ?? '9999px');
        const className = `hw-prog-${node.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

        const stripedBg = striped
            ? `background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); background-size: 1rem 1rem;`
            : '';

        const animClass = animated ? `${className}-animated` : '';

        const html = `
<div class="${className} hw-progress-container" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.8125rem; font-weight: 600; color: inherit;">
        <span style="overflow-wrap: anywhere;">${escapeHtml(label)}</span>
        ${showPct ? `<span style="font-weight: 700; color: ${escapeHtml(barColor)};">${pct}%</span>` : ''}
    </div>
    <div style="width: 100%; height: ${escapeHtml(barHeight)}; background: ${escapeHtml(trackColor)}; border-radius: ${escapeHtml(radius)}; overflow: hidden;">
        <div class="hw-progress-bar ${animClass}" style="width: ${pct}%; height: 100%; background-color: ${escapeHtml(barColor)}; ${stripedBg} border-radius: ${escapeHtml(radius)}; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
    </div>
</div>
${animated ? `<style>@keyframes ${className}-stripes { from { background-position: 1rem 0; } to { background-position: 0 0; } } .${className}-animated { animation: ${className}-stripes 1s linear infinite; }</style>` : ''}
`;

        return { tag: 'div', attributes: nodeAttributes(node), styles: applyBackgroundStyles(styles), html, children: [] };
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
        .register('layout.navbar', navbarRenderer)
        .register('content.text', textRenderer())
        .register('content.richtext', textRenderer())
        .register('content.button', buttonRenderer)
        .register('content.link', linkRenderer)
        .register('content.list', listRenderer)
        .register('content.accordion', accordionRenderer)
        .register('content.tabs', tabsRenderer)
        .register('content.socialicons', socialIconsRenderer)
        .register('content.alert', alertRenderer)
        .register('media.image', imageRenderer)
        .register('media.gallery', galleryRenderer)
        .register('media.carousel', carouselRenderer)
        .register('embed.video', videoEmbedRenderer)
        .register('code.customcode', customCodeRenderer)
        .register('marketing.card', blockRenderer('article'))
        .register('marketing.blurb', blurbRenderer)
        .register('marketing.pricing', pricingRenderer)
        .register('marketing.logomarquee', logoMarqueeRenderer)
        .register('marketing.stats', statsRenderer)
        .register('marketing.testimonial', testimonialRenderer)
        .register('marketing.countdown', countdownRenderer)
        .register('marketing.progressbar', progressBarRenderer)
        .register('form.contact', contactFormRenderer)
        .register('marketing.imagefeature', imageFeatureRenderer)
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
