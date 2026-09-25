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

        if (!hasIcon) {
            return {
                tag: 'a',
                attributes: { ...nodeAttributes(node), href },
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
            attributes: { ...nodeAttributes(node), href },
            styles: applyBackgroundStyles(styles),
            html,
            children,
        };
    },
};

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

export const navbarRenderer: ComponentRenderer = {
    render(node, definition, context) {
        const props = { ...(definition.defaultProps ?? {}), ...node.props };
        const styles = resolveStyles(node, definition, context.breakpoint);
        if (props.sticky) {
            styles.position = 'sticky';
            styles.top = '0';
            styles.zIndex = 50;
        }
        const brandName = String(props.brandName ?? 'HelloWeb');
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
                    };
                }
                return {
                    label: String(l ?? ''),
                    href: '#',
                };
            })
            .filter((l) => l.label);
        const showCta = props.showCta !== false;
        const ctaText = String(props.ctaText ?? 'Get Started');
        const ctaHref = String(props.ctaHref ?? '#');
        const isMobileNav = context.breakpoint === 'mobile';

        const html = `
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; max-width: 1200px; margin: 0 auto; flex-wrap: wrap;">
    <a href="${escapeHtml(brandHref)}" style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.125rem; text-decoration: none; color: inherit;">
        ${brandLogo ? `<img src="${escapeHtml(brandLogo)}" alt="${escapeHtml(brandName)}" style="height: 32px; width: auto; object-fit: contain;" />` : ''}
        <span>${escapeHtml(brandName)}</span>
    </a>
    <nav class="hw-navbar-desktop-links" style="display: ${isMobileNav ? 'none' : 'flex'}; align-items: center; gap: 24px; font-size: 0.875rem; font-weight: 500;">
        ${links.map((l) => `<a href="${escapeHtml(l.href)}" style="text-decoration: none; color: inherit; opacity: 0.85; transition: opacity 0.15s;">${escapeHtml(l.label)}</a>`).join('')}
    </nav>
    <div style="display: flex; align-items: center; gap: 12px;">
        ${showCta ? `<a href="${escapeHtml(ctaHref)}" class="hw-navbar-cta" style="display: ${isMobileNav ? 'none' : 'inline-flex'}; align-items: center; justify-content: center; padding: 8px 18px; border-radius: 9999px; background: #0f172a; color: #ffffff; font-size: 0.75rem; font-weight: 600; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: opacity 0.15s;">${escapeHtml(ctaText)}</a>` : ''}
        <button type="button" class="hw-navbar-toggle-btn" data-hw-nav-toggle="true" aria-label="Toggle navigation" style="display: ${isMobileNav ? 'inline-flex' : 'none'}; padding: 6px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.15); background: transparent; cursor: pointer;">
            <svg style="width: 20px; height: 20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>
</div>
<div class="hw-navbar-mobile-menu" data-hw-nav-menu="true" style="display: none; flex-direction: column; gap: 12px; width: 100%; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08); margin-top: 12px;">
    ${links.map((l) => `<a href="${escapeHtml(l.href)}" style="text-decoration: none; color: inherit; font-size: 0.875rem; font-weight: 500; padding: 4px 0;">${escapeHtml(l.label)}</a>`).join('')}
    ${showCta ? `<a href="${escapeHtml(ctaHref)}" style="display: inline-flex; align-items: center; justify-content: center; padding: 8px 18px; border-radius: 9999px; background: #0f172a; color: #ffffff; font-size: 0.75rem; font-weight: 600; text-decoration: none; margin-top: 4px; text-align: center;">${escapeHtml(ctaText)}</a>` : ''}
</div>
<style>
    .hw-navbar-mobile-menu.is-open { display: flex; }
</style>
`;

        return {
            tag: 'header',
            attributes: nodeAttributes(node),
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
        .register('media.image', imageRenderer)
        .register('media.gallery', galleryRenderer)
        .register('code.customcode', customCodeRenderer)
        .register('marketing.card', blockRenderer('article'))
        .register('marketing.blurb', blurbRenderer)
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
