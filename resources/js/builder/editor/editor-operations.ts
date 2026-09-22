import type { BuilderBreakpoint, BuilderRecord, ComponentType, JsonValue } from '../document';
import { ComponentTreeEngine } from '../engine/component-tree-engine';
import type { TreeInsertPosition } from '../engine/tree-position';
import type { ComponentRegistry } from '../registry/component-registry';
import type { StylePropertyKey } from '../style/style';
import type { BuilderEditorState, EditorDropTarget } from './editor-state';
import { findNode, setDocument } from './editor-state';

export function insertEditorComponent(
    state: BuilderEditorState,
    engine: ComponentTreeEngine,
    parentId: string,
    type: ComponentType,
    position: TreeInsertPosition = { mode: 'append' },
): BuilderEditorState {
    const node = engine.createNode(state.document, type);
    const document = engine.insert(state.document, parentId, node, position);
    return selectInsertedNode(setDocument(state, document), node.id);
}

export function moveEditorNode(state: BuilderEditorState, engine: ComponentTreeEngine, nodeId: string, target: EditorDropTarget): BuilderEditorState {
    return setDocument(state, engine.move(state.document, nodeId, target.parentId, target.position));
}

export function duplicateEditorNode(state: BuilderEditorState, engine: ComponentTreeEngine, nodeId: string): BuilderEditorState {
    const sourceParent = engine.findParent(state.document, nodeId);
    const document = engine.duplicate(state.document, nodeId);
    const nextParent = sourceParent ? findNode(document, sourceParent.id) : null;
    const sourceIndex = nextParent?.children.findIndex((child) => child.id === nodeId) ?? -1;
    const duplicate = sourceIndex >= 0 ? nextParent?.children[sourceIndex + 1] : undefined;
    const nextState = setDocument(state, document);

    return duplicate ? selectInsertedNode(nextState, duplicate.id) : nextState;
}

export function removeEditorNode(state: BuilderEditorState, engine: ComponentTreeEngine, nodeId: string): BuilderEditorState {
    const document = engine.remove(state.document, nodeId);
    const nextState = setDocument(state, document);

    return {
        ...nextState,
        selectedNodeId: state.selectedNodeId === nodeId ? null : nextState.selectedNodeId,
        hoveredNodeId: state.hoveredNodeId === nodeId ? null : nextState.hoveredNodeId,
    };
}

export function updateEditorProps(
    state: BuilderEditorState,
    engine: ComponentTreeEngine,
    nodeId: string,
    patch: Partial<BuilderRecord>,
): BuilderEditorState {
    return setDocument(state, engine.updateProps(state.document, nodeId, patch));
}

export function updateEditorStyles(
    state: BuilderEditorState,
    engine: ComponentTreeEngine,
    nodeId: string,
    breakpoint: BuilderBreakpoint,
    patch: Record<string, JsonValue | undefined>,
): BuilderEditorState {
    return setDocument(state, engine.updateStyles(state.document, nodeId, breakpoint, patch));
}

export function clearEditorStyleOverride(
    state: BuilderEditorState,
    engine: ComponentTreeEngine,
    nodeId: string,
    breakpoint: BuilderBreakpoint,
    key: StylePropertyKey,
): BuilderEditorState {
    return setDocument(state, engine.clearStyleOverride(state.document, nodeId, breakpoint, key));
}

export function getInsertableDefinitions(registry: ComponentRegistry, engine: ComponentTreeEngine, state: BuilderEditorState, parentId: string) {
    const parent = findNode(state.document, parentId);
    if (!parent) {
        return [];
    }

    return registry
        .all()
        .filter((definition) => definition.type !== 'reusable.instance' && engine.canAcceptChild(state.document, parent.id, definition.type));
}

function selectInsertedNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    return {
        ...state,
        selectedNodeId: nodeId,
        insertionTarget: null,
        draggedNodeId: null,
        dropTarget: null,
    };
}
