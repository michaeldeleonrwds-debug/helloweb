import type { BuilderComponentNode, BuilderPageDocument } from '../document';
import type { TreeInsertPosition } from '../engine/tree-position';

export interface EditorDropTarget {
    parentId: string;
    position: TreeInsertPosition;
}

export interface BuilderEditorState {
    document: BuilderPageDocument;
    selectedNodeId: string | null;
    hoveredNodeId: string | null;
    editingNodeId: string | null;
    insertionTarget: EditorDropTarget | null;
    draggedNodeId: string | null;
    dropTarget: EditorDropTarget | null;
}

export function createEditorState(document: BuilderPageDocument): BuilderEditorState {
    return {
        document: cloneDocument(document),
        selectedNodeId: null,
        hoveredNodeId: null,
        editingNodeId: null,
        insertionTarget: null,
        draggedNodeId: null,
        dropTarget: null,
    };
}

export function setDocument(state: BuilderEditorState, document: BuilderPageDocument): BuilderEditorState {
    const nextDocument = cloneDocument(document);

    return {
        document: nextDocument,
        selectedNodeId: state.selectedNodeId && findNode(nextDocument, state.selectedNodeId) ? state.selectedNodeId : null,
        hoveredNodeId: state.hoveredNodeId && findNode(nextDocument, state.hoveredNodeId) ? state.hoveredNodeId : null,
        editingNodeId: state.editingNodeId && findNode(nextDocument, state.editingNodeId) ? state.editingNodeId : null,
        insertionTarget: state.insertionTarget && findNode(nextDocument, state.insertionTarget.parentId) ? state.insertionTarget : null,
        draggedNodeId: state.draggedNodeId && findNode(nextDocument, state.draggedNodeId) ? state.draggedNodeId : null,
        dropTarget: state.dropTarget && findNode(nextDocument, state.dropTarget.parentId) ? state.dropTarget : null,
    };
}

export function selectNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    if (!findNode(state.document, nodeId) || state.document.root.id === nodeId) {
        return {
            ...state,
            selectedNodeId: null,
        };
    }

    return {
        ...state,
        selectedNodeId: nodeId,
    };
}

export function clearSelection(state: BuilderEditorState): BuilderEditorState {
    return {
        ...state,
        selectedNodeId: null,
    };
}

export function hoverNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    if (!findNode(state.document, nodeId) || state.document.root.id === nodeId) {
        return {
            ...state,
            hoveredNodeId: null,
        };
    }

    return {
        ...state,
        hoveredNodeId: nodeId,
    };
}

export function clearHover(state: BuilderEditorState): BuilderEditorState {
    return {
        ...state,
        hoveredNodeId: null,
    };
}

export function startInlineEdit(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    return findNode(state.document, nodeId) ? { ...state, editingNodeId: nodeId, selectedNodeId: nodeId } : state;
}

export function endInlineEdit(state: BuilderEditorState): BuilderEditorState {
    return { ...state, editingNodeId: null };
}

export function getSelectedNode(state: BuilderEditorState): BuilderComponentNode | null {
    return state.selectedNodeId ? findNode(state.document, state.selectedNodeId) : null;
}

export function getHoveredNode(state: BuilderEditorState): BuilderComponentNode | null {
    return state.hoveredNodeId ? findNode(state.document, state.hoveredNodeId) : null;
}

export function findNode(document: BuilderPageDocument, nodeId: string): BuilderComponentNode | null {
    return findNodeInTree(document.root, nodeId);
}

function findNodeInTree(node: BuilderComponentNode, nodeId: string): BuilderComponentNode | null {
    if (node.id === nodeId) {
        return node;
    }

    for (const child of node.children) {
        const found = findNodeInTree(child, nodeId);

        if (found) {
            return found;
        }
    }

    return null;
}

function cloneDocument(document: BuilderPageDocument): BuilderPageDocument {
    return structuredClone(document);
}
