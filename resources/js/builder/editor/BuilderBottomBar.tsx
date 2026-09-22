import { Minus, Plus, Scan, ZoomIn } from 'lucide-react';

import type { BuilderBreakpoint } from '../document';

interface BuilderBottomBarProps {
    breakpoint: BuilderBreakpoint;
    zoom: number;
    viewportWidth: number;
    onZoomChange: (zoom: number) => void;
    onFitToWorkspace: () => void;
    onViewportWidthChange: (width: number) => void;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
}

const VIEWPORT_PRESETS = [1920, 1440, 1366, 1280, 1200, 1024, 768, 430, 390, 375, 360] as const;

export function BuilderBottomBar({
    breakpoint,
    zoom,
    viewportWidth,
    onZoomChange,
    onFitToWorkspace,
    onViewportWidthChange,
    onBreakpointChange,
}: BuilderBottomBarProps) {
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
                    aria-label="Fit to workspace"
                    title="Fit to workspace"
                    onClick={onFitToWorkspace}
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
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
                <ZoomIn className="size-3.5" />
                <span>Viewport</span>
                <select
                    className="border-border bg-background text-foreground h-7 rounded-md border px-2 text-xs"
                    value={VIEWPORT_PRESETS.includes(viewportWidth as (typeof VIEWPORT_PRESETS)[number]) ? String(viewportWidth) : 'custom'}
                    onChange={(event) => {
                        if (event.target.value !== 'custom') onViewportWidthChange(Number(event.target.value));
                    }}
                >
                    {VIEWPORT_PRESETS.map((width) => (
                        <option key={width} value={width}>
                            {width}
                        </option>
                    ))}
                    <option value="custom">Custom</option>
                </select>
                <input
                    aria-label="Custom viewport width"
                    className="border-border bg-background text-foreground h-7 w-20 rounded-md border px-2 text-xs"
                    type="number"
                    min={320}
                    value={viewportWidth}
                    onChange={(event) => onViewportWidthChange(Number(event.target.value))}
                />
                <span className="text-foreground font-medium capitalize">{breakpoint}</span>
            </div>
        </footer>
    );
}
