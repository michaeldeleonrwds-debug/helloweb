import type { BuilderBreakpoint } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';
import type { ComponentRendererRegistry } from './renderer-registry';

export interface RenderContext {
    breakpoint: BuilderBreakpoint;
    componentRegistry: ComponentRegistry;
    rendererRegistry: ComponentRendererRegistry;
    options?: Record<string, unknown>;
}
