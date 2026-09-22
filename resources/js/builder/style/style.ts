import type { ComponentDefinition } from '../component/definition';
import type { BuilderBreakpoint, BuilderComponentNode, BuilderResponsiveStyles, JsonValue } from '../document';
import { HELLOWEB_FONT_LIBRARY } from '../fonts/font-library';

export type LengthUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'auto';
export type LengthValue = {
    [key: string]: JsonValue;
    value: number;
    unit: Exclude<LengthUnit, 'auto'>;
};
export type StyleValue = string | number | LengthValue;
export type StylePropertyType = 'length' | 'color' | 'number' | 'enum';
export type StyleGroup = 'layout' | 'flex' | 'position' | 'background' | 'border' | 'text';

export interface StyleDefinition {
    key: StylePropertyKey;
    label: string;
    group: StyleGroup;
    type: StylePropertyType;
    default?: StyleValue;
    options?: readonly string[];
    responsive: boolean;
}

export const STYLE_PROPERTY_DEFINITIONS: readonly StyleDefinition[] = [
    {
        key: 'display',
        label: 'Display',
        group: 'layout',
        type: 'enum',
        options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
        responsive: true,
    },
    { key: 'width', label: 'Width', group: 'layout', type: 'length', responsive: true },
    { key: 'height', label: 'Height', group: 'layout', type: 'length', responsive: true },
    { key: 'minWidth', label: 'Minimum width', group: 'layout', type: 'length', responsive: true },
    { key: 'maxWidth', label: 'Maximum width', group: 'layout', type: 'length', responsive: true },
    { key: 'minHeight', label: 'Minimum height', group: 'layout', type: 'length', responsive: true },
    { key: 'maxHeight', label: 'Maximum height', group: 'layout', type: 'length', responsive: true },
    { key: 'margin', label: 'Margin', group: 'layout', type: 'length', responsive: true },
    { key: 'padding', label: 'Padding', group: 'layout', type: 'length', responsive: true },
    { key: 'paddingTop', label: 'Padding top', group: 'layout', type: 'length', responsive: true },
    { key: 'paddingRight', label: 'Padding right', group: 'layout', type: 'length', responsive: true },
    { key: 'paddingBottom', label: 'Padding bottom', group: 'layout', type: 'length', responsive: true },
    { key: 'paddingLeft', label: 'Padding left', group: 'layout', type: 'length', responsive: true },
    { key: 'gap', label: 'Gap', group: 'layout', type: 'length', responsive: true },
    { key: 'overflow', label: 'Overflow', group: 'layout', type: 'enum', options: ['visible', 'hidden', 'auto', 'scroll'], responsive: true },
    {
        key: 'gridTemplateColumns',
        label: 'Grid columns',
        group: 'layout',
        type: 'enum',
        options: ['1fr', 'repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))', 'repeat(4, minmax(0, 1fr))'],
        responsive: true,
    },
    {
        key: 'flexDirection',
        label: 'Direction',
        group: 'flex',
        type: 'enum',
        options: ['row', 'row-reverse', 'column', 'column-reverse'],
        responsive: true,
    },
    {
        key: 'justifyContent',
        label: 'Justify',
        group: 'flex',
        type: 'enum',
        options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        responsive: true,
    },
    {
        key: 'alignItems',
        label: 'Align',
        group: 'flex',
        type: 'enum',
        options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
        responsive: true,
    },
    { key: 'flexWrap', label: 'Wrap', group: 'flex', type: 'enum', options: ['nowrap', 'wrap', 'wrap-reverse'], responsive: true },
    {
        key: 'position',
        label: 'Position',
        group: 'position',
        type: 'enum',
        options: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        responsive: true,
    },
    { key: 'top', label: 'Top', group: 'position', type: 'length', responsive: true },
    { key: 'right', label: 'Right', group: 'position', type: 'length', responsive: true },
    { key: 'bottom', label: 'Bottom', group: 'position', type: 'length', responsive: true },
    { key: 'left', label: 'Left', group: 'position', type: 'length', responsive: true },
    { key: 'zIndex', label: 'Z index', group: 'position', type: 'number', responsive: true },
    { key: 'backgroundColor', label: 'Background color', group: 'background', type: 'color', responsive: true },
    { key: 'borderWidth', label: 'Border width', group: 'border', type: 'length', responsive: true },
    {
        key: 'borderStyle',
        label: 'Border style',
        group: 'border',
        type: 'enum',
        options: ['none', 'solid', 'dashed', 'dotted', 'double'],
        responsive: true,
    },
    { key: 'borderColor', label: 'Border color', group: 'border', type: 'color', responsive: true },
    { key: 'borderRadius', label: 'Border radius', group: 'border', type: 'length', responsive: true },
    { key: 'color', label: 'Color', group: 'text', type: 'color', responsive: true },
    {
        key: 'fontFamily',
        label: 'Font family',
        group: 'text',
        type: 'enum',
        options: HELLOWEB_FONT_LIBRARY.map((font) => font.family),
        responsive: true,
    },
    { key: 'fontSize', label: 'Font size', group: 'text', type: 'length', responsive: true },
    { key: 'fontWeight', label: 'Font weight', group: 'text', type: 'number', responsive: true },
    { key: 'lineHeight', label: 'Line height', group: 'text', type: 'number', responsive: true },
    { key: 'textAlign', label: 'Text align', group: 'text', type: 'enum', options: ['left', 'center', 'right', 'justify'], responsive: true },
    { key: 'letterSpacing', label: 'Letter spacing', group: 'text', type: 'length', responsive: true },
    {
        key: 'textTransform',
        label: 'Text transform',
        group: 'text',
        type: 'enum',
        options: ['none', 'uppercase', 'lowercase', 'capitalize'],
        responsive: true,
    },
    {
        key: 'textDecoration',
        label: 'Text decoration',
        group: 'text',
        type: 'enum',
        options: ['none', 'underline', 'line-through'],
        responsive: true,
    },
    {
        key: 'boxShadow',
        label: 'Shadow',
        group: 'border',
        type: 'enum',
        options: ['none', '0 1px 2px rgba(0,0,0,.08)', '0 8px 24px rgba(0,0,0,.12)'],
        responsive: true,
    },
    { key: 'opacity', label: 'Opacity', group: 'background', type: 'number', responsive: true },
    { key: 'objectFit', label: 'Object fit', group: 'layout', type: 'enum', options: ['contain', 'cover', 'fill', 'none'], responsive: true },
] as const;

