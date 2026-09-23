import type { JsonValue } from '../document';
import { serializeStyles as serializeResolvedStyles } from '../style/style';

export interface RenderResult {
    tag: string | null;
    attributes: Record<string, string>;
    styles: Record<string, JsonValue>;
    text?: string;
    children: RenderResult[];
}

const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function fragment(children: RenderResult[]): RenderResult {
    return {
        tag: null,
        attributes: {},
        styles: {},
        children,
    };
}

export function renderResultToHtml(result: RenderResult): string {
    const text = escapeHtml(result.text ?? '');
    const children = result.children.map(renderResultToHtml).join('');

    if (result.tag === null) {
        return `${text}${children}`;
    }

    if (voidElements.has(result.tag)) {
        return `<${result.tag}${serializeAttributes(result)}>`;
    }

    return `<${result.tag}${serializeAttributes(result)}>${text}${children}</${result.tag}>`;
}

function serializeAttributes(result: RenderResult): string {
    const attributes = { ...result.attributes };
    const style = serializeStyles(result.styles);

    if (style !== '') {
        attributes.style = style;
    }

    const serialized = Object.entries(attributes)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, value]) => `${escapeHtml(name)}="${escapeHtml(value)}"`);

    return serialized.length === 0 ? '' : ` ${serialized.join(' ')}`;
}

function serializeStyles(styles: Record<string, JsonValue>): string {
    return serializeResolvedStyles(styles as unknown as Record<string, string | number>);
}

function escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
