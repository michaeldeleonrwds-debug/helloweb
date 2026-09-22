import type { ComponentDefinition } from '../component/definition';
import type { BuilderBreakpoint, BuilderComponentNode, JsonValue } from '../document';

export function resolveStyles(node: BuilderComponentNode, definition: ComponentDefinition, breakpoint: BuilderBreakpoint): Record<string, JsonValue> {
    const styles: Record<string, JsonValue> = {};

    [definition.defaultStyles, node.styles].forEach((source) => {
        if (!source) {
            return;
        }

        Object.assign(styles, source.desktop ?? {});

        if (breakpoint === 'tablet' || breakpoint === 'mobile') {
            Object.assign(styles, source.tablet ?? {});
        }

        if (breakpoint === 'mobile') {
            Object.assign(styles, source.mobile ?? {});
        }
    });

    return Object.fromEntries(Object.entries(styles).sort(([left], [right]) => left.localeCompare(right)));
}
