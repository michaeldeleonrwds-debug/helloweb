import { Minus, Plus, Scan, ZoomIn } from 'lucide-react';

import type { BuilderBreakpoint } from '../document';

interface BuilderBottomBarProps {
    breakpoint: BuilderBreakpoint;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
}

export function BuilderBottomBar({ breakpoint, zoom, onZoomChange, onBreakpointChange }: BuilderBottomBarProps) {
    return (
        <footer className="border-border bg-card text-muted-foreground flex h-11 shrink-0 items-center justify-between border-t px-3 text-xs">
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className="hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition"
                    aria-label="Zoom out"
                    onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                >
                    <Minus className="size-3.5" />
                </button>
                <button
                    type="button"
                    className="hover:bg-muted hover:text-foreground min-w-12 rounded-md px-2 py-1 font-medium tabular-nums transition"
                    onClick={() => onZoomChange(100)}
                >
                    {zoom}%
                </button>
                <button
                    type="button"
                    className="hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition"
                    aria-label="Zoom in"
                    onClick={() => onZoomChange(Math.min(120, zoom + 10))}
                >
                    <Plus className="size-3.5" />
                </button>
                <button
                    type="button"
                    className="hover:bg-muted hover:text-foreground ml-1 hidden size-7 items-center justify-center rounded-md transition sm:inline-flex"
                    aria-label="Fit canvas"
                    onClick={() => onZoomChange(85)}
                >
                    <Scan className="size-3.5" />
                </button>
            </div>
            <div className="border-border bg-muted/40 flex items-center gap-1 rounded-md border p-0.5 md:hidden">
                {(['desktop', 'tablet', 'mobile'] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={`rounded px-2 py-1 text-[10px] capitalize ${breakpoint === option ? 'bg-background text-foreground shadow-sm' : ''}`}
                        onClick={() => onBreakpointChange(option)}
                    >
                        {option[0]}
                    </button>
                ))}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
                <ZoomIn className="size-3.5" />
                <span>Canvas viewport</span>
                <span className="text-foreground font-medium capitalize">{breakpoint}</span>
            </div>
        </footer>
    );
}
