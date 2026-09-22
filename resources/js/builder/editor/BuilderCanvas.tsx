import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { BuilderBreakpoint, BuilderPageDocument } from '../document';
import { createBuiltInComponentRegistry } from '../registry/built-ins';
import type { ComponentRegistry } from '../registry/component-registry';
import { BuilderRenderer } from '../renderer/builder-renderer';
import { registerBuiltInRenderers } from '../renderer/built-ins';
import type { RenderContext } from '../renderer/render-context';
import { ComponentRendererRegistry } from '../renderer/renderer-registry';
import { resolveReusableReferences, type ReusableComponentDefinition } from '../reusable';
import CanvasNode from './CanvasNode';
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
    onOpenElementPicker?: (parentId: string) => void;
    onDuplicateNode?: (nodeId: string) => void;
    onRemoveNode?: (nodeId: string) => void;
    onWorkspaceWidthChange?: (width: number) => void;
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
    onOpenElementPicker,
    onDuplicateNode,
    onRemoveNode,
    onWorkspaceWidthChange,
}: BuilderCanvasViewProps) {
    const workspaceRef = useRef<HTMLDivElement>(null);
    const [workspaceWidth, setWorkspaceWidth] = useState(0);

    useEffect(() => {
        const workspace = workspaceRef.current;
        if (!workspace) return;

        const updateWidth = () => {
            const width = workspace.clientWidth;
            setWorkspaceWidth(width);
            onWorkspaceWidthChange?.(width);
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(workspace);
        return () => observer.disconnect();
    }, [onWorkspaceWidthChange]);
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

    const scale = zoom / 100;
    const visualPageWidth = resolvedViewportWidth * scale;
    const fitsWorkspace = workspaceWidth === 0 || visualPageWidth <= workspaceWidth;

    return (
        <div ref={workspaceRef} className="builder-canvas bg-muted/60 min-h-0 min-w-0 flex-1 overflow-auto" data-builder-canvas="true">
            <div
                className={`min-w-full items-start p-3 ${pageIsEmpty ? 'flex min-h-full' : 'flex'} ${fitsWorkspace ? 'justify-center' : 'justify-start'}`}
            >
                <div className="shrink-0 transition-[width] duration-200" style={{ width: visualPageWidth }} data-builder-page-shell="true">
                    <div
                        className="origin-top-left transition-transform duration-200"
                        style={{ width: resolvedViewportWidth, transform: `scale(${scale})` }}
                    >
                        <div
                            className={`bg-background w-full ring-0 ${pageIsEmpty ? 'min-h-[min(720px,calc(100vh-170px))]' : ''}`}
                            data-builder-page="true"
                        >
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
                                onOpenElementPicker={onOpenElementPicker}
                                onDuplicateNode={onDuplicateNode}
                                onRemoveNode={onRemoveNode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
