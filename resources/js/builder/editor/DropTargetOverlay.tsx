interface DropTargetOverlayProps {
    nodeId: string;
    label?: string;
    mode?: 'append' | 'before' | 'after';
}

export function DropTargetOverlay({ nodeId, label = 'Drop here', mode = 'append' }: DropTargetOverlayProps) {
    if (mode === 'before') {
        return (
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 left-0 right-0 z-40 flex items-center"
                data-builder-drop-indicator-for={nodeId}
            >
                <span className="size-2 rounded-full bg-blue-600 ring-2 ring-white shadow-sm -ml-1 shrink-0" />
                <span className="h-0.5 w-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                <span className="absolute -top-5 left-2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm whitespace-nowrap">
                    Before {label}
                </span>
            </span>
        );
    }

    if (mode === 'after') {
        return (
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 left-0 right-0 z-40 flex items-center"
                data-builder-drop-indicator-for={nodeId}
            >
                <span className="size-2 rounded-full bg-blue-600 ring-2 ring-white shadow-sm -ml-1 shrink-0" />
                <span className="h-0.5 w-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                <span className="absolute -top-5 left-2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm whitespace-nowrap">
                    After {label}
                </span>
            </span>
        );
    }

    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[3px] border-2 border-dashed border-blue-500 bg-blue-500/10 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]"
            data-builder-drop-indicator-for={nodeId}
        >
            <span className="absolute -top-5 left-0 rounded-t bg-blue-600 px-1.5 py-0.5 text-[10px] leading-4 font-medium text-white shadow-sm">
                Drop into {label}
            </span>
        </span>
    );
}
