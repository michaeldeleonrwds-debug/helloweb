import type { BuilderPageDocument } from '../document';
import type { BuilderEditorState, EditorDropTarget } from './editor-state';
import { clearHover, clearSelection, endInlineEdit, hoverNode, selectNode, setDocument, startInlineEdit } from './editor-state';

export type BuilderEditorAction =
    | { type: 'selectNode'; nodeId: string }
    | { type: 'clearSelection' }
    | { type: 'hoverNode'; nodeId: string }
    | { type: 'clearHover' }
    | { type: 'startInlineEdit'; nodeId: string }
    | { type: 'endInlineEdit' }
    | { type: 'setDocument'; document: BuilderPageDocument }
    | { type: 'setInsertionTarget'; target: EditorDropTarget | null }
    | { type: 'startDrag'; nodeId: string }
    | { type: 'startComponentDrag'; componentType: `${string}.${string}` }
    | { type: 'setDropTarget'; target: EditorDropTarget | null }
    | { type: 'clearDrag' }
    | { type: 'replaceState'; state: BuilderEditorState };

export function editorReducer(state: BuilderEditorState, action: BuilderEditorAction): BuilderEditorState {
    switch (action.type) {
        case 'selectNode':
            return selectNode(state, action.nodeId);
        case 'clearSelection':
            return clearSelection(state);
        case 'hoverNode':
            return hoverNode(state, action.nodeId);
        case 'clearHover':
            return clearHover(state);
        case 'startInlineEdit':
            return startInlineEdit(state, action.nodeId);
        case 'endInlineEdit':
            return endInlineEdit(state);
        case 'setDocument':
            return setDocument(state, action.document);
        case 'setInsertionTarget':
            return { ...state, insertionTarget: action.target };
        case 'startDrag':
            return { ...state, draggedNodeId: action.nodeId, draggedComponentType: null, dropTarget: null };
        case 'startComponentDrag':
            return { ...state, draggedNodeId: null, draggedComponentType: action.componentType, dropTarget: null };
        case 'setDropTarget':
            return { ...state, dropTarget: action.target };
        case 'clearDrag':
            return { ...state, draggedNodeId: null, draggedComponentType: null, dropTarget: null };
        case 'replaceState':
            return action.state;
    }
}
