import { Plus, Sparkles } from 'lucide-react';
import { createElement, useEffect, useMemo, useReducer, useRef } from 'react';

import type { BuilderBreakpoint, BuilderPageDocument } from '../document';
import { createBuiltInComponentRegistry } from '../registry/built-ins';
import type { ComponentRegistry } from '../registry/component-registry';
import { BuilderRenderer } from '../renderer/builder-renderer';
import { registerBuiltInRenderers } from '../renderer/built-ins';
import type { RenderContext } from '../renderer/render-context';
import type { RenderResult } from '../renderer/render-result';
import { ComponentRendererRegistry } from '../renderer/renderer-registry';
import { resolveReusableReferences, type ReusableComponentDefinition } from '../reusable';
import CanvasNode from './CanvasNode';
import type { BuilderEditorAction } from './editor-reducer';
import { editorReducer } from './editor-reducer';
import { createEditorState, getHoveredNode, getSelectedNode, type BuilderEditorState } from './editor-state';
import { renderStyleToReactStyle } from './render-result-utils';

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
    dropTargetMode?: 'append' | 'before' | 'after' | null;
    zoom?: number;
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
    onOpenMediaManager?: (target?: string, nodeId?: string, payload?: any) => void;
    onEditNode?: (nodeId: string) => void;
    headerDocument?: BuilderPageDocument | null;
    footerDocument?: BuilderPageDocument | null;
    headerName?: string | null;
    footerName?: string | null;
    headerId?: number | null;
    footerId?: number | null;
    onOpenHeaderPicker?: () => void;
    onOpenFooterPicker?: () => void;
    isTemplate?: boolean;
    onContextMenu?: (event: React.MouseEvent) => void;
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
    dropTargetMode,
    zoom,
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
    headerDocument,
    footerDocument,
    headerName,
    footerName,
    headerId,
    footerId,
    onOpenHeaderPicker,
    onOpenFooterPicker,
    isTemplate = false,
    onContextMenu,
}: BuilderCanvasViewProps) {
    const renderedDocument = useMemo(() => {
        const context: RenderContext = {
            breakpoint,
            componentRegistry: componentRegistry ?? createBuiltInComponentRegistry(),
            rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
        };

        return new BuilderRenderer(context).renderDocument(resolveReusableReferences(state.document, reusableDefinitions));
    }, [breakpoint, componentRegistry, reusableDefinitions, state.document]);

    const renderedHeader = useMemo(() => {
        if (!headerDocument) return null;
        const context: RenderContext = {
            breakpoint,
            componentRegistry: componentRegistry ?? createBuiltInComponentRegistry(),
            rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
        };

        return new BuilderRenderer(context).renderDocument(resolveReusableReferences(headerDocument, reusableDefinitions));
    }, [breakpoint, componentRegistry, headerDocument, reusableDefinitions]);

    const renderedFooter = useMemo(() => {
        if (!footerDocument) return null;
        const context: RenderContext = {
            breakpoint,
            componentRegistry: componentRegistry ?? createBuiltInComponentRegistry(),
            rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
        };

        return new BuilderRenderer(context).renderDocument(resolveReusableReferences(footerDocument, reusableDefinitions));
    }, [breakpoint, componentRegistry, footerDocument, reusableDefinitions]);

    const selectedNode = getSelectedNode(state);
    const hoveredNode = getHoveredNode(state);

    const pageIsEmpty = state.document.root.children.length === 0;
    const fixedPreviewWidth = breakpoint === 'tablet' ? 768 : breakpoint === 'mobile' ? 375 : null;
    const zoomScale = (zoom ?? (breakpoint === 'desktop' ? 80 : 100)) / 100;
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const handleNativeClick = (e: globalThis.MouseEvent) => {
            const target = e.target as HTMLElement | null;
            const anchor = target?.closest('a');
            if (anchor && !anchor.classList.contains('builder-chrome-link')) {
                // Prevent browser navigation from links inside the visual builder canvas
                e.preventDefault();
            }
        };

        container.addEventListener('click', handleNativeClick, { capture: true });
        return () => container.removeEventListener('click', handleNativeClick, { capture: true });
    }, []);

    return (
        <div
            ref={canvasContainerRef}
            className="builder-canvas min-h-0 min-w-0 flex-1 overflow-auto bg-[#eaecf0] dark:bg-[#12151b]"
            data-builder-canvas="true"
            onContextMenu={onContextMenu}
            onClickCapture={(e) => {
                const target = e.target as HTMLElement | null;
                const anchor = target?.closest('a');
                if (anchor && !anchor.classList.contains('builder-chrome-link')) {
                    e.preventDefault();
                }
            }}
        >
            <div className={`flex min-h-full min-w-full ${fixedPreviewWidth ? 'items-start justify-center px-4 py-8 pb-20' : 'items-start justify-stretch p-0 pb-24'}`}>
                <div
                    className={`${fixedPreviewWidth ? 'shrink-0' : 'w-full min-w-0'} transition-[width] duration-200`}
                    style={
                        fixedPreviewWidth
                            ? { width: `${fixedPreviewWidth}px`, zoom: zoomScale }
                            : {
                                  width: zoomScale < 1 ? `${Math.round(100 / zoomScale)}%` : '100%',
                                  minWidth: '1200px',
                                  zoom: zoomScale,
                              }
                    }
                    data-builder-page-shell="true"
                >
                    <div
                        className={`relative w-full bg-white text-slate-950 shadow-sm flex flex-col justify-between ${fixedPreviewWidth ? 'overflow-hidden rounded-xl shadow-md ring-1 ring-slate-900/5 dark:ring-white/10' : 'min-h-fit'} ${pageIsEmpty ? 'min-h-[min(720px,calc(100vh-170px))]' : ''}`}
                        data-builder-page="true"
                    >
                        {/* Global Header Preview */}
                        {!isTemplate && renderedHeader ? (
                            <header className="group relative w-full shrink-0 border-b border-border/40" data-builder-global-header="true">
                                <div className="absolute top-2 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-card/95 backdrop-blur-xs border border-border shadow-md rounded-lg px-2.5 py-1 text-xs">
                                    <span className="font-semibold text-foreground">{headerName || 'Global Header'}</span>
                                    {onOpenHeaderPicker && (
                                        <button
                                            type="button"
                                            onClick={onOpenHeaderPicker}
                                            className="text-primary hover:underline font-semibold ml-1 cursor-pointer"
                                        >
                                            Change Design
                                        </button>
                                    )}
                                    {headerId ? (
                                        <a
                                            href={route('builder.templates.show', headerId)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="builder-chrome-link text-muted-foreground hover:text-foreground ml-1"
                                        >
                                            Customize ↗
                                        </a>
                                    ) : null}
                                </div>
                                <ReadOnlyCanvasNode result={renderedHeader} />
                            </header>
                        ) : null}

                        {/* Page Content Body */}
                        <div className="flex-1 w-full relative">
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
                                dropTargetMode={dropTargetMode}
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

                        {/* Global Footer Preview */}
                        {!isTemplate && renderedFooter ? (
                            <footer className="group relative w-full shrink-0 border-t border-border/40" data-builder-global-footer="true">
                                <div className="absolute bottom-2 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-card/95 backdrop-blur-xs border border-border shadow-md rounded-lg px-2.5 py-1 text-xs">
                                    <span className="font-semibold text-foreground">{footerName || 'Global Footer'}</span>
                                    {onOpenFooterPicker && (
                                        <button
                                            type="button"
                                            onClick={onOpenFooterPicker}
                                            className="text-primary hover:underline font-semibold ml-1 cursor-pointer"
                                        >
                                            Change Design
                                        </button>
                                    )}
                                    {footerId ? (
                                        <a
                                            href={route('builder.templates.show', footerId)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="builder-chrome-link text-muted-foreground hover:text-foreground ml-1"
                                        >
                                            Customize ↗
                                        </a>
                                    ) : null}
                                </div>
                                <ReadOnlyCanvasNode result={renderedFooter} />
                            </footer>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function ReadOnlyCanvasNode({ result }: { result: RenderResult }) {
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement | null;
        const navToggle = target?.closest<HTMLElement>('[data-hw-nav-toggle]');
        if (navToggle) {
            const header = navToggle.closest('header, nav, [data-builder-type="layout.navbar"]');
            const menu = header?.querySelector<HTMLElement>('[data-hw-nav-menu]');
            if (menu) {
                menu.classList.toggle('is-open');
                const isOpen = menu.classList.contains('is-open');
                menu.style.display = isOpen ? 'flex' : 'none';
            }
            return;
        }
        if (target?.closest('a')) {
            event.preventDefault();
        }
    };

    if (result.tag === null) {
        return <>{result.children.map((child, index) => <ReadOnlyCanvasNode key={index} result={child} />)}</>;
    }

    const children = result.children.map((child, index) => <ReadOnlyCanvasNode key={index} result={child} />);
    const rawAttrs = { ...result.attributes };
    if (rawAttrs.class) {
        rawAttrs.className = rawAttrs.class;
        delete rawAttrs.class;
    }
    const style = renderStyleToReactStyle(result.styles as Record<string, any>);
    const htmlChild = result.html ? (
        result.tag === 'p' ? (
            <span key="html" dangerouslySetInnerHTML={{ __html: result.html }} />
        ) : (
            <div key="html" className="w-full contents" dangerouslySetInnerHTML={{ __html: result.html }} />
        )
    ) : null;

    const props = {
        ...rawAttrs,
        style,
        onClick: handleClick,
    };

    if (voidElements.has(result.tag)) {
        return createElement(result.tag, props);
    }

    return createElement(result.tag, props, htmlChild ?? result.text, ...children);
}
