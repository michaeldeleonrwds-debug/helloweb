import { Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useReducer } from 'react';

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
    onInlineTextChange?: (nodeId: string, text: string) => void;
    editingNodeId?: string | null;
    onStartInlineEdit?: (nodeId: string) => void;
    onEndInlineEdit?: () => void;
    onOpenElementPicker?: (parentId: string) => void;
    onDuplicateNode?: (nodeId: string) => void;
    onRemoveNode?: (nodeId: string) => void;
    onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void;
    canMoveNode?: (nodeId: string, direction: 'up' | 'down') => boolean;
    onCopyNode?: (nodeId: string) => void;
    onPasteNode?: (nodeId: string) => void;
    canPasteNode?: (nodeId: string) => boolean;
    onToggleVisibility?: (nodeId: string) => void;
    isNodeHidden?: (nodeId: string) => boolean;
    onToggleLock?: (nodeId: string) => void;
    isNodeLocked?: (nodeId: string) => boolean;
    onSetFlexDirection?: (nodeId: string, direction: 'row' | 'column' | 'row-reverse' | 'column-reverse') => void;
    onSetFlexStyle?: (nodeId: string, key: 'justifyContent' | 'alignItems' | 'flexWrap', value: string) => void;
    onToggleFullWidth?: (nodeId: string) => void;
    isNodeFullWidth?: (nodeId: string) => boolean;
    onAddColumn?: (nodeId: string) => void;
    onAddElement?: (nodeId: string) => void;
    onOpenMediaManager?: (target?: 'image' | 'background', nodeId?: string) => void;
    onEditNode?: (nodeId: string) => void;
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
    onInlineTextChange,
    editingNodeId,
    onStartInlineEdit,
    onEndInlineEdit,
    onOpenElementPicker,
    onDuplicateNode,
    onRemoveNode,
    onMoveNode,
    canMoveNode,
    onCopyNode,
    onPasteNode,
    canPasteNode,
    onToggleVisibility,
    isNodeHidden,
    onToggleLock,
    isNodeLocked,
    onSetFlexDirection,
    onSetFlexStyle,
    onToggleFullWidth,
    isNodeFullWidth,
    onAddColumn,
    onAddElement,
    onOpenMediaManager,
    onEditNode,
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

    const pageIsEmpty = state.document.root.children.length === 0;
    const fixedPreviewWidth = breakpoint === 'tablet' ? 768 : breakpoint === 'mobile' ? 375 : null;

    return (
        <div className="builder-canvas min-h-0 min-w-0 flex-1 overflow-auto bg-[#f0f4f9] dark:bg-[#131314]" data-builder-canvas="true">
            <div className={`flex min-h-full min-w-full items-start justify-center px-8 pt-8 pb-20`}>
                <div
                    className={`${fixedPreviewWidth ? 'shrink-0' : 'w-full min-w-0'} transition-[width] duration-200`}
                    style={fixedPreviewWidth ? { width: `${fixedPreviewWidth}px` } : undefined}
                    data-builder-page-shell="true"
                >
                    <div
                        className={`relative w-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 ${fixedPreviewWidth ? 'overflow-hidden rounded-xl' : ''} ${pageIsEmpty ? 'min-h-[min(720px,calc(100vh-170px))]' : ''}`}
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
                            onMoveNode={onMoveNode}
                            canMoveNode={canMoveNode}
                            onCopyNode={onCopyNode}
                            onPasteNode={onPasteNode}
                            canPasteNode={canPasteNode}
                            onToggleVisibility={onToggleVisibility}
                            isNodeHidden={isNodeHidden}
                            onToggleLock={onToggleLock}
                            isNodeLocked={isNodeLocked}
                            onSetFlexDirection={onSetFlexDirection}
                            onSetFlexStyle={onSetFlexStyle}
                            onToggleFullWidth={onToggleFullWidth}
                            isNodeFullWidth={isNodeFullWidth}
                            onAddColumn={onAddColumn}
                            onAddElement={onAddElement}
                            onOpenMediaManager={onOpenMediaManager}
                            onEditNode={onEditNode}
                        />
                        {pageIsEmpty ? (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="pointer-events-auto flex max-w-sm flex-col items-center p-6 text-center">
                                    <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-full">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <p className="text-base font-semibold tracking-tight text-slate-900">Start building your page</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Drag elements from the left panel or click below to insert your first section.
                                    </p>
                                    <button
                                        type="button"
                                        className="bg-primary text-primary-foreground mt-4 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-xs transition hover:brightness-105"
                                        onClick={() => onAddElement?.(state.document.root.id)}
                                    >
                                        <Plus className="size-4" />
                                        Add Section
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
