import type { ComponentType } from '../document';
import type { ComponentRenderer } from './component-renderer';

export class RendererError extends Error {
    static unknownComponentType(type: string): RendererError {
        return new RendererError(`Component type [${type}] is not registered.`);
    }

    static unknownRenderer(type: string): RendererError {
        return new RendererError(`Renderer for component type [${type}] is not registered.`);
    }

    static duplicateRenderer(type: string): RendererError {
        return new RendererError(`Renderer for component type [${type}] is already registered.`);
    }

    static invalidNode(message: string): RendererError {
        return new RendererError(message);
    }
}

export class ComponentRendererRegistry {
    private readonly renderers = new Map<ComponentType, ComponentRenderer>();

    constructor(renderers: Partial<Record<ComponentType, ComponentRenderer>> = {}) {
        Object.entries(renderers).forEach(([type, renderer]) => {
            if (renderer) {
                this.register(type as ComponentType, renderer);
            }
        });
    }

    register(type: ComponentType, renderer: ComponentRenderer): this {
        if (this.has(type)) {
            throw RendererError.duplicateRenderer(type);
        }

        this.renderers.set(type, renderer);

        return this;
    }

    has(type: ComponentType): boolean {
        return this.renderers.has(type);
    }

    get(type: ComponentType): ComponentRenderer {
        const renderer = this.renderers.get(type);

        if (!renderer) {
            throw RendererError.unknownRenderer(type);
        }

        return renderer;
    }

    all(): ComponentRenderer[] {
        return Array.from(this.renderers.values());
    }
}
