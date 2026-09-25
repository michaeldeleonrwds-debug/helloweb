import { Code2 } from 'lucide-react';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { BuilderBreakpoint, BuilderComponentNode, BuilderPageDocument, BuilderRecord, ComponentType, JsonValue } from '../document';
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
import { LayoutTemplatesModal, type LayoutTemplateItem, type LayoutTemplateType } from './LayoutTemplatesModal';
import { MediaManager } from './MediaManager';
import { PanelResizeHandle } from './PanelResizeHandle';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { ImportModal } from '@/components/ImportModal';
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
import { createEditorState, findNode, getSelectedNode, setDocument } from './editor-state';
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
    pageStatus?: string;
    pageSlug?: string;
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
    pageStatus = 'draft',
    pageSlug,
}: BuilderEditorProps) {
    const registry = useMemo(() => createBuiltInComponentRegistry(), []);
    const engine = useMemo(() => new ComponentTreeEngine(registry), [registry]);
    const [state, dispatch] = useReducer(editorReducer, document, createEditorState);
    const [currentStatus, setCurrentStatus] = useState<string>(pageStatus);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishNotice, setPublishNotice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [availableMediaAssets, setAvailableMediaAssets] = useState(mediaAssets);
    const [availableReusable, setAvailableReusable] = useState<ReusableComponentDefinition[]>(reusableDefinitions);
    const [availableTemplates, setAvailableTemplates] = useState(templates);
    const [activeBreakpoint, setActiveBreakpoint] = useState<BuilderBreakpoint>(breakpoint);
    const [elementPickerParentId, setElementPickerParentId] = useState<string | null>(null);
    const [elementsOpen, setElementsOpen] = useState(true);
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const [mediaManagerTarget, setMediaManagerTarget] = useState<{ kind: string; nodeId: string; itemIndex?: number } | null>(null);
    const [codeSettingsOpen, setCodeSettingsOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [layoutModalOpen, setLayoutModalOpen] = useState(false);
    const [layoutModalType, setLayoutModalType] = useState<LayoutTemplateType>('columns');
    const [leftPanelWidth, setLeftPanelWidth] = useState(300);
    const [rightPanelWidth, setRightPanelWidth] = useState(340);
    const [zoomLevel, setZoomLevel] = useState<number>(80);
    const [unsavedLeaveDialogOpen, setUnsavedLeaveDialogOpen] = useState(false);
    const [isLeavingWithSave, setIsLeavingWithSave] = useState(false);
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

    const handleNavigateBack = () => {
        if (hasPendingChanges) {
            setUnsavedLeaveDialogOpen(true);
        } else {
            window.location.href = '/dashboard';
        }
    };

    const handleDiscardAndLeave = () => {
        setUnsavedLeaveDialogOpen(false);
        window.location.href = '/dashboard';
    };

    const handleSaveAndLeave = async () => {
        setIsLeavingWithSave(true);
        try {
            const saved = await save.saveNow();
            if (saved) {
                window.location.href = '/dashboard';
            } else {
                setIsLeavingWithSave(false);
            }
        } catch {
            setIsLeavingWithSave(false);
        }
    };

    const handlePublish = async () => {
        if (!pageId || isPublishing) return;
        setIsPublishing(true);
        try {
            // Cancel any pending debounced autosave to prevent race condition with publish
            save.cancelPending();

            const response = await fetch(route('builder.pages.publish', pageId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ document: state.document }),
            });

            const data = (await response.json()) as {
                message?: string;
                save?: { status?: string; version?: number };
                page?: { version?: number };
            };

            if (!response.ok) {
                throw new Error(data.message ?? 'Failed to publish page.');
            }

            // Sync the saved version so autosave knows the document is saved at the latest DB version
            const newVersion = data.save?.version ?? data.page?.version;
            if (typeof newVersion === 'number') {
                save.sync(state.document, newVersion);
            }

            setCurrentStatus('published');
            setPublishNotice('Page published successfully! Public website is updated.');
            setTimeout(() => setPublishNotice(null), 5000);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Unable to publish page.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleBreakpointChange = (nextBreakpoint: BuilderBreakpoint) => {
        setActiveBreakpoint(nextBreakpoint);
        if (nextBreakpoint === 'desktop') {
            setZoomLevel(80);
        } else {
            setZoomLevel(100);
        }
    };

    const handleSelectLayoutTemplate = (template: LayoutTemplateItem) => {
        run(() => {
            let currentDoc = state.document;
            let targetSectionId: string | null = null;
            if (
                selectedNode &&
                (selectedNode.type === 'layout.section' ||
                    engine.findParent(currentDoc, selectedNode.id)?.type === 'layout.section')
            ) {
                targetSectionId =
                    selectedNode.type === 'layout.section'
                        ? selectedNode.id
                        : engine.findParent(currentDoc, selectedNode.id)!.id;
            } else {
                const firstSection = currentDoc.root.children.find((c) => c.type === 'layout.section');
                if (firstSection) {
                    targetSectionId = firstSection.id;
                } else {
                    currentDoc = engine.insertComponent(currentDoc, currentDoc.root.id, 'layout.section');
                    const newSection = currentDoc.root.children[currentDoc.root.children.length - 1];
                    targetSectionId = newSection.id;
                }
            }

            const existingIds = new Set<string>();
            const collect = (n: BuilderComponentNode) => {
                existingIds.add(n.id);
                n.children.forEach(collect);
            };
            collect(currentDoc.root);
            let count = 1;
            const genId = (t: string) => {
                let candidate = `${t.replace('.', '_')}_${Date.now()}_${count++}`;
                while (existingIds.has(candidate)) {
                    candidate = `${t.replace('.', '_')}_${Date.now()}_${count++}`;
                }
                existingIds.add(candidate);
                return candidate;
            };

            const templateNode = template.buildNode(genId);
            const nextDoc = engine.insert(currentDoc, targetSectionId, templateNode);
            return setDocument(state, nextDoc);
        });
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

    useEffect(() => {
        setAvailableReusable(reusableDefinitions);
    }, [reusableDefinitions]);

    useEffect(() => {
        setAvailableTemplates(templates);
    }, [templates]);

    const refreshReusableDefinitions = async () => {
        try {
            const res = await fetch(route('builder.reusable.index'), {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.components)) {
                    setAvailableReusable(data.components);
                }
            }
        } catch {
            // Silently fail if network issue
        }
    };

    const refreshTemplateDefinitions = async () => {
        try {
            const res = await fetch(route('builder.templates.index'), {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.templates)) {
                    setAvailableTemplates(
                        data.templates.map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            description: t.description,
                        }))
                    );
                }
            }
        } catch {
            // Silently fail if network issue
        }
    };

    const selectedNode = getSelectedNode(state);
    const selectedDefinition = selectedNode ? registry.get(selectedNode.type) : null;
    const registeredDefinitions = registry
        .all()
        .filter((definition) => !['layout.root', 'layout.container', 'reusable.instance', 'layout.flex'].includes(definition.type));
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

    const resolveDropParentAndPosition = (targetId: string, mode: 'append' | 'before' | 'after', draggedType: ComponentType) => {
        if (mode === 'append') {
            if (engine.canAcceptChild(state.document, targetId, draggedType)) {
                return { parentId: targetId, position: appendPosition() };
            }
            const targetNode = engine.find(state.document, targetId);
            if (targetNode) {
                const acceptingChild = targetNode.children.find((child) => engine.canAcceptChild(state.document, child.id, draggedType));
                if (acceptingChild) {
                    return { parentId: acceptingChild.id, position: appendPosition() };
                }
            }
            return null;
        }

        const parent = engine.findParent(state.document, targetId);
        if (parent && engine.canAcceptChild(state.document, parent.id, draggedType)) {
            return { parentId: parent.id, position: mode === 'before' ? beforePosition(targetId) : afterPosition(targetId) };
        }

        // If parent cannot accept (e.g. column inside row, but draggedType is button),
        // check if targetId itself can accept it as append
        if (engine.canAcceptChild(state.document, targetId, draggedType)) {
            return { parentId: targetId, position: appendPosition() };
        }

        return null;
    };

    const canDropOnNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if ((!state.draggedNodeId && !state.draggedComponentType) || state.draggedNodeId === targetId) return false;
        const draggedNode = state.draggedNodeId ? engine.find(state.document, state.draggedNodeId) : null;
        const draggedType = (draggedNode?.type ?? state.draggedComponentType) as ComponentType | undefined;
        const targetNode = engine.find(state.document, targetId);
        if (!draggedType || !targetNode || (draggedNode && containsNode(draggedNode, targetId))) return false;
        return resolveDropParentAndPosition(targetId, mode, draggedType) !== null;
    };

    const dragOverNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId && !state.draggedComponentType) return;
        const draggedNode = state.draggedNodeId ? engine.find(state.document, state.draggedNodeId) : null;
        const draggedType = (draggedNode?.type ?? state.draggedComponentType) as ComponentType | undefined;
        if (!draggedType) return;
        const resolved = resolveDropParentAndPosition(targetId, mode, draggedType);
        if (!resolved) {
            dispatch({ type: 'setDropTarget', target: null });
            return;
        }
        dispatch({ type: 'setDropTarget', target: resolved });
    };

    const dropNode = (targetId: string, mode: 'append' | 'before' | 'after') => {
        if (!state.draggedNodeId && !state.draggedComponentType) return;
        const draggedNode = state.draggedNodeId ? engine.find(state.document, state.draggedNodeId) : null;
        const draggedType = (draggedNode?.type ?? state.draggedComponentType) as ComponentType | undefined;
        if (!draggedType) return;
        const resolved = resolveDropParentAndPosition(targetId, mode, draggedType);
        if (!resolved) return;
        try {
            if (state.draggedComponentType) {
                run(() => insertEditorComponent(state, engine, resolved.parentId, state.draggedComponentType!, resolved.position));
                dispatch({ type: 'clearDrag' });
                return;
            }
            const nextState = moveEditorNode(state, engine, state.draggedNodeId!, resolved);
            commitDocument(nextState);
            dispatch({ type: 'clearDrag' });
            setError(null);
        } catch (caught) {
            dispatch({ type: 'clearDrag' });
            setError(caught instanceof Error ? caught.message : 'The drop was rejected.');
        }
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
                zoom={zoomLevel}
                onZoomChange={setZoomLevel}
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
                onNavigateBack={handleNavigateBack}
                onOpenCodeSettings={() => setCodeSettingsOpen(true)}
                onOpenImport={() => setImportModalOpen(true)}
                pageStatus={currentStatus}
                onPublish={handlePublish}
                isPublishing={isPublishing}
            />
            <div className="flex min-h-0 flex-1">
                {elementsOpen ? (
                    <>
                        <div
                            className="bg-card border-border flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r max-lg:absolute max-lg:inset-y-14 max-lg:left-0 max-lg:z-10 max-lg:shadow-xl"
                            style={{ width: `${leftPanelWidth}px` }}
                        >
                            <BuilderLeftPanel
                                definitions={registeredDefinitions}
                                templates={availableTemplates}
                                reusableDefinitions={availableReusable}
                                mediaAssets={availableMediaAssets}
                                onInsert={(type) => run(() => insertEditorComponent(state, engine, insertionParentIdFor(type), type))}
                                onStartDrag={(type) => dispatch({ type: 'startComponentDrag', componentType: type })}
                                onOpenLayoutTemplates={(type) => {
                                    setLayoutModalType(type);
                                    setLayoutModalOpen(true);
                                }}
                                onInsertTemplate={(id) => void insertPersistedDefinition('template', id)}
                                onInsertReusable={(id) => void insertPersistedDefinition('reusable', id)}
                                onOpenImport={() => setImportModalOpen(true)}
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
                        <PanelResizeHandle
                            direction="right"
                            onResize={(delta) => setLeftPanelWidth((w) => Math.min(520, Math.max(240, w + delta)))}
                            onReset={() => setLeftPanelWidth(300)}
                        />
                    </>
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
                        dropTargetMode={state.dropTarget?.position.mode ?? null}
                        zoom={zoomLevel}
                        reusableDefinitions={availableReusable}
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
                        onOpenMediaManager={(target = 'image', nodeId = selectedNode?.id, payload?: any) => {
                            if (nodeId) setMediaManagerTarget({ kind: target, nodeId, itemIndex: payload?.itemIndex });
                        }}
                        onEditNode={(nodeId) => dispatch({ type: 'startInlineEdit', nodeId })}
                    />
                </main>
                {inspectorOpen ? (
                    <>
                        <PanelResizeHandle
                            direction="left"
                            onResize={(delta) => setRightPanelWidth((w) => Math.min(600, Math.max(260, w + delta)))}
                            onReset={() => setRightPanelWidth(340)}
                        />
                        <ComponentInspector
                            width={rightPanelWidth}
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
                            onOpenMediaManager={(target = 'image', payload?: any) => {
                                if (selectedNode) setMediaManagerTarget({ kind: target, nodeId: selectedNode.id, itemIndex: payload?.itemIndex });
                            }}
                        />
                    </>
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
                                            const actualParent = findInsertionParentId(definition.type, elementPickerParentId);
                                            // Navbar should be prepended at the top of root's children
                                            const position = definition.type === 'layout.navbar' && state.document.root.children.length > 0
                                                ? { mode: 'before' as const, siblingId: state.document.root.children[0].id }
                                                : { mode: 'append' as const };
                                            run(() => insertEditorComponent(state, engine, actualParent, definition.type, position));
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
                        const url = String(asset.url ?? '');
                        const alt = String(asset.altText ?? asset.originalFilename ?? '');

                        if (mediaManagerTarget.kind === 'background') {
                            run(() =>
                                updateEditorStyles(state, engine, mediaManagerTarget.nodeId, activeBreakpoint, {
                                    backgroundType: 'image',
                                    backgroundImage: url,
                                }),
                            );
                        } else if (mediaManagerTarget.kind === 'brandLogo') {
                            run(() =>
                                updateEditorProps(state, engine, mediaManagerTarget.nodeId, {
                                    brandLogo: url,
                                }),
                            );
                        } else if (mediaManagerTarget.kind === 'imagefeature') {
                            run(() =>
                                updateEditorProps(state, engine, mediaManagerTarget.nodeId, {
                                    imageSrc: url,
                                    imageAlt: alt,
                                }),
                            );
                        } else if (mediaManagerTarget.kind === 'gallery') {
                            const node = findNode(state.document, mediaManagerTarget.nodeId);
                            const currentImages = Array.isArray(node?.props?.images) ? [...(node.props.images as any[])] : [];
                            currentImages.push({
                                src: url,
                                caption: alt || 'Gallery Image',
                            });
                            run(() =>
                                updateEditorProps(state, engine, mediaManagerTarget.nodeId, {
                                    images: currentImages,
                                }),
                            );
                        } else if (mediaManagerTarget.kind === 'gallery-replace' && typeof mediaManagerTarget.itemIndex === 'number') {
                            const node = findNode(state.document, mediaManagerTarget.nodeId);
                            const currentImages = Array.isArray(node?.props?.images) ? [...(node.props.images as any[])] : [];
                            const idx = mediaManagerTarget.itemIndex;
                            if (currentImages[idx]) {
                                currentImages[idx] = {
                                    ...currentImages[idx],
                                    src: url,
                                    caption: currentImages[idx].caption || alt,
                                };
                                run(() =>
                                    updateEditorProps(state, engine, mediaManagerTarget.nodeId, {
                                        images: currentImages,
                                    }),
                                );
                            }
                        } else {
                            run(() =>
                                updateEditorProps(state, engine, mediaManagerTarget.nodeId, { src: url, alt }),
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
            <LayoutTemplatesModal
                open={layoutModalOpen}
                initialType={layoutModalType}
                onClose={() => setLayoutModalOpen(false)}
                onSelectTemplate={handleSelectLayoutTemplate}
            />
            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                onSuccess={(result) => {
                    if (result.type === 'component') {
                        void refreshReusableDefinitions();
                        void insertPersistedDefinition('reusable', result.id);
                    } else if (result.type === 'template') {
                        void refreshTemplateDefinitions();
                    }
                }}
            />
            <UnsavedChangesModal
                open={unsavedLeaveDialogOpen}
                onClose={() => setUnsavedLeaveDialogOpen(false)}
                onDiscard={handleDiscardAndLeave}
                onSaveAndLeave={handleSaveAndLeave}
                isSaving={isLeavingWithSave || save.status === 'saving'}
            />
            {publishNotice ? (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
                    <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{publishNotice}</span>
                    {pageSlug ? (
                        <a
                            href={pageSlug === 'home' ? '/' : `/${pageSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-emerald-400 hover:text-emerald-300 ml-1 font-bold"
                        >
                            View Live ↗
                        </a>
                    ) : null}
                </div>
            ) : null}
        </div>
    );

    function findInsertionParentId(type: `${string}.${string}`, preferredParentId: string): string {
        // Navbar must always be a direct child of root, never inside a section
        if (type === 'layout.navbar') {
            return state.document.root.id;
        }

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