export type StylePropertyKey =
    | 'display'
    | 'width'
    | 'height'
    | 'minWidth'
    | 'maxWidth'
    | 'minHeight'
    | 'maxHeight'
    | 'margin'
    | 'padding'
    | 'gap'
    | 'overflow'
    | 'flexDirection'
    | 'justifyContent'
    | 'alignItems'
    | 'flexWrap'
    | 'position'
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'zIndex'
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'gridTemplateColumns'
    | 'backgroundColor'
    | 'borderWidth'
    | 'borderStyle'
    | 'borderColor'
    | 'borderRadius'
    | 'color'
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'lineHeight'
    | 'textAlign'
    | 'letterSpacing'
    | 'textTransform'
    | 'textDecoration'
    | 'boxShadow'
    | 'opacity'
    | 'objectFit';

export type BuilderStyleProperties = Partial<Record<StylePropertyKey, StyleValue>>;
export type ResolvedStyle = BuilderStyleProperties;

const definitions = new Map(STYLE_PROPERTY_DEFINITIONS.map((definition) => [definition.key, definition]));

export function getStyleDefinition(key: string): StyleDefinition | null {
    return definitions.get(key as StylePropertyKey) ?? null;
}

export function getStyleDefinitions(definition: ComponentDefinition): StyleDefinition[] {
    const allowed = definition.styleCapabilities ?? [];
    return STYLE_PROPERTY_DEFINITIONS.filter((property) => allowed.includes(property.key));
}

