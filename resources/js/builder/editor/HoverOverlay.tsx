interface HoverOverlayProps {
    nodeId: string;
}

export function HoverOverlay({ nodeId }: HoverOverlayProps) {
    return (
        <span
            aria-hidden="true"
            contentEditable={false}
            className="outline-primary/60 pointer-events-none absolute inset-0 z-10 rounded-[3px] outline outline-1 outline-dashed"
            data-builder-hover-for={nodeId}
        />
    );
}
