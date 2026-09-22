import { useEffect, useMemo, useReducer } from 'react';

import type { BuilderBreakpoint, BuilderPageDocument } from '../document';
import { createBuiltInComponentRegistry } from '../registry/built-ins';
import type { ComponentRegistry } from '../registry/component-registry';
import { BuilderRenderer } from '../renderer/builder-renderer';
import { registerBuiltInRenderers } from '../renderer/built-ins';
import type { RenderContext } from '../renderer/render-context';
import { ComponentRendererRegistry } from '../renderer/renderer-registry';
import { resolveReusableReferences, type ReusableComponentDefinition } from '../reusable';
import { CanvasNode } from './CanvasNode';
import type { BuilderEditorAction } from './editor-reducer';
import { editorReducer } from './editor-reducer';
import { createEditorState, getHoveredNode, getSelectedNode, type BuilderEditorState } from './editor-state';

interface BuilderCanvasProps {
    document: BuilderPageDocument;
    breakpoint?: BuilderBreakpoint;
    onStateChange?: (state: ReturnType<typeof createEditorState>) => void;
    reusableDefinitions?: ReusableComponentDefinition[];
}

export function BuilderCanvas({ document, breakpoint = 'desktop', onStateChange, reusableDefinitions = [] }: BuilderCanvasProps) {
    const [state, dispatch] = useReducer(editorReducer, document, createEditorState);

    useEffect(() => {
        dispatch({ type: 'setDocument', document });
    }, [document]);

    useEffect(() => {
        onStateChange?.(state);
    }, [onStateChange, state]);

    return <BuilderCanvasView state={state} dispatch={dispatch} breakpoint={breakpoint} reusableDefinitions={reusableDefinitions} />;
}

interface BuilderCanvasViewProps {
    state: BuilderEditorState;
    dispatch: (action: BuilderEditorAction) => void;
    breakpoint: BuilderBreakpoint;
    componentRegistry?: ComponentRegistry;
    onStartDrag?: (nodeId: string) => void;
    onDropNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onDragOverNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    canDropOnNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => boolean;
    onEndDrag?: () => void;
    dropTargetId?: string | null;
    reusableDefinitions?: ReusableComponentDefinition[];
    zoom?: number;
    viewportWidth?: number;
    onInlineTextChange?: (nodeId: string, text: string) => void;
    editingNodeId?: string | null;
    onStartInlineEdit?: (nodeId: string) => void;
    onEndInlineEdit?: () => void;
    onInsertContextual?: (parentId: string, type: `${string}.${string}`) => void;
}

export function BuilderCanvasView({
    state,
    dispatch,
    breakpoint,
    componentRegistry,
    onStartDrag,
    onDropNode,
    onDragOverNode,
    canDropOnNode,
    onEndDrag,
    dropTargetId,
    reusableDefinitions = [],
    zoom = 100,
    viewportWidth,
    onInlineTextChange,
    editingNodeId,
    onStartInlineEdit,
    onEndInlineEdit,
    onInsertContextual,
}: BuilderCanvasViewProps) {
    const renderedDocument = useMemo(() => {
        const context: RenderContext = {
            breakpoint,
            componentRegistry: componentRegistry ?? createBuiltInComponentRegistry(),
            rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
        };

        return new BuilderRenderer(context).renderDocument(resolveReusableReferences(state.document, reusableDefinitions));
    }, [breakpoint, reusableDefinitions, state.document]);

    const selectedNode = getSelectedNode(state);
    const hoveredNode = getHoveredNode(state);

    const resolvedViewportWidth = viewportWidth ?? (breakpoint === 'desktop' ? 1200 : breakpoint === 'tablet' ? 768 : 390);

    const pageIsEmpty = state.document.root.children.length === 0;

    return (
        <div className="builder-canvas bg-muted/60 flex min-h-0 flex-1 items-start justify-center overflow-auto p-6" data-builder-canvas="true">
            <div
                className="shrink-0 transition-transform duration-200"
                style={{ width: resolvedViewportWidth, transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
                <div className="bg-background ring-border/80 min-h-full shadow-sm ring-1">
                    {pageIsEmpty && onInsertContextual ? (
                        <div className="p-8">
                            <button
                                type="button"
                                className="border-border text-muted-foreground hover:border-primary hover:text-foreground flex min-h-40 w-full items-center justify-center rounded-md border border-dashed text-sm font-medium transition"
                                onClick={() => onInsertContextual(state.document.root.id, 'layout.section')}
                            >
                                + Add Section
                            </button>
                        </div>
                    ) : null}
                    <CanvasNode
                        result={renderedDocument}
                        selectedNodeId={selectedNode?.id ?? null}
                        hoveredNodeId={hoveredNode?.id ?? null}
                        onSelectNode={(nodeId) => dispatch({ type: 'selectNode', nodeId })}
                        onHoverNode={(nodeId) => dispatch({ type: 'hoverNode', nodeId })}
                        onClearHover={(nodeId) => {
                            if (state.hoveredNodeId === nodeId) {
                                dispatch({ type: 'clearHover' });
                            }
                        }}
                        onStartDrag={onStartDrag}
                        onDropNode={onDropNode}
                        onDragOverNode={onDragOverNode}
                        canDropOnNode={canDropOnNode}
                        onEndDrag={onEndDrag}
                        dropTargetId={dropTargetId}
                        componentRegistry={componentRegistry}
                        onInlineTextChange={onInlineTextChange}
                        editingNodeId={editingNodeId}
                        onStartInlineEdit={onStartInlineEdit}
                        onEndInlineEdit={onEndInlineEdit}
                        onInsertContextual={onInsertContextual}
                    />
                </div>
            </div>
        </div>
    );
}
