import type { ComponentDefinition } from '../component/definition';
import type { BuilderComponentNode } from '../document';
import type { RenderContext } from './render-context';
import type { RenderResult } from './render-result';

export interface ComponentRenderer {
    render(node: BuilderComponentNode, definition: ComponentDefinition, context: RenderContext, children: RenderResult[]): RenderResult;
}
