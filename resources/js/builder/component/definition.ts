import type { BuilderRecord, BuilderResponsiveStyles, ComponentType, JsonValue } from '../document';
import type { StylePropertyKey } from '../style/style';

export type ComponentCapability = 'canHaveChildren' | 'canAcceptChildren' | 'supportsText' | 'supportsResponsiveStyles' | (string & {});

export type ComponentCapabilities = Partial<Record<ComponentCapability, boolean>>;

export interface ComponentChildRules {
    allowedTypes?: ComponentType[];
}

export interface ComponentPropDefinition extends BuilderRecord {
    type: JsonValue;
}

export type ComponentPropSchema = Record<string, ComponentPropDefinition>;

export type ComponentIntegrationPoints = BuilderRecord;

export interface ComponentDefinition {
    type: ComponentType;
    name: string;
    category: string;
    description?: string;
    capabilities?: ComponentCapabilities;
    defaultProps?: BuilderRecord;
    defaultStyles?: BuilderResponsiveStyles;
    styleCapabilities?: StylePropertyKey[];
    propSchema?: ComponentPropSchema;
    childRules?: ComponentChildRules;
    integration?: ComponentIntegrationPoints;
}

export function supportsCapability(definition: ComponentDefinition, capability: ComponentCapability): boolean {
    return definition.capabilities?.[capability] ?? false;
}
