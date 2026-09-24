interface SelectionOverlayProps {
    nodeId: string;
    label?: string;
}

export function SelectionOverlay({ nodeId, label }: SelectionOverlayProps) {
    return (
        <span
            aria-hidden="true"
            className="outline-primary pointer-events-none absolute inset-0 z-20 rounded-[3px] outline-2"
            data-builder-selection-for={nodeId}
        >
            {label ? (
                <span className="bg-primary text-primary-foreground absolute -top-6 left-0 rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium tracking-wide capitalize shadow-xs">
                    {label}
                </span>
            ) : null}
        </span>
    );
}
