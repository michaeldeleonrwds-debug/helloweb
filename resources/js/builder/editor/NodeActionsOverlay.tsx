import { Copy, Trash2 } from 'lucide-react';

interface NodeActionsOverlayProps {
    nodeId: string;
    label?: string;
    onDuplicate?: (nodeId: string) => void;
    onRemove?: (nodeId: string) => void;
}

export function NodeActionsOverlay({ nodeId, label, onDuplicate, onRemove }: NodeActionsOverlayProps) {
    return (
        <span
            className="bg-primary text-primary-foreground pointer-events-none absolute -top-7 right-0 z-40 flex items-center gap-1 rounded-t-md px-1 py-1 shadow-sm"
            data-builder-node-actions-for={nodeId}
        >
            {label ? <span className="px-1 text-[10px] leading-4 font-medium">{label}</span> : null}
            {onDuplicate ? (
                <button
                    type="button"
                    className="pointer-events-auto inline-flex size-5 items-center justify-center rounded hover:bg-white/20"
                    aria-label={`Duplicate ${label ?? 'element'}`}
                    title="Duplicate"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate(nodeId);
                    }}
                >
                    <Copy className="size-3" />
                </button>
            ) : null}
            {onRemove ? (
                <button
                    type="button"
                    className="pointer-events-auto inline-flex size-5 items-center justify-center rounded hover:bg-red-500/80"
                    aria-label={`Delete ${label ?? 'element'}`}
                    title="Delete"
                    onClick={(event) => {
                        event.stopPropagation();
                        onRemove(nodeId);
                    }}
                >
                    <Trash2 className="size-3" />
                </button>
            ) : null}
        </span>
    );
}
