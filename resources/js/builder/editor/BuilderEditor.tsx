import { useEffect, useMemo, useReducer, useState } from 'react';

import type { BuilderBreakpoint, BuilderPageDocument } from '../document';
import { ComponentTreeEngine } from '../engine/component-tree-engine';
import { afterPosition, appendPosition, beforePosition } from '../engine/tree-position';
import type { MediaAsset } from '../persistence';
import { createBuiltInComponentRegistry } from '../registry/built-ins';
import type { ReusableComponentDefinition } from '../reusable';
import { BuilderBottomBar } from './BuilderBottomBar';
import { BuilderCanvasView } from './BuilderCanvas';
import { BuilderElementsPanel } from './BuilderElementsPanel';
import { BuilderLayersPanel } from './BuilderLayersPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { ComponentInspector } from './ComponentInspector';
import {
    clearEditorStyleOverride,
    duplicateEditorNode,
    insertEditorComponent,
    moveEditorNode,
    removeEditorNode,
    updateEditorProps,
    updateEditorStyles,
} from './editor-operations';
import { editorReducer } from './editor-reducer';
import { createEditorState, getSelectedNode } from './editor-state';
import { useBuilderAutosave } from './use-builder-autosave';

interface BuilderEditorProps {
    document: BuilderPageDocument;
    breakpoint?: BuilderBreakpoint;
    pageId?: number | null;
    initialVersion?: number;
    reusableDefinitions?: ReusableComponentDefinition[];
    templates?: { id: number; name: string; description?: string | null }[];
    mediaAssets?: MediaAsset[];
    websiteName?: string;
    pageName?: string;
}

