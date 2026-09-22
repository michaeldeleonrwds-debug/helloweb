import type { JsonValue } from '../document';
import type { RenderResult } from '../renderer/render-result';

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
        }
    });

    return reactStyle;
}
