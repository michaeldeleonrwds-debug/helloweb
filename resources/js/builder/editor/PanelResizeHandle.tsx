import type { MouseEvent as ReactMouseEvent } from 'react';

export interface PanelResizeHandleProps {
    direction: 'left' | 'right';
    onResize: (delta: number) => void;
    onReset?: () => void;
}

export function PanelResizeHandle({ direction, onResize, onReset }: PanelResizeHandleProps) {
    const handleMouseDown = (e: ReactMouseEvent) => {
        e.preventDefault();
        let lastX = e.clientX;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - lastX;
            lastX = moveEvent.clientX;
            onResize(direction === 'right' ? deltaX : -deltaX);
        };

        const handleMouseUp = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={handleMouseDown}
            onDoubleClick={onReset}
            className="group relative z-10 hidden w-1.5 shrink-0 cursor-col-resize select-none items-center justify-center transition-all hover:w-2 hover:bg-primary/15 active:w-2 active:bg-primary/30 lg:flex"
            title="Drag to resize panel (Double-click to reset)"
        >
            <div className="h-8 w-0.5 rounded-full bg-border/80 transition-all group-hover:h-12 group-hover:bg-primary group-active:h-16 group-active:bg-primary" />
        </div>
    );
}

export default PanelResizeHandle;