export function BuilderEditor({
    document,
    breakpoint = 'desktop',
    pageId = null,
    initialVersion = 0,
    reusableDefinitions = [],
    templates = [],
    mediaAssets = [],
    websiteName = 'Website',
    pageName = 'Page',
}: BuilderEditorProps) {
    const registry = useMemo(() => createBuiltInComponentRegistry(), []);
    const engine = useMemo(() => new ComponentTreeEngine(registry), [registry]);
    const [state, dispatch] = useReducer(editorReducer, document, createEditorState);
    const [error, setError] = useState<string | null>(null);
    const [activeBreakpoint, setActiveBreakpoint] = useState<BuilderBreakpoint>(breakpoint);
    const [zoom, setZoom] = useState(85);
    const [viewportWidth, setViewportWidth] = useState(1200);
    const [elementsOpen, setElementsOpen] = useState(true);
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const save = useBuilderAutosave(state.document, pageId, initialVersion);

    useEffect(() => {
        dispatch({ type: 'setDocument', document });
    }, [document]);

    const selectedNode = getSelectedNode(state);
    const selectedDefinition = selectedNode ? registry.get(selectedNode.type) : null;
    const registeredDefinitions = registry.all().filter((definition) => !['layout.root', 'reusable.instance'].includes(definition.type));
    const insertionParentIdFor = (type: `${string}.${string}`) => findInsertionParentId(type, selectedNode?.id ?? state.document.root.id);

    const run = (operation: () => ReturnType<typeof createEditorState>) => {
        try {
            dispatch({ type: 'replaceState', state: operation() });
            setError(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The builder operation was rejected.');
        }
    };

    const dropNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId) return;
        const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
        if (!parentId) return;
        const position = mode === 'append' ? appendPosition() : mode === 'before' ? beforePosition(targetId) : afterPosition(targetId);
        try {
            const nextState = moveEditorNode(state, engine, state.draggedNodeId, { parentId, position });
            dispatch({ type: 'replaceState', state: nextState });
            dispatch({ type: 'clearDrag' });
            setError(null);
        } catch (caught) {
            dispatch({ type: 'clearDrag' });
            setError(caught instanceof Error ? caught.message : 'The drop was rejected.');
        }
    };

    const canDropOnNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId || state.draggedNodeId === targetId) return false;
        const draggedNode = engine.find(state.document, state.draggedNodeId);
        const targetNode = engine.find(state.document, targetId);
        if (!draggedNode || !targetNode || containsNode(draggedNode, targetId)) return false;
        const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
        return Boolean(parentId && engine.canAcceptChild(state.document, parentId, draggedNode.type));
    };

    const insertPersistedDefinition = async (kind: 'template' | 'reusable', definitionId: number) => {
        if (!pageId) return;
        try {
            const targetId = selectedNode?.id ?? state.document.root.id;
            const endpoint =
                kind === 'template'
                    ? route('builder.templates.instantiate', { template: definitionId, page: pageId })
                    : route('builder.reusable.insert', { component: definitionId, page: pageId });
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ parent_id: targetId, expected_version: save.version }),
            });
            const payload = (await response.json()) as { message?: string; document?: BuilderPageDocument; page?: { version: number } };
            if (!response.ok || !payload.document || !payload.page) throw new Error(payload.message ?? 'The insertion was rejected.');
            save.sync(payload.document, payload.page.version);
            dispatch({ type: 'setDocument', document: payload.document });
            setError(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The insertion was rejected.');
        }
    };

    return (
        <div className="bg-background text-foreground flex h-screen min-h-[620px] flex-col overflow-hidden" data-builder-editor="true">
            <BuilderToolbar
                websiteName={websiteName}
                pageName={pageName}
                breakpoint={activeBreakpoint}
                onBreakpointChange={setActiveBreakpoint}
                saveStatus={save.status}
                saveError={save.error}
                onRetry={save.retry}
                onToggleElements={() => setElementsOpen((value) => !value)}
                onToggleInspector={() => setInspectorOpen((value) => !value)}
            />
            <div className="flex min-h-0 flex-1">
                {elementsOpen ? (
                    <div className="flex h-full min-h-0 shrink-0 flex-col max-lg:absolute max-lg:inset-y-14 max-lg:left-0 max-lg:z-10 max-lg:shadow-xl">
                        <BuilderElementsPanel
                            definitions={registeredDefinitions}
                            templates={templates}
                            reusableDefinitions={reusableDefinitions}
                            mediaAssets={mediaAssets}
                            onInsert={(type) => run(() => insertEditorComponent(state, engine, insertionParentIdFor(type), type))}
                            onInsertTemplate={(id) => void insertPersistedDefinition('template', id)}
                            onInsertReusable={(id) => void insertPersistedDefinition('reusable', id)}
                        />
                        <BuilderLayersPanel
                            document={state.document}
                            registry={registry}
                            selectedNodeId={state.selectedNodeId}
                            onSelect={(nodeId) => dispatch({ type: 'selectNode', nodeId })}
                        />
                    </div>
                ) : null}
                <main className="flex min-w-0 flex-1 flex-col">
                    {error ? (
                        <div className="border-destructive/20 bg-destructive/10 text-destructive border-b px-4 py-2 text-xs" role="alert">
                            {error}
                        </div>
                    ) : null}
                    <BuilderCanvasView
                        state={state}
                        dispatch={dispatch}
                        breakpoint={activeBreakpoint}
                        componentRegistry={registry}
                        onStartDrag={(nodeId) => dispatch({ type: 'startDrag', nodeId })}
                        onDragOverNode={(targetId, mode) => {
                            if (!state.draggedNodeId) return;
                            const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
                            if (!parentId) return;
                            const position =
                                mode === 'append' ? appendPosition() : mode === 'before' ? beforePosition(targetId) : afterPosition(targetId);
                            const draggedNode = engine.find(state.document, state.draggedNodeId);
                            if (!draggedNode || !engine.canAcceptChild(state.document, parentId, draggedNode.type)) {
                                dispatch({ type: 'setDropTarget', target: null });
                                return;
                            }
                            dispatch({ type: 'setDropTarget', target: { parentId, position } });
                        }}
                        canDropOnNode={canDropOnNode}
                        onDropNode={dropNode}
                        onEndDrag={() => dispatch({ type: 'clearDrag' })}
                        dropTargetId={
                            state.dropTarget
                                ? state.dropTarget.position.mode === 'append'
                                    ? state.dropTarget.parentId
                                    : state.dropTarget.position.siblingId
                                : null
                        }
                        reusableDefinitions={reusableDefinitions}
                        zoom={zoom}
                        viewportWidth={viewportWidth}
                        onInlineTextChange={(nodeId, text) => { run(() => updateEditorProps(state, engine, nodeId, { text })); dispatch({ type: 'endInlineEdit' }); }}
                        editingNodeId={state.editingNodeId}
                        onStartInlineEdit={(nodeId) => dispatch({ type: 'startInlineEdit', nodeId })}
                        onEndInlineEdit={() => dispatch({ type: 'endInlineEdit' })}
                        onInsertContextual={(parentId, type) => run(() => insertEditorComponent(state, engine, parentId, type))}
                    />
                </main>
                {inspectorOpen ? (
                    <ComponentInspector
                        node={selectedNode}
                        definition={selectedDefinition}
                        onChange={(patch) => run(() => updateEditorProps(state, engine, selectedNode?.id ?? '', patch))}
                        breakpoint={activeBreakpoint}
                        onBreakpointChange={setActiveBreakpoint}
                        onStyleChange={(key, value) =>
                            selectedNode && run(() => updateEditorStyles(state, engine, selectedNode.id, activeBreakpoint, { [key]: value }))
                        }
                        onStyleClear={(key) =>
                            selectedNode && run(() => clearEditorStyleOverride(state, engine, selectedNode.id, activeBreakpoint, key))
                        }
                        onDuplicate={() => selectedNode && run(() => duplicateEditorNode(state, engine, selectedNode.id))}
                        onRemove={() => selectedNode && run(() => removeEditorNode(state, engine, selectedNode.id))}
                        onAddChild={(type) => selectedNode && run(() => insertEditorComponent(state, engine, selectedNode.id, type))}
                    />
                ) : null}
            </div>
            <BuilderBottomBar
                breakpoint={activeBreakpoint}
                zoom={zoom}
                viewportWidth={viewportWidth}
                onZoomChange={setZoom}
                onViewportWidthChange={setViewportWidth}
                onBreakpointChange={setActiveBreakpoint}
            />
        </div>
    );

    function findInsertionParentId(type: `${string}.${string}`, preferredParentId: string): string {
        if (engine.canAcceptChild(state.document, preferredParentId, type)) {
            return preferredParentId;
        }

        const fallback = findFirstAcceptingParent(state.document.root, type);
        if (fallback) {
            return fallback;
        }

        return state.document.root.id;
    }

    function findFirstAcceptingParent(node: BuilderPageDocument['root'], type: `${string}.${string}`): string | null {
        if (engine.canAcceptChild(state.document, node.id, type)) {
            return node.id;
        }

        for (const child of node.children) {
            const found = findFirstAcceptingParent(child, type);
            if (found) return found;
        }

        return null;
    }
}

function containsNode(node: BuilderPageDocument['root'], nodeId: string): boolean {
    return node.children.some((child) => child.id === nodeId || containsNode(child, nodeId));
}
