import type { BuilderEditorState } from './editor-state';
import { clearHover, hoverNode, selectNode } from './editor-state';

export function selectCanvasNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    return selectNode(state, nodeId);
}

export function hoverCanvasNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    return hoverNode(state, nodeId);
}

export function leaveCanvasNode(state: BuilderEditorState, nodeId: string): BuilderEditorState {
    return state.hoveredNodeId === nodeId ? clearHover(state) : state;
}
