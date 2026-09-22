interface DropTargetOverlayProps {
    nodeId: string;
    label?: string;
}

export function DropTargetOverlay({ nodeId, label = 'Drop here' }: DropTargetOverlayProps) {
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[3px] border-2 border-dashed border-sky-400 bg-sky-400/10 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)]"
            data-builder-drop-indicator-for={nodeId}
        >
            <span className="absolute -top-5 left-0 rounded-t-md bg-sky-500 px-1.5 py-0.5 text-[10px] leading-4 font-medium text-white shadow-sm">
                Drop into {label}
            </span>
        </span>
    );
}
