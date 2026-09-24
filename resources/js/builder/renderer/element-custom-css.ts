export const ELEMENT_CUSTOM_CSS_SCOPE_ATTRIBUTE = 'data-builder-css-scope';

export function readElementCustomCss(node: { metadata?: Record<string, unknown> } | null | undefined): string | null {
    const css = node?.metadata?.customCss;
    if (typeof css !== 'string' || css.trim() === '') {
        return null;
    }

    return css;
}

export function elementCustomCssSelector(nodeId: string): string {
    const escaped = nodeId.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
    return `[${ELEMENT_CUSTOM_CSS_SCOPE_ATTRIBUTE}="${escaped}"]`;
}

export function wrapElementCustomCss(nodeId: string, css: string): string {
    return `${elementCustomCssSelector(nodeId)} {\n${css}\n}`;
}
