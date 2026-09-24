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

    Object.entries(styles).forEach(([name, value]) => {
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
