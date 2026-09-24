import {
    ChevronRight,
    FoldVertical,
    GripVertical,
    Lock,
    Search,
    UnfoldVertical,
    X,
} from 'lucide-react';
import type { DragEvent } from 'react';
import { useMemo, useState } from 'react';

import type { BuilderComponentNode, BuilderPageDocument } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';
import { getComponentVisual } from './component-icons';

export interface BuilderLayersPanelProps {
    document: BuilderPageDocument;
    registry: ComponentRegistry;
    selectedNodeId: string | null;
    dropTargetId?: string | null;
    onSelect: (nodeId: string) => void;
    onStartDrag?: (nodeId: string) => void;
    onDragOverNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onDropNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onEndDrag?: () => void;
    canDropOnNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => boolean;
    showHeader?: boolean;
    className?: string;
}

export function BuilderLayersPanel({
    document,
    registry,
    selectedNodeId,
    dropTargetId,
    onSelect,
    onStartDrag,
    onDragOverNode,
    onDropNode,
    onEndDrag,
    canDropOnNode,
    showHeader = false,
    className = '',
}: BuilderLayersPanelProps) {
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [filterQuery, setFilterQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    // Count total elements in tree
    const totalCount = useMemo(() => {
        let count = 0;
        const traverse = (node: BuilderComponentNode) => {
            count += 1;
            node.children.forEach(traverse);
        };
        document.root.children.forEach(traverse);
        return count;
    }, [document]);

    // Gather all node IDs with children for expand/collapse all
    const parentNodeIds = useMemo(() => {
        const ids: string[] = [];
        const traverse = (node: BuilderComponentNode) => {
            if (node.children.length > 0) ids.push(node.id);
            node.children.forEach(traverse);
        };
        document.root.children.forEach(traverse);
        return ids;
    }, [document]);

    const handleCollapseAll = () => {
        setCollapsedIds(new Set(parentNodeIds));
    };

    const handleExpandAll = () => {
        setCollapsedIds(new Set());
    };

    const toggleNodeExpanded = (nodeId: string) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    return (
        <section className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-card text-card-foreground ${className}`} aria-label="Layers">
            {/* Header */}
            {showHeader ? (
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tracking-tight text-foreground">Layers</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {totalCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setSearchOpen((v) => !v)}
                            className={`flex size-7 items-center justify-center rounded-md transition ${
                                searchOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            title="Filter layers"
                        >
                            <Search className="size-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleCollapseAll}
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Collapse all"
                        >
                            <FoldVertical className="size-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleExpandAll}
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Expand all"
                        >
                            <UnfoldVertical className="size-3.5" />
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Quick Filter Search Bar */}
            {searchOpen || filterQuery ? (
                <div className="shrink-0 border-b border-border p-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-2 left-2.5 size-3 text-muted-foreground" />
                        <input
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Filter layers by name or text..."
                            className="h-7 w-full rounded-md border border-input bg-muted/50 pr-7 pl-7 text-xs text-foreground placeholder:text-muted-foreground transition outline-none focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary/20"
                            autoFocus
                        />
                        {filterQuery ? (
                            <button
                                type="button"
                                onClick={() => setFilterQuery('')}
                                className="absolute top-1.5 right-2 flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3" />
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {/* Tree Nodes List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
                {document.root.children.length === 0 ? (
                    <div className="flex min-h-32 flex-col items-center justify-center gap-1.5 px-4 text-center text-xs text-muted-foreground">
                        <span>No elements on this page yet.</span>
                        <span className="text-[11px] text-muted-foreground/70">Add elements from the Elements tab.</span>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {document.root.children.map((node) => (
                            <LayerTreeNode
                                key={node.id}
                                node={node}
                                registry={registry}
                                selectedNodeId={selectedNodeId}
                                dropTargetId={dropTargetId}
                                onSelect={onSelect}
                                onStartDrag={onStartDrag}
                                onDragOverNode={onDragOverNode}
                                onDropNode={onDropNode}
                                onEndDrag={onEndDrag}
                                canDropOnNode={canDropOnNode}
                                collapsedIds={collapsedIds}
                                onToggleExpanded={toggleNodeExpanded}
                                filterQuery={filterQuery.trim().toLowerCase()}
                                depth={0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BuilderLayersPanel;

interface LayerTreeNodeProps {
    node: BuilderComponentNode;
    registry: ComponentRegistry;
    selectedNodeId: string | null;
    dropTargetId?: string | null;
    onSelect: (nodeId: string) => void;
    onStartDrag?: (nodeId: string) => void;
    onDragOverNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onDropNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onEndDrag?: () => void;
    canDropOnNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => boolean;
    collapsedIds: Set<string>;
    onToggleExpanded: (nodeId: string) => void;
    filterQuery: string;
    depth: number;
}

function LayerTreeNode({
    node,
    registry,
    selectedNodeId,
    dropTargetId,
    onSelect,
    onStartDrag,
    onDragOverNode,
    onDropNode,
    onEndDrag,
    canDropOnNode,
    collapsedIds,
    onToggleExpanded,
    filterQuery,
    depth,
}: LayerTreeNodeProps) {
    const definition = registry.get(node.type);
    const hasChildren = node.children.length > 0;
    const isExpanded = !collapsedIds.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isDropTarget = dropTargetId === node.id;

    // Component-specific visual
    const visual = getComponentVisual(node.type);

    // Text preview snippet for quick scanning
    const previewSnippet = useMemo(() => {
        if (typeof node.props?.text === 'string' && node.props.text.trim()) {
            return `"${node.props.text.trim()}"`;
        }
        if (typeof node.props?.title === 'string' && node.props.title.trim()) {
            return `"${node.props.title.trim()}"`;
        }
        if (typeof node.props?.alt === 'string' && node.props.alt.trim()) {
            return `"${node.props.alt.trim()}"`;
        }
        if (node.type === 'code.customcode') {
            return 'Code snippet';
        }
        return null;
    }, [node.props, node.type]);

    // Check filter match
    const matchesFilter = useMemo(() => {
        if (!filterQuery) return true;
        const nameMatch = definition.name.toLowerCase().includes(filterQuery);
        const snippetMatch = previewSnippet?.toLowerCase().includes(filterQuery);
        const typeMatch = node.type.toLowerCase().includes(filterQuery);
        return nameMatch || snippetMatch || typeMatch;
    }, [filterQuery, definition.name, previewSnippet, node.type]);

    const modeForEvent = (event: DragEvent<HTMLElement>): 'append' | 'before' | 'after' => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const relativeY = event.clientY - bounds.top;
        if (relativeY < bounds.height * 0.25) return 'before';
        if (relativeY > bounds.height * 0.75) return 'after';
        return 'append';
    };

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        if (!onDropNode) return;
        const mode = modeForEvent(event);
        if (canDropOnNode && !canDropOnNode(node.id, mode)) return;

        event.preventDefault();
        onDragOverNode?.(node.id, mode);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (!onDropNode) return;
        const mode = modeForEvent(event);
        if (canDropOnNode && !canDropOnNode(node.id, mode)) return;

        event.preventDefault();
        event.stopPropagation();
        onDropNode(node.id, mode);
    };

    if (filterQuery && !matchesFilter && !hasChildren) {
        return null;
    }

    return (
        <div className="relative">
            <div
                className={`group relative flex h-7 items-center gap-1.5 rounded-md px-1 transition-all ${
                    isSelected
                        ? 'bg-primary/10 text-primary font-medium shadow-2xs before:absolute before:top-1 before:bottom-1 before:left-0 before:w-0.5 before:rounded-r before:bg-primary'
                        : 'text-foreground hover:bg-muted/60'
                } ${isDropTarget ? 'bg-primary/15 ring-1 ring-primary' : ''}`}
                style={{ paddingLeft: `${depth * 14 + 6}px` }}
                draggable={Boolean(onStartDrag && node.metadata?.locked !== true)}
                onDragStart={(event) => {
                    event.stopPropagation();
                    onStartDrag?.(node.id);
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={onEndDrag}
            >
                {/* Expand / Collapse Chevron */}
                <button
                    type="button"
                    className="flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground/70 transition hover:text-foreground"
                    aria-label={isExpanded ? `Collapse ${definition.name}` : `Expand ${definition.name}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpanded(node.id);
                    }}
                >
                    {hasChildren ? (
                        <ChevronRight className={`size-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
                    ) : (
                        <span className="size-3" />
                    )}
                </button>

                {/* Node Click Target: Icon + Name + Preview Text */}
                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-left"
                    data-layer-node-id={node.id}
                    onClick={() => onSelect(node.id)}
                >
                    {/* Component-Specific Colored Icon */}
                    <span className={`shrink-0 ${isSelected ? 'text-primary' : visual.textColor}`}>
                        {visual.icon('size-3.5')}
                    </span>

                    {/* Node Display Name */}
                    <span className={`truncate text-xs ${isSelected ? 'font-semibold text-primary' : 'font-medium text-foreground'}`}>
                        {definition.name}
                    </span>

                    {/* Preview Text Snippet (Google / Figma Style) */}
                    {previewSnippet ? (
                        <span className="truncate text-[10px] text-muted-foreground/70 italic">
                            {previewSnippet}
                        </span>
                    ) : null}
                </button>

                {/* Node Status / Badges */}
                {node.metadata?.locked === true ? <Lock className="size-3 shrink-0 text-muted-foreground" /> : null}

                {/* Drag Handle on hover */}
                <GripVertical className="size-3 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {/* Children with visual depth guide line */}
            {isExpanded && hasChildren ? (
                <div className="relative space-y-0.5" style={{ marginLeft: `${depth * 14 + 13}px` }}>
                    <div className="absolute top-0 bottom-1 left-0 w-px bg-border/40" />
                    <div className="pl-1">
                        {node.children.map((child) => (
                            <LayerTreeNode
                                key={child.id}
                                node={child}
                                registry={registry}
                                selectedNodeId={selectedNodeId}
                                dropTargetId={dropTargetId}
                                onSelect={onSelect}
                                onStartDrag={onStartDrag}
                                onDragOverNode={onDragOverNode}
                                onDropNode={onDropNode}
                                onEndDrag={onEndDrag}
                                canDropOnNode={canDropOnNode}
                                collapsedIds={collapsedIds}
                                onToggleExpanded={onToggleExpanded}
                                filterQuery={filterQuery}
                                depth={0}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
