import type { JsonValue } from '../document';
import type { RenderResult } from '../renderer/render-result';

export { hasVisibleCodeContent } from '../code-content';

export function getRenderResultNodeId(result: RenderResult): string | null {
    return result.attributes['data-builder-id'] ?? result.attributes['data-builder-node-id'] ?? null;
}

export function getRenderResultType(result: RenderResult): string | null {
    return result.attributes['data-builder-type'] ?? null;
}

export function renderStyleToReactStyle(styles: Record<string, JsonValue>): React.CSSProperties {
    const reactStyle: React.CSSProperties = {};

    const entries = Object.entries(styles);
    const individualCornerKeys = new Set(['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']);
    const individualBorderKeys = new Set(['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']);

    const hasCornerOverride = entries.some(([k]) => individualCornerKeys.has(k));
    const hasBorderOverride = entries.some(([k]) => individualBorderKeys.has(k));

    entries.forEach(([name, value]) => {
        if (name === 'borderRadius' && hasCornerOverride) return;
        if (name === 'borderWidth' && hasBorderOverride) return;

        if (typeof value === 'string' || typeof value === 'number') {
            Object.assign(reactStyle, { [name]: value });
        } else if (isStructuredLength(value)) {
            Object.assign(reactStyle, { [name]: `${value.value}${value.unit}` });
        }
    });

    return reactStyle;
}

function isStructuredLength(value: JsonValue): value is { value: number; unit: string } {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && typeof value.value === 'number' && typeof value.unit === 'string';
}
