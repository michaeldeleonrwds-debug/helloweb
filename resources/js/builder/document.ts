export const BUILDER_DOCUMENT_SCHEMA_VERSION = 1 as const;

export const BUILDER_BREAKPOINTS = ['desktop', 'tablet', 'mobile'] as const;

export type BuilderDocumentSchemaVersion = typeof BUILDER_DOCUMENT_SCHEMA_VERSION;

export type BuilderBreakpoint = (typeof BUILDER_BREAKPOINTS)[number];

export type ComponentType = `${string}.${string}`;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type BuilderRecord = Record<string, JsonValue>;

export interface ReusableComponentReference {
    type: 'reusable-component';
    id: number;
}

export type BuilderStyleProperties = import('./style/style').BuilderStyleProperties;

export type BuilderResponsiveStyles = Partial<Record<BuilderBreakpoint, BuilderStyleProperties>>;

export interface BuilderComponentNode {
    id: string;
    type: ComponentType;
    props: BuilderRecord;
    styles: BuilderResponsiveStyles;
    children: BuilderComponentNode[];
    reusableReference?: ReusableComponentReference;
    metadata?: BuilderRecord;
}

export interface BuilderPageDocument {
    schemaVersion: BuilderDocumentSchemaVersion;
    root: BuilderComponentNode;
    metadata?: BuilderRecord;
}