export function validateStylePatch(definition: ComponentDefinition, patch: Record<string, JsonValue | undefined>): BuilderStyleProperties {
    const valid: BuilderStyleProperties = {};
    const allowed = new Set(definition.styleCapabilities ?? []);

    Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }
        const property = getStyleDefinition(key);
        if (!property || !allowed.has(key as StylePropertyKey)) {
            throw new Error(`Style property [${key}] is not supported by component [${definition.type}].`);
        }
        if (!isValidStyleValue(property, value)) {
            throw new Error(`Invalid value for style property [${key}].`);
        }
        valid[key as StylePropertyKey] = value as StyleValue;
    });

    return valid;
}

export function resolveStyles(node: BuilderComponentNode, definition: ComponentDefinition, breakpoint: BuilderBreakpoint): ResolvedStyle {
    const styles: BuilderStyleProperties = {};
    [definition.defaultStyles, node.styles].forEach((source) => {
        if (!source) return;
        Object.assign(styles, source.desktop ?? {});
        if (breakpoint !== 'desktop') Object.assign(styles, source.tablet ?? {});
        if (breakpoint === 'mobile') Object.assign(styles, source.mobile ?? {});
    });
    return Object.fromEntries(Object.entries(styles).sort(([a], [b]) => a.localeCompare(b))) as ResolvedStyle;
}

export function serializeStyles(styles: ResolvedStyle): string {
    return Object.entries(styles)
        .filter(([, value]) => typeof value === 'string' || typeof value === 'number' || isStructuredLength(value as JsonValue))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${kebabCase(key)}: ${escapeStyleValue(serializeStyleValue(value as StyleValue))}`)
        .join('; ');
}

function isValidStyleValue(definition: StyleDefinition, value: JsonValue): boolean {
    if (definition.type === 'enum') return typeof value === 'string' && definition.options?.includes(value) === true;
    if (definition.type === 'number')
        return (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && /^\d+$/.test(value));
    if (definition.type === 'length')
        return (
            typeof value === 'number' ||
            isStructuredLength(value) ||
            (typeof value === 'string' &&
                /^(auto|(?:-?\d+(?:\.\d+)?)(px|rem|em|%|vw|vh))(\s+(?:-?\d+(?:\.\d+)?)(px|rem|em|%|vw|vh)){0,3}$/.test(value))
        );
    return typeof value === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i.test(value);
}

function kebabCase(value: string): string {
    return value.replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase();
}
function escapeStyleValue(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll(';', '').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function serializeStyleValue(value: StyleValue): string {
    if (isStructuredLength(value)) {
        return `${value.value}${value.unit}`;
    }

    return String(value);
}

function isStructuredLength(value: JsonValue): value is LengthValue {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof value.value === 'number' &&
        ['px', 'rem', 'em', '%', 'vw', 'vh'].includes(String(value.unit))
    );
}

export function clearStyleOverride(styles: BuilderResponsiveStyles, breakpoint: BuilderBreakpoint, key: StylePropertyKey): BuilderResponsiveStyles {
    const next = structuredClone(styles);
    if (next[breakpoint]) {
        delete next[breakpoint][key];
        if (Object.keys(next[breakpoint]).length === 0) delete next[breakpoint];
    }
    return next;
}

export function inheritedStyleValue(
    node: BuilderComponentNode,
    definition: ComponentDefinition,
    breakpoint: BuilderBreakpoint,
    key: StylePropertyKey,
): { value: StyleValue | undefined; inherited: boolean } {
    const own = node.styles[breakpoint]?.[key] as StyleValue | undefined;
    if (own !== undefined) return { value: own, inherited: false };
    const resolved = resolveStyles(node, definition, breakpoint);
    return { value: resolved[key], inherited: breakpoint !== 'desktop' && resolved[key] !== undefined };
}
