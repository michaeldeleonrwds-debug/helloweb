import { createElement, type DragEvent, type FocusEvent, type MouseEvent, type ReactNode } from 'react';

import type { ComponentRegistry } from '../registry/component-registry';
import type { RenderResult } from '../renderer/render-result';
import { HoverOverlay } from './HoverOverlay';
import { SelectionOverlay } from './SelectionOverlay';
import { getRenderResultNodeId, renderStyleToReactStyle } from './render-result-utils';

interface CanvasNodeProps {
    result: RenderResult;
    selectedNodeId: string | null;
    hoveredNodeId: string | null;
    onSelectNode: (nodeId: string) => void;
    onHoverNode: (nodeId: string) => void;
    onClearHover: (nodeId: string) => void;
    onStartDrag?: (nodeId: string) => void;
    onDropNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onDragOverNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    canDropOnNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => boolean;
    onEndDrag?: () => void;
    dropTargetId?: string | null;
    componentRegistry?: ComponentRegistry;
    onInlineTextChange?: (nodeId: string, text: string) => void;
    editingNodeId?: string | null;
    onStartInlineEdit?: (nodeId: string) => void;
    onEndInlineEdit?: () => void;
    onInsertContextual?: (parentId: string, type: `${string}.${string}`) => void;
    onOpenElementPicker?: (parentId: string) => void;
}

export function CanvasNode({
    result,
    selectedNodeId,
    hoveredNodeId,
    onSelectNode,
    onHoverNode,
    onClearHover,
    onStartDrag,
    onDropNode,
    onDragOverNode,
    canDropOnNode,
    onEndDrag,
    dropTargetId,
    componentRegistry,
    onInlineTextChange,
    editingNodeId,
    onStartInlineEdit,
    onEndInlineEdit,
    onInsertContextual,
    onOpenElementPicker,
}: CanvasNodeProps) {
    if (result.tag === null) {
        return <>{result.children.map((child, index) => renderChild(child, index))}</>;
    }

    const nodeId = getRenderResultNodeId(result);
    const componentType = result.attributes['data-builder-type'];
    const componentName =
        componentType && componentRegistry?.has(componentType as `${string}.${string}`)
            ? componentRegistry.get(componentType as `${string}.${string}`).name
            : undefined;
    const children = result.children.map((child, index) => renderChild(child, index));
    const style = renderStyleToReactStyle(result.styles);
    const attributes = {
        ...result.attributes,
        'data-builder-node-id': nodeId ?? undefined,
        'data-builder-drop-target': nodeId && dropTargetId === nodeId ? 'true' : undefined,
    };

    if (nodeId) {
        style.position = style.position ?? 'relative';
        style.cursor = style.cursor ?? 'default';
        if (dropTargetId === nodeId) style.outline = '2px dashed #2563eb';
    }

    const modeForEvent = (event: DragEvent<HTMLElement>): 'append' | 'before' | 'after' => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const relativeY = event.clientY - bounds.top;
        return relativeY < bounds.height * 0.25 ? 'before' : relativeY > bounds.height * 0.75 ? 'after' : 'append';
    };

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        if (!nodeId || !onDropNode) return;
        const mode = modeForEvent(event);
        if (canDropOnNode && !canDropOnNode(nodeId, mode)) return;
        event.preventDefault();
        onDragOverNode?.(nodeId, mode);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (!nodeId || !onDropNode) return;
        const mode = modeForEvent(event);
        if (canDropOnNode && !canDropOnNode(nodeId, mode)) return;
        event.preventDefault();
        onDropNode(nodeId, mode);
    };

    const overlays: ReactNode[] = [];
    const insertionZone = nodeId && onInsertContextual ? insertionZoneFor(componentType) : null;

    if (nodeId && hoveredNodeId === nodeId && selectedNodeId !== nodeId) {
        overlays.push(<HoverOverlay key="hover" nodeId={nodeId} />);
    }

    if (nodeId && selectedNodeId === nodeId) {
        overlays.push(<SelectionOverlay key="selection" nodeId={nodeId} label={componentName} />);
    }

    return createElement(
        result.tag,
        {
            ...attributes,
            style,
            onClick: nodeId
                ? (event: MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      onSelectNode(nodeId);
                  }
                : undefined,
            onMouseEnter: nodeId
                ? (event: MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      onHoverNode(nodeId);
                  }
                : undefined,
            onMouseLeave: nodeId
                ? (event: MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      onClearHover(nodeId);
                  }
                : undefined,
            draggable: Boolean(nodeId && onStartDrag),
             contentEditable: Boolean(nodeId && editingNodeId === nodeId && onInlineTextChange && result.text !== undefined),
             suppressContentEditableWarning: true,
             onDoubleClick: nodeId && onStartInlineEdit && result.text !== undefined ? (event: MouseEvent<HTMLElement>) => {
                 event.stopPropagation();
                 onStartInlineEdit(nodeId);
             } : undefined,
             onBlur:
                 nodeId && editingNodeId === nodeId && onInlineTextChange && result.text !== undefined
                    ? (event: FocusEvent<HTMLElement>) => {
                           const text = event.currentTarget.textContent ?? '';
                           if (text !== result.text) onInlineTextChange(nodeId, text);
                           onEndInlineEdit?.();
                      }
                    : undefined,
            onDragStart: nodeId && onStartDrag ? () => onStartDrag(nodeId) : undefined,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
            onDragEnd: onEndDrag,
        },
        result.text,
        ...children,
        insertionZone && nodeId ? (
            <button
                key="insert-zone"
                type="button"
                className="border-border text-muted-foreground hover:border-primary hover:text-foreground my-2 flex min-h-20 w-full items-center justify-center rounded-md border border-dashed bg-transparent text-sm font-medium transition"
                data-builder-insertion-zone={nodeId}
                onClick={(event: MouseEvent<HTMLElement>) => {
                    event.stopPropagation();
                    if (insertionZone.type === 'content.heading') onOpenElementPicker?.(nodeId);
                    else onInsertContextual?.(nodeId, insertionZone.type);
                }}
            >
                {insertionZone.label}
            </button>
        ) : null,
        ...overlays,
    );

    function renderChild(child: RenderResult, index: number) {
        return (
            <CanvasNode
                key={`${getRenderResultNodeId(child) ?? 'fragment'}-${index}`}
                result={child}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                onSelectNode={onSelectNode}
                onHoverNode={onHoverNode}
                onClearHover={onClearHover}
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
                onInsertContextual={onInsertContextual}
                onOpenElementPicker={onOpenElementPicker}
            />
        );
    }
}

function insertionZoneFor(componentType: string | undefined): { label: string; type: `${string}.${string}` } | null {
    if (componentType === 'layout.section') return { label: '+ Add Row', type: 'layout.row' };
    if (componentType === 'layout.row') return { label: '+ Add Column', type: 'layout.column' };
    if (componentType === 'layout.column') return { label: '+ Add Element', type: 'content.heading' };
    return null;
}
