import { createElement, type DragEvent, type FocusEvent, type MouseEvent, type ReactNode } from 'react';

import type { ComponentRegistry } from '../registry/component-registry';
import type { RenderResult } from '../renderer/render-result';
import { DropTargetOverlay } from './DropTargetOverlay';
import { HoverOverlay } from './HoverOverlay';
import { NodeActionsOverlay } from './NodeActionsOverlay';
import { getRenderResultNodeId, hasVisibleCodeContent, renderStyleToReactStyle } from './render-result-utils';
import { SelectionOverlay } from './SelectionOverlay';

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
    dropTargetMode?: 'append' | 'before' | 'after' | null;
    componentRegistry?: ComponentRegistry;
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
    dropTargetMode,
    componentRegistry,
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
}: CanvasNodeProps) {
    if (result.tag === null) {
        return <>{result.children.map((child, index) => renderChild(child, index))}</>;
    }

    const nodeId = getRenderResultNodeId(result);
    const componentType = result.attributes['data-builder-type'];
    const locked = Boolean(nodeId && isNodeLocked?.(nodeId));
    const componentName =
        componentType && componentRegistry?.has(componentType as `${string}.${string}`)
            ? componentRegistry.get(componentType as `${string}.${string}`).name
            : undefined;
    const children = result.children.map((child, index) => renderChild(child, index));
    const style = renderStyleToReactStyle(result.styles);
    const editingText = Boolean(nodeId && editingNodeId === nodeId && result.text !== undefined);
    const attributes = {
        ...reactAttributes(result.attributes),
        'data-builder-node-id': nodeId ?? undefined,
        'data-builder-drop-target': nodeId && dropTargetId === nodeId ? 'true' : undefined,
    };

    if (nodeId) {
        style.position = style.position ?? 'relative';
        style.cursor = style.cursor ?? 'default';
        if (dropTargetId === nodeId) style.outline = '2px dashed #2563eb';
    }

    const showCodePlaceholder = componentType === 'code.customcode' && !hasVisibleCodeContent(result.html ?? '');

    if (showCodePlaceholder) {
        style.position = style.position ?? 'relative';
        style.display = 'block';
        style.minHeight = style.minHeight ?? '56px';
    }

    const canAcceptChildren = Boolean(
        componentType &&
            componentRegistry?.has(componentType as `${string}.${string}`) &&
            componentRegistry.get(componentType as `${string}.${string}`)?.capabilities?.canAcceptChildren,
    );

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        if (!nodeId || !onDropNode) return;
        const target = resolveDropTarget(event);
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        onDragOverNode?.(target.nodeId, target.mode);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (!nodeId || !onDropNode) return;
        const target = resolveDropTarget(event);
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        onDropNode(target.nodeId, target.mode);
    };

    const resolveDropTarget = (event: DragEvent<HTMLElement>): { nodeId: string; mode: 'append' | 'before' | 'after' } | null => {
        if (!nodeId) return null;

        const bounds = event.currentTarget.getBoundingClientRect();
        const relativeY = event.clientY - bounds.top;

        // If this element cannot accept children (e.g. Button, Heading, Text, Link, Image),
        // drops onto it are always positional (before or after it in its parent container).
        if (!canAcceptChildren) {
            const mode = relativeY < bounds.height * 0.5 ? 'before' : 'after';
            if (!canDropOnNode || canDropOnNode(nodeId, mode)) {
                return { nodeId, mode };
            }
            const oppositeMode = mode === 'before' ? 'after' : 'before';
            if (canDropOnNode && canDropOnNode(nodeId, oppositeMode)) {
                return { nodeId, mode: oppositeMode };
            }
            return null;
        }

        // If this element can accept children (e.g. Column, Container, Flex, Row, Section):
        // Top 20% can be 'before', bottom 20% can be 'after', and middle 60% is 'append'
        let mode: 'append' | 'before' | 'after' = 'append';
        if (relativeY < bounds.height * 0.2) {
            mode = 'before';
        } else if (relativeY > bounds.height * 0.8) {
            mode = 'after';
        }

        if (canDropOnNode && canDropOnNode(nodeId, mode)) {
            return { nodeId, mode };
        }

        // If 'before' or 'after' failed on a container, try 'append' into it
        if (mode !== 'append' && canDropOnNode && canDropOnNode(nodeId, 'append')) {
            return { nodeId, mode: 'append' };
        }

        // Check if there is a child target inside that can accept the drop
        const childTarget = childDropTargetForEvent(event);
        if (childTarget && canDropOnNode) {
            if (canDropOnNode(childTarget, 'append')) {
                return { nodeId: childTarget, mode: 'append' };
            }
            if (canDropOnNode(childTarget, 'after')) {
                return { nodeId: childTarget, mode: 'after' };
            }
            if (canDropOnNode(childTarget, 'before')) {
                return { nodeId: childTarget, mode: 'before' };
            }
        }

        // Fallback: if canDropOnNode allows append
        if (!canDropOnNode || canDropOnNode(nodeId, 'append')) {
            return { nodeId, mode: 'append' };
        }

        return null;
    };

    const childDropTargetForEvent = (event: DragEvent<HTMLElement>): string | null => {
        const directChildren = Array.from(event.currentTarget.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement && child.dataset.builderNodeId !== undefined,
        );
        if (directChildren.length === 0) return null;

        const containingChild = directChildren.find((child) => {
            const bounds = child.getBoundingClientRect();
            return event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        });
        if (containingChild?.dataset.builderNodeId) return containingChild.dataset.builderNodeId;

        return (
            directChildren
                .map((child) => {
                    const bounds = child.getBoundingClientRect();
                    const centerX = bounds.left + bounds.width / 2;
                    return { nodeId: child.dataset.builderNodeId ?? null, distance: Math.abs(event.clientX - centerX) };
                })
                .filter((candidate): candidate is { nodeId: string; distance: number } => candidate.nodeId !== null)
                .sort((left, right) => left.distance - right.distance)[0]?.nodeId ?? null
        );
    };

    const overlays: ReactNode[] = [];

    if (!editingText && nodeId && hoveredNodeId === nodeId && selectedNodeId !== nodeId) {
        overlays.push(<HoverOverlay key="hover" nodeId={nodeId} />);
    }

    if (!editingText && nodeId && selectedNodeId === nodeId) {
        overlays.push(<SelectionOverlay key="selection" nodeId={nodeId} label={componentName} />);
    }

    if (!editingText && nodeId && dropTargetId === nodeId) {
        overlays.push(<DropTargetOverlay key="drop-target" nodeId={nodeId} label={componentName} mode={dropTargetMode ?? undefined} />);
    }

    if (!editingText && nodeId && (selectedNodeId === nodeId || (selectedNodeId === null && hoveredNodeId === nodeId))) {
        overlays.push(
            <NodeActionsOverlay
                key="actions"
                nodeId={nodeId}
                label={componentName}
                type={componentType}
                onDuplicate={onDuplicateNode}
                onRemove={onRemoveNode}
                onMove={onMoveNode}
                canMove={canMoveNode}
                onCopy={onCopyNode}
                onPaste={onPasteNode}
                canPaste={canPasteNode}
                onToggleVisibility={onToggleVisibility}
                hidden={isNodeHidden?.(nodeId)}
                onToggleLock={onToggleLock}
                locked={isNodeLocked?.(nodeId)}
                onSetFlexDirection={onSetFlexDirection}
                onSetFlexStyle={onSetFlexStyle}
                onToggleFullWidth={onToggleFullWidth}
                fullWidth={isNodeFullWidth?.(nodeId)}
                onAddColumn={onAddColumn}
                onAddElement={onAddElement}
                onOpenMediaManager={onOpenMediaManager}
                onEdit={onEditNode}
            />,
        );
    }

    const elementProps = {
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
        draggable: Boolean(nodeId && onStartDrag && !locked),
        contentEditable: Boolean(nodeId && !locked && editingNodeId === nodeId && onInlineTextChange && result.text !== undefined),
        suppressContentEditableWarning: true,
        onDoubleClick:
            nodeId && !locked && onStartInlineEdit && result.text !== undefined
                ? (event: MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      onStartInlineEdit(nodeId);
                  }
                : undefined,
        onBlur:
            nodeId && !locked && editingNodeId === nodeId && onInlineTextChange && result.text !== undefined
                ? (event: FocusEvent<HTMLElement>) => {
                      const text = editableTextContent(event.currentTarget);
                      if (text !== result.text) onInlineTextChange(nodeId, text);
                      onEndInlineEdit?.();
                  }
                : undefined,
        onDragStart:
            nodeId && !locked && onStartDrag
                ? (event: DragEvent<HTMLElement>) => {
                      event.stopPropagation();
                      event.dataTransfer.setData('text/plain', nodeId);
                      event.dataTransfer.setData('application/x-builder-node-id', nodeId);
                      event.dataTransfer.effectAllowed = 'move';
                      onStartDrag(nodeId);
                  }
                : undefined,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
        onDragEnd: onEndDrag,
    };

    if (result.tag === 'img') {
        return createElement(
            'div',
            { ...elementProps, style: { position: 'relative', display: 'inline-block' } },
            createElement('img', { ...attributes, style }),
            ...overlays,
        );
    }

    const overlayChildren = overlays.map((overlay, index) => (
        <span key={`builder-overlay-${index}`} data-builder-overlay="true" contentEditable={false} suppressContentEditableWarning>
            {overlay}
        </span>
    ));
    const htmlChild = result.html ? <span key="builder-html-content" dangerouslySetInnerHTML={{ __html: result.html }} /> : null;
    const codePlaceholder = showCodePlaceholder ? (
        <span
            key="builder-code-placeholder"
            aria-hidden="true"
            contentEditable={false}
            suppressContentEditableWarning
            className="border-primary/40 bg-muted/50 text-muted-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[3px] border border-dashed text-[10px] font-medium"
            data-builder-code-placeholder="true"
        >
            Custom code
        </span>
    ) : null;
    const elementChildren = [htmlChild ?? result.text, ...children, ...overlayChildren, codePlaceholder];

    return createElement(result.tag, elementProps, ...elementChildren);

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
        );
    }
}

function editableTextContent(element: HTMLElement): string {
    const text: string[] = [];

    element.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            text.push(child.textContent ?? '');
            return;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const childElement = child as HTMLElement;
        if (childElement.closest('[data-builder-overlay="true"]')) {
            return;
        }

        text.push(childElement.textContent ?? '');
    });

    return text.join('');
}

function reactAttributes(attributes: Record<string, string>): Record<string, string> {
    const nextAttributes = { ...attributes };
    if (nextAttributes.class) {
        nextAttributes.className = nextAttributes.class;
        delete nextAttributes.class;
    }

    return nextAttributes;
}
export default CanvasNode;
