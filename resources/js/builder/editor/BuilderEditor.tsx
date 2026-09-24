import { Code2 } from 'lucide-react';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { BuilderBreakpoint, BuilderComponentNode, BuilderPageDocument, BuilderRecord, JsonValue } from '../document';
import { ComponentTreeEngine } from '../engine/component-tree-engine';
import { afterPosition, appendPosition, beforePosition } from '../engine/tree-position';
import type { MediaAsset } from '../persistence';
import { createBuiltInComponentRegistry } from '../registry/built-ins';
import type { ReusableComponentDefinition } from '../reusable';
import { resolveStyles } from '../style/style';
import { BuilderCanvasView } from './BuilderCanvas';
import { BuilderLeftPanel } from './BuilderLeftPanel';
import { BuilderToolbar } from './BuilderToolbar';
import { CodeEditor } from './CodeEditor';
import { ComponentInspector } from './ComponentInspector';
import { MediaManager } from './MediaManager';
import {
    clearEditorStyleOverride,
    duplicateEditorNode,
    insertEditorComponent,
    moveEditorNode,
    moveEditorNodeSibling,
    pasteEditorNode,
    removeEditorNode,
    updateEditorMetadata,
    updateEditorProps,
    updateEditorStyles,
} from './editor-operations';
import { editorReducer } from './editor-reducer';
import { createEditorState, getSelectedNode, setDocument } from './editor-state';
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
    const [availableMediaAssets, setAvailableMediaAssets] = useState(mediaAssets);
    const [activeBreakpoint, setActiveBreakpoint] = useState<BuilderBreakpoint>(breakpoint);
    const [elementPickerParentId, setElementPickerParentId] = useState<string | null>(null);
    const [elementsOpen, setElementsOpen] = useState(true);
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const [mediaManagerTarget, setMediaManagerTarget] = useState<{ kind: 'image' | 'background'; nodeId: string } | null>(null);
    const [codeSettingsOpen, setCodeSettingsOpen] = useState(false);
    const clipboardRef = useRef<BuilderComponentNode | null>(null);
    const undoStack = useRef<BuilderPageDocument[]>([]);
    const redoStack = useRef<BuilderPageDocument[]>([]);
    const save = useBuilderAutosave(state.document, pageId, initialVersion);
    const hasPendingChanges = save.status !== 'saved';

    useEffect(() => {
        if (!hasPendingChanges) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasPendingChanges]);

    const confirmBeforeLeave = () => !hasPendingChanges || window.confirm('You have unsaved changes. Leave the builder and discard them?');
    const handleBreakpointChange = (nextBreakpoint: BuilderBreakpoint) => {
        setActiveBreakpoint(nextBreakpoint);
    };
    const commitDocument = (nextState: ReturnType<typeof createEditorState>) => {
        undoStack.current.push(state.document);
        redoStack.current = [];
        dispatch({ type: 'replaceState', state: nextState });
    };
    const undo = () => {
        const previous = undoStack.current.pop();
        if (!previous) return;
        redoStack.current.push(state.document);
        dispatch({ type: 'setDocument', document: previous });
    };
    const redo = () => {
        const next = redoStack.current.pop();
        if (!next) return;
        undoStack.current.push(state.document);
        dispatch({ type: 'setDocument', document: next });
    };

    useEffect(() => {
        dispatch({ type: 'setDocument', document });
    }, [document]);

    useEffect(() => {
        setAvailableMediaAssets(mediaAssets);
    }, [mediaAssets]);

    const selectedNode = getSelectedNode(state);
    const selectedDefinition = selectedNode ? registry.get(selectedNode.type) : null;
    const registeredDefinitions = registry
        .all()
        .filter((definition) => !['layout.root', 'layout.container', 'reusable.instance'].includes(definition.type));
    const insertionParentIdFor = (type: `${string}.${string}`) => findInsertionParentId(type, selectedNode?.id ?? state.document.root.id);
    const canMoveNode = (nodeId: string, direction: 'up' | 'down') => {
        const parent = engine.findParent(state.document, nodeId);
        if (!parent) return false;
        const index = parent.children.findIndex((child) => child.id === nodeId);
        return direction === 'up' ? index > 0 : index >= 0 && index < parent.children.length - 1;
    };
    const isNodeHidden = (nodeId: string) => {
        const node = engine.find(state.document, nodeId);
        const definition = node ? registry.get(node.type) : null;
        return Boolean(node && definition && resolveStyles(node, definition, activeBreakpoint).display === 'none');
    };
    const isNodeLocked = (nodeId: string) => engine.find(state.document, nodeId)?.metadata?.locked === true;
    const isNodeFullWidth = (nodeId: string) => engine.find(state.document, nodeId)?.props.fullWidth === true;
    const pasteTargetId = (nodeId: string) => {
        const source = clipboardRef.current;
        const node = engine.find(state.document, nodeId);
        if (source && node && engine.canAcceptChild(state.document, node.id, source.type)) return node.id;
        return engine.findParent(state.document, nodeId)?.id ?? null;
    };
    const canPasteNode = (nodeId: string) => {
        const parentId = pasteTargetId(nodeId);
        const source = clipboardRef.current;
        return Boolean(parentId && source && engine.canAcceptChild(state.document, parentId, source.type));
    };
    const selectNodeFromLayers = (nodeId: string) => {
        dispatch({ type: 'selectNode', nodeId });
        requestAnimationFrame(() => {
            window.document
                .querySelector<HTMLElement>(`[data-builder-node-id="${nodeId}"]`)
                ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
    };

    const run = (operation: () => ReturnType<typeof createEditorState>) => {
        try {
            commitDocument(operation());
            setError(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The builder operation was rejected.');
        }
    };
    const updateDocumentMetadata = (patch: Record<string, JsonValue | undefined>) => {
        run(() => {
            const nextDocument = structuredClone(state.document);
            const metadata: BuilderRecord = { ...(nextDocument.metadata ?? {}) };
            Object.entries(patch).forEach(([key, value]) => {
                if (value === undefined) delete metadata[key];
                else metadata[key] = value;
            });
            nextDocument.metadata = Object.keys(metadata).length > 0 ? metadata : undefined;

            return setDocument(state, nextDocument);
        });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const editingText = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
            if (editingText && event.key !== 'Escape') return;

            const modifier = event.metaKey || event.ctrlKey;
            if (modifier && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (event.shiftKey) redo();
                else undo();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'y') {
                event.preventDefault();
                redo();
                return;
            }
            if (modifier && event.key.toLowerCase() === 'd' && selectedNode) {
                event.preventDefault();
                run(() => duplicateEditorNode(state, engine, selectedNode.id));
                return;
            }
            if (modifier && event.key.toLowerCase() === 'c' && selectedNode) {
                event.preventDefault();
                clipboardRef.current = structuredClone(selectedNode);
                return;
            }
            if (modifier && event.key.toLowerCase() === 'v' && selectedNode && canPasteNode(selectedNode.id) && clipboardRef.current) {
                event.preventDefault();
                const targetId = pasteTargetId(selectedNode.id);
                if (targetId) run(() => pasteEditorNode(state, engine, targetId, clipboardRef.current!));
                return;
            }
            if (event.key === 'Delete' && selectedNode) {
                event.preventDefault();
                run(() => removeEditorNode(state, engine, selectedNode.id));
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                dispatch({ type: 'clearSelection' });
                return;
            }
            if (event.key === 'ArrowUp' && selectedNode && canMoveNode(selectedNode.id, 'up')) {
                event.preventDefault();
                run(() => moveEditorNodeSibling(state, engine, selectedNode.id, 'up'));
            } else if (event.key === 'ArrowDown' && selectedNode && canMoveNode(selectedNode.id, 'down')) {
                event.preventDefault();
                run(() => moveEditorNodeSibling(state, engine, selectedNode.id, 'down'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNode, state, engine]);

    const dropNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId && !state.draggedComponentType) return;
        const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
        if (!parentId) return;
        const position = mode === 'append' ? appendPosition() : mode === 'before' ? beforePosition(targetId) : afterPosition(targetId);
        try {
            if (state.draggedComponentType) {
                run(() => insertEditorComponent(state, engine, parentId, state.draggedComponentType!));
                dispatch({ type: 'clearDrag' });
                return;
            }
            const nextState = moveEditorNode(state, engine, state.draggedNodeId!, { parentId, position });
            dispatch({ type: 'replaceState', state: nextState });
            dispatch({ type: 'clearDrag' });
            setError(null);
        } catch (caught) {
            dispatch({ type: 'clearDrag' });
            setError(caught instanceof Error ? caught.message : 'The drop was rejected.');
        }
    };

    const dragOverNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId && !state.draggedComponentType) return;
        const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
        if (!parentId) return;
        const position = mode === 'append' ? appendPosition() : mode === 'before' ? beforePosition(targetId) : afterPosition(targetId);
        const draggedNode = state.draggedNodeId ? engine.find(state.document, state.draggedNodeId) : null;
        const draggedType = draggedNode?.type ?? state.draggedComponentType;
        if (!draggedType || !engine.canAcceptChild(state.document, parentId, draggedType)) {
            dispatch({ type: 'setDropTarget', target: null });
            return;
        }
        dispatch({ type: 'setDropTarget', target: { parentId, position } });
    };

    const canDropOnNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if ((!state.draggedNodeId && !state.draggedComponentType) || state.draggedNodeId === targetId) return false;
        const draggedNode = state.draggedNodeId ? engine.find(state.document, state.draggedNodeId) : null;
        const draggedType = draggedNode?.type ?? state.draggedComponentType;
        const targetNode = engine.find(state.document, targetId);
        if (!draggedType || !targetNode || (draggedNode && containsNode(draggedNode, targetId))) return false;
        const parentId = mode === 'append' ? targetId : engine.findParent(state.document, targetId)?.id;
        return Boolean(parentId && engine.canAcceptChild(state.document, parentId, draggedType));
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

    const uploadImage = async (file: File): Promise<MediaAsset> => {
        const form = new FormData();
        form.append('file', file);
        const response = await fetch(route('builder.media.store'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
            body: form,
        });
        const payload = (await response.json()) as { media?: MediaAsset; message?: string };
        if (!response.ok || !payload.media) throw new Error(payload.message ?? 'The image upload failed.');
        setAvailableMediaAssets((current) => [payload.media!, ...current.filter((asset) => asset.id !== payload.media!.id)]);
        return payload.media;
    };

    return (
        <div className="builder-editor bg-background text-foreground flex h-screen min-h-[620px] flex-col overflow-hidden" data-builder-editor="true">
            <BuilderToolbar
                websiteName={websiteName}
                pageName={pageName}
                pageId={pageId}
                breakpoint={activeBreakpoint}
                onBreakpointChange={handleBreakpointChange}
                saveStatus={save.status}
                saveError={save.error}
                onRetry={save.retry}
                onToggleElements={() => setElementsOpen((value) => !value)}
                onToggleInspector={() => setInspectorOpen((value) => !value)}
                elementsOpen={elementsOpen}
                inspectorOpen={inspectorOpen}
                canUndo={undoStack.current.length > 0}
                canRedo={redoStack.current.length > 0}
                onUndo={undo}
                onRedo={redo}
                onSave={save.saveNow}
                onBeforeLeave={confirmBeforeLeave}
                onOpenCodeSettings={() => setCodeSettingsOpen(true)}
            />
            <div className="flex min-h-0 flex-1">
                {elementsOpen ? (
                    <div className="bg-card border-border flex h-full min-h-0 w-[288px] sm:w-[300px] shrink-0 flex-col overflow-hidden border-r max-lg:absolute max-lg:inset-y-14 max-lg:left-0 max-lg:z-10 max-lg:shadow-xl">
                        <BuilderLeftPanel
                            definitions={registeredDefinitions}
                            templates={templates}
                            reusableDefinitions={reusableDefinitions}
                            mediaAssets={availableMediaAssets}
                            onInsert={(type) => run(() => insertEditorComponent(state, engine, insertionParentIdFor(type), type))}
                            onStartDrag={(type) => dispatch({ type: 'startComponentDrag', componentType: type })}
                            onInsertTemplate={(id) => void insertPersistedDefinition('template', id)}
                            onInsertReusable={(id) => void insertPersistedDefinition('reusable', id)}
                            onUploadMedia={uploadImage}
                            document={state.document}
                            registry={registry}
                            selectedNodeId={state.selectedNodeId}
                            dropTargetId={
                                state.dropTarget
                                    ? state.dropTarget.position.mode === 'append'
                                        ? state.dropTarget.parentId
                                        : state.dropTarget.position.siblingId
                                    : null
                            }
                            onSelectNode={selectNodeFromLayers}
                            onStartDragNode={(nodeId) => dispatch({ type: 'startDrag', nodeId })}
                            onDragOverNode={dragOverNode}
                            onDropNode={dropNode}
                            onEndDragNode={() => dispatch({ type: 'clearDrag' })}
                            canDropOnNode={canDropOnNode}
                        />
                    </div>
                ) : null}
                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
                        onDragOverNode={dragOverNode}
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
                        onInlineTextChange={(nodeId, text) => {
                            run(() => updateEditorProps(state, engine, nodeId, { text }));
                            dispatch({ type: 'endInlineEdit' });
                        }}
                        editingNodeId={state.editingNodeId}
                        onStartInlineEdit={(nodeId) => dispatch({ type: 'startInlineEdit', nodeId })}
                        onEndInlineEdit={() => dispatch({ type: 'endInlineEdit' })}
                        onOpenElementPicker={setElementPickerParentId}
                        onDuplicateNode={(nodeId) => run(() => duplicateEditorNode(state, engine, nodeId))}
                        onRemoveNode={(nodeId) => run(() => removeEditorNode(state, engine, nodeId))}
                        onMoveNode={(nodeId, direction) => run(() => moveEditorNodeSibling(state, engine, nodeId, direction))}
                        canMoveNode={canMoveNode}
                        onCopyNode={(nodeId) => {
                            const source = engine.find(state.document, nodeId);
                            if (source) clipboardRef.current = structuredClone(source);
                        }}
                        onPasteNode={(nodeId) => {
                            const parentId = pasteTargetId(nodeId);
                            if (parentId && clipboardRef.current) run(() => pasteEditorNode(state, engine, parentId, clipboardRef.current!));
                        }}
                        canPasteNode={canPasteNode}
                        onToggleVisibility={(nodeId) => {
                            if (isNodeHidden(nodeId)) run(() => clearEditorStyleOverride(state, engine, nodeId, activeBreakpoint, 'display'));
                            else run(() => updateEditorStyles(state, engine, nodeId, activeBreakpoint, { display: 'none' }));
                        }}
                        isNodeHidden={isNodeHidden}
                        onToggleLock={(nodeId) => run(() => updateEditorMetadata(state, engine, nodeId, { locked: !isNodeLocked(nodeId) }))}
                        isNodeLocked={isNodeLocked}
                        onSetFlexDirection={(nodeId, direction) =>
                            run(() => updateEditorStyles(state, engine, nodeId, activeBreakpoint, { flexDirection: direction }))
                        }
                        onSetFlexStyle={(nodeId, key, value) =>
                            run(() => updateEditorStyles(state, engine, nodeId, activeBreakpoint, { [key]: value }))
                        }
                        onToggleFullWidth={(nodeId) => run(() => updateEditorProps(state, engine, nodeId, { fullWidth: !isNodeFullWidth(nodeId) }))}
                        isNodeFullWidth={isNodeFullWidth}
                        onAddColumn={(nodeId) => run(() => insertEditorComponent(state, engine, nodeId, 'layout.column'))}
                        onAddElement={(nodeId) => {
                            const node = engine.find(state.document, nodeId);
                            if (nodeId === state.document.root.id) run(() => insertEditorComponent(state, engine, nodeId, 'layout.section'));
                            else if (node?.type === 'layout.section') run(() => insertEditorComponent(state, engine, nodeId, 'layout.row'));
                            else setElementPickerParentId(nodeId);
                        }}
                        onOpenMediaManager={(target = 'image', nodeId = selectedNode?.id) => {
                            if (nodeId) setMediaManagerTarget({ kind: target, nodeId });
                        }}
                        onEditNode={(nodeId) => dispatch({ type: 'startInlineEdit', nodeId })}
                    />
                </main>
                {inspectorOpen ? (
                    <ComponentInspector
                        node={selectedNode}
                        definition={selectedDefinition}
                        onChange={(patch) => run(() => updateEditorProps(state, engine, selectedNode?.id ?? '', patch))}
                        breakpoint={activeBreakpoint}
                        onStyleChange={(keyOrPatch, value) => {
                            if (!selectedNode) return;
                            const patch = typeof keyOrPatch === 'string' ? { [keyOrPatch]: value } : keyOrPatch;
                            run(() => updateEditorStyles(state, engine, selectedNode.id, activeBreakpoint, patch));
                        }}
                        onStyleClear={(keyOrKeys) => {
                            if (!selectedNode) return;
                            run(() => clearEditorStyleOverride(state, engine, selectedNode.id, activeBreakpoint, keyOrKeys));
                        }}
                        onMetadataChange={(patch) => selectedNode && run(() => updateEditorMetadata(state, engine, selectedNode.id, patch))}
                        onDuplicate={() => selectedNode && run(() => duplicateEditorNode(state, engine, selectedNode.id))}
                        onRemove={() => selectedNode && run(() => removeEditorNode(state, engine, selectedNode.id))}
                        onAddChild={(type) => selectedNode && run(() => insertEditorComponent(state, engine, selectedNode.id, type))}
                        onOpenMediaManager={(target = 'image') => {
                            if (selectedNode) setMediaManagerTarget({ kind: target, nodeId: selectedNode.id });
                        }}
                    />
                ) : null}
            </div>
            {elementPickerParentId ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Choose an element"
                >
                    <div className="border-border bg-card w-full max-w-md rounded-2xl border p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-foreground text-sm font-semibold tracking-tight">Add element</h2>
                            <button
                                type="button"
                                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-full text-xs transition"
                                onClick={() => setElementPickerParentId(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
                            {registeredDefinitions
                                .filter((definition) => engine.canAcceptChild(state.document, elementPickerParentId, definition.type))
                                .map((definition) => (
                                    <button
                                        key={definition.type}
                                        type="button"
                                        className="border-border hover:border-primary/50 hover:bg-primary/5 text-foreground group flex items-center justify-between rounded-xl border p-2.5 text-left text-xs font-medium transition"
                                        onClick={() => {
                                            run(() => insertEditorComponent(state, engine, elementPickerParentId, definition.type));
                                            setElementPickerParentId(null);
                                        }}
                                    >
                                        <span>{definition.name}</span>
                                        <span className="text-primary text-[11px] opacity-0 transition group-hover:opacity-100">+</span>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            ) : null}
            {mediaManagerTarget ? (
                <MediaManager
                    assets={availableMediaAssets}
                    onUpload={uploadImage}
                    onSelect={(asset) => {
                        if (mediaManagerTarget.kind === 'background') {
                            run(() =>
                                updateEditorStyles(state, engine, mediaManagerTarget.nodeId, activeBreakpoint, {
                                    backgroundType: 'image',
                                    backgroundImage: String(asset.url ?? ''),
                                }),
                            );
                        } else {
                            run(() =>
                                updateEditorProps(state, engine, mediaManagerTarget.nodeId, { src: asset.url ?? '', alt: asset.altText ?? '' }),
                            );
                        }
                        setMediaManagerTarget(null);
                    }}
                    onClose={() => setMediaManagerTarget(null)}
                />
            ) : null}
            {codeSettingsOpen ? (
                <GlobalCodeModal
                    metadata={state.document.metadata ?? {}}
                    onChange={updateDocumentMetadata}
                    onClose={() => setCodeSettingsOpen(false)}
                />
            ) : null}
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

        throw new Error(`No valid insertion target is available for ${type}. Add a Section first.`);
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

function GlobalCodeModal({
    metadata,
    onChange,
    onClose,
}: {
    metadata: BuilderRecord;
    onChange: (patch: Record<string, JsonValue | undefined>) => void;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState<'head' | 'footer'>('head');
    const headCode = typeof metadata.globalHeadCode === 'string' ? metadata.globalHeadCode : '';
    const footerCode = typeof metadata.globalFooterCode === 'string' ? metadata.globalFooterCode : '';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label="Global code"
        >
            <div className="border-border bg-card text-card-foreground flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
                <div className="border-border bg-card flex items-center justify-between border-b px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                            <Code2 className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-foreground text-sm font-semibold tracking-tight">Global Head & Footer Code</h2>
                            <p className="text-muted-foreground text-[11px]">Inject external stylesheets, fonts, scripts, and tracking tags</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-full text-xs transition"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="border-border bg-muted/30 flex gap-2 border-b px-5 py-2">
                    <button
                        type="button"
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'head' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('head')}
                    >
                        <span>Head code (&lt;head&gt;)</span>
                        {headCode ? <span className="size-1.5 rounded-full bg-emerald-500" title="Has content" /> : null}
                    </button>
                    <button
                        type="button"
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'footer' ? 'bg-background text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('footer')}
                    >
                        <span>Footer code (&lt;/body&gt;)</span>
                        {footerCode ? <span className="size-1.5 rounded-full bg-emerald-500" title="Has content" /> : null}
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {activeTab === 'head' ? (
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Injected before the closing <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[11px]">&lt;/head&gt;</code> tag on published pages. Ideal for Google Fonts, CSS stylesheets, and pre-load tags.
                            </p>
                            <CodeEditor
                                language="html"
                                title="Head Code (<head>)"
                                minHeight="360px"
                                maxHeight="550px"
                                placeholder='<link rel="stylesheet" href="https://fonts.googleapis.com/...">'
                                value={headCode}
                                onChange={(next) =>
                                    onChange({ globalHeadCode: next.trim() === '' ? undefined : next })
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Injected before the closing <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[11px]">&lt;/body&gt;</code> tag on published pages. Ideal for Google Analytics, tracking pixels, chatbots, and deferred scripts.
                            </p>
                            <CodeEditor
                                language="html"
                                title="Footer Code (</body>)"
                                minHeight="360px"
                                maxHeight="550px"
                                placeholder='<script src="https://cdn.example.com/analytics.js"></script>'
                                value={footerCode}
                                onChange={(next) =>
                                    onChange({ globalFooterCode: next.trim() === '' ? undefined : next })
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="border-border bg-muted/20 flex items-center justify-end border-t px-5 py-3">
                    <button
                        type="button"
                        className="bg-primary text-primary-foreground rounded-full px-5 py-1.5 text-xs font-semibold shadow-xs transition hover:brightness-105"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function containsNode(node: BuilderPageDocument['root'], nodeId: string): boolean {
    return node.children.some((child) => child.id === nodeId || containsNode(child, nodeId));
}
