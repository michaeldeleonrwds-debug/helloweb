import type { ComponentDefinition } from '../component/definition';
import type { ComponentType } from '../document';

export class ComponentRegistry {
    private readonly definitions = new Map<ComponentType, ComponentDefinition>();

    constructor(definitions: ComponentDefinition[] = []) {
        definitions.forEach((definition) => this.register(definition));
    }

    register(definition: ComponentDefinition): this {
        assertValidDefinition(definition);

        if (this.has(definition.type)) {
            throw new Error(`Component type [${definition.type}] is already registered.`);
        }

        this.definitions.set(definition.type, deepFreeze(cloneDefinition(definition)));

        return this;
    }

    has(type: ComponentType): boolean {
        return this.definitions.has(type);
    }

    get(type: ComponentType): ComponentDefinition {
        const definition = this.definitions.get(type);

        if (!definition) {
            throw new Error(`Component type [${type}] is not registered.`);
        }

        return definition;
    }

    all(): ComponentDefinition[] {
        return Array.from(this.definitions.values());
    }
}

function assertValidDefinition(definition: ComponentDefinition): void {
    if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(definition.type)) {
        throw new Error('Component type must be a namespaced type string.');
    }

    if (definition.name.trim() === '') {
        throw new Error('Component name must be a non-empty string.');
    }

    if (definition.category.trim() === '') {
        throw new Error('Component category must be a non-empty string.');
    }
}

function cloneDefinition(definition: ComponentDefinition): ComponentDefinition {
    return {
        ...definition,
        capabilities: definition.capabilities ? { ...definition.capabilities } : undefined,
        defaultProps: definition.defaultProps ? structuredClone(definition.defaultProps) : undefined,
        defaultStyles: definition.defaultStyles ? structuredClone(definition.defaultStyles) : undefined,
        propSchema: definition.propSchema ? structuredClone(definition.propSchema) : undefined,
        childRules: definition.childRules ? structuredClone(definition.childRules) : undefined,
        integration: definition.integration ? structuredClone(definition.integration) : undefined,
    };
}

function deepFreeze<T>(value: T): T {
    if (!value || typeof value !== 'object') {
        return value;
    }

    Object.freeze(value);

    Object.values(value).forEach((nestedValue) => {
        if (nestedValue && typeof nestedValue === 'object' && !Object.isFrozen(nestedValue)) {
            deepFreeze(nestedValue);
        }
    });

    return value;
}
