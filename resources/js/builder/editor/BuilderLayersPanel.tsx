import { ChevronDown, ChevronRight, FileText, Folder, GripVertical } from 'lucide-react';
import { useState } from 'react';

import type { BuilderComponentNode, BuilderPageDocument } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';

interface BuilderLayersPanelProps {
    document: BuilderPageDocument;
    registry: ComponentRegistry;
    selectedNodeId: string | null;
    onSelect: (nodeId: string) => void;
}

export function BuilderLayersPanel({ document, registry, selectedNodeId, onSelect }: BuilderLayersPanelProps) {
    return (
        <section className="border-border flex h-1/2 min-h-0 shrink-0 flex-col border-t" aria-label="Layers">
            <div className="flex h-11 shrink-0 items-center justify-between px-4">
                <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Structure</p>
                    <h2 className="mt-0.5 text-xs font-semibold">Layers</h2>
                </div>
                <Folder className="text-muted-foreground size-4" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {document.root.children.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-5 text-center text-xs">No elements on this page yet.</div>
                ) : (
                    document.root.children.map((node) => (
                        <LayerNode key={node.id} node={node} registry={registry} selectedNodeId={selectedNodeId} onSelect={onSelect} depth={0} />
                    ))
                )}
            </div>
        </section>
    );
}

function LayerNode({
    node,
    registry,
    selectedNodeId,
    onSelect,
    depth,
}: {
    node: BuilderComponentNode;
    registry: ComponentRegistry;
    selectedNodeId: string | null;
    onSelect: (nodeId: string) => void;
    depth: number;
}) {
    const [expanded, setExpanded] = useState(true);
    const definition = registry.get(node.type);
    const hasChildren = node.children.length > 0;
    return (
        <div>
            <div
                className={`group flex items-center gap-1 rounded-md px-1.5 py-1 transition ${selectedNodeId === node.id ? 'bg-foreground text-background' : 'text-foreground hover:bg-muted'}`}
                style={{ paddingLeft: `${depth * 14 + 6}px` }}
            >
                <button
                    type="button"
                    className="flex size-5 items-center justify-center text-current/60"
                    aria-label={expanded ? `Collapse ${definition.name}` : `Expand ${definition.name}`}
                    onClick={() => setExpanded((value) => !value)}
                >
                    {hasChildren ? expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" /> : <span className="size-3" />}
                </button>
                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    data-layer-node-id={node.id}
                    onClick={() => onSelect(node.id)}
                >
                    <span className="text-current/60">
                        {node.type.startsWith('layout.') ? <Folder className="size-3.5" /> : <FileText className="size-3.5" />}
                    </span>
                    <span className="truncate text-xs font-medium">{definition.name}</span>
                </button>
                <GripVertical className="size-3 text-current/30 opacity-0 transition group-hover:opacity-100" />
            </div>
            {expanded && hasChildren ? (
                <div>
                    {node.children.map((child) => (
                        <LayerNode
                            key={child.id}
                            node={child}
                            registry={registry}
                            selectedNodeId={selectedNodeId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
