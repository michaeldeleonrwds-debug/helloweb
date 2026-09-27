import {
    Check,
    ChevronRight,
    Cloud,
    CloudOff,
    Code2,
    ExternalLink,
    HelpCircle,
    Keyboard,
    Layout,
    Layers,
    Loader2,
    Lock,
    Monitor,
    Smartphone,
    Tablet,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import React, { useMemo } from 'react';

import type { BuilderBreakpoint, BuilderComponentNode, BuilderPageDocument } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';
import type { BuilderSaveStatus } from './use-builder-autosave';

export interface BuilderFooterBarProps {
    document: BuilderPageDocument;
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string) => void;
    registry: ComponentRegistry;
    breakpoint: BuilderBreakpoint;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
    saveStatus: BuilderSaveStatus;
    saveError: string | null;
    onRetry: () => void;
    pageId?: number | null;
    onOpenCodeSettings?: () => void;
    onOpenShortcuts?: () => void;
    onContextMenuCrumb?: (nodeId: string, x: number, y: number) => void;
    isTemplate?: boolean;
}

const devices: { id: BuilderBreakpoint; label: string; icon: typeof Monitor; width: string }[] = [
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '1200px+' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

export function BuilderFooterBar({
    document,
    selectedNodeId,
    onSelectNode,
    registry,
    breakpoint,
    onBreakpointChange,
    zoom = 80,
    onZoomChange,
    saveStatus,
    saveError,
    onRetry,
    pageId,
    onOpenCodeSettings,
    onOpenShortcuts,
    onContextMenuCrumb,
    isTemplate = false,
}: BuilderFooterBarProps) {
    // Compute ancestor breadcrumb hierarchy from root down to selectedNodeId
    const { breadcrumbs, selectedNode } = useMemo<{
        breadcrumbs: { id: string; name: string; type: string }[];
        selectedNode: BuilderComponentNode | null;
    }>(() => {
        if (!selectedNodeId) return { breadcrumbs: [], selectedNode: null };

        let foundNode: BuilderComponentNode | null = null;
        const path: { id: string; name: string; type: string }[] = [];

        const traverse = (curr: BuilderComponentNode): boolean => {
            if (curr.id === selectedNodeId) {
                foundNode = curr;
                const def = registry.has(curr.type) ? registry.get(curr.type) : null;
                path.push({
                    id: curr.id,
                    name: def?.name ?? curr.type,
                    type: curr.type,
                });
                return true;
            }

            for (const child of curr.children) {
                if (traverse(child)) {
                    const def = registry.has(curr.type) ? registry.get(curr.type) : null;
                    path.unshift({
                        id: curr.id,
                        name: def?.name ?? (curr.id === document.root.id ? 'Page' : curr.type),
                        type: curr.type,
                    });
                    return true;
                }
            }

            return false;
        };

        traverse(document.root);
        return { breadcrumbs: path, selectedNode: foundNode };
    }, [document, selectedNodeId, registry]);

    // Count total elements in the page tree
    const totalElementsCount = useMemo(() => {
        let count = 0;
        const countTree = (node: BuilderComponentNode) => {
            count++;
            node.children.forEach(countTree);
        };
        countTree(document.root);
        return count;
    }, [document]);

    return (
        <footer
            className="relative z-30 flex h-7.5 shrink-0 items-center justify-between border-t border-border/80 bg-card/95 px-3 text-[11px] text-muted-foreground shadow-2xs backdrop-blur-md select-none"
            aria-label="Builder status bar"
        >
            {/* Left section: Breadcrumb DOM Path, Selection Info & Shortcuts Trigger */}
            <div className="flex min-w-0 items-center gap-2">
                {breadcrumbs.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground/80">
                        <Layout className="size-3 text-muted-foreground/60" />
                        <span className="font-semibold text-foreground">Page (Root)</span>
                        <span className="text-[10px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] text-muted-foreground/70">{totalElementsCount} elements</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[340px] md:max-w-[480px]">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={crumb.id}>
                                    {idx > 0 && <ChevronRight className="size-2.5 text-muted-foreground/40 shrink-0" />}
                                    <button
                                        type="button"
                                        onClick={() => onSelectNode(crumb.id)}
                                        onContextMenu={(e) => {
                                            if (onContextMenuCrumb) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onContextMenuCrumb(crumb.id, e.clientX, e.clientY);
                                            }
                                        }}
                                        className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-muted ${
                                            isLast
                                                ? 'font-bold text-primary bg-primary/10'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                        title={`Select ${crumb.name} (${crumb.type})`}
                                    >
                                        <span>{crumb.name}</span>
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {/* Selected Node Locked Tag */}
                {selectedNode?.metadata?.locked ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        <Lock className="size-2.5" /> Locked
                    </span>
                ) : null}

                <div className="hidden h-3.5 w-px bg-border/60 sm:block" />

                {/* Keyboard Shortcuts Trigger */}
                {onOpenShortcuts ? (
                    <button
                        type="button"
                        onClick={onOpenShortcuts}
                        className="hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        title="View Keyboard Shortcuts (Ctrl+/)"
                    >
                        <Keyboard className="size-3 text-muted-foreground" />
                        <span className="hidden md:inline">Shortcuts</span>
                    </button>
                ) : null}
            </div>

            {/* Center section: VS Code-style Device Viewport Switcher */}
            <div className="hidden md:flex items-center gap-2">
                <div
                    className="flex items-center rounded-md border border-border/80 bg-muted/50 p-0.5 shadow-2xs"
                    aria-label="Viewport switcher"
                >
                    {devices.map(({ id, label, icon: Icon, width }) => {
                        const isActive = breakpoint === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                aria-label={label}
                                aria-pressed={isActive}
                                onClick={() => onBreakpointChange(id)}
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition ${
                                    isActive
                                        ? 'bg-card text-primary font-bold shadow-2xs'
                                        : 'text-muted-foreground hover:bg-card/40 hover:text-foreground'
                                }`}
                                title={`Switch to ${label} (${width})`}
                            >
                                <Icon className="size-3" />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                <span className="hidden lg:inline font-mono text-[10px] text-muted-foreground/60">
                    {breakpoint === 'desktop' ? '1200px+' : breakpoint === 'tablet' ? '768px' : '375px'}
                </span>
            </div>

            {/* Right section: Zoom Controls, Code, Preview, Cloud Save Indicator */}
            <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5 rounded border border-border/80 bg-muted/40 px-1 py-0.5">
                    <button
                        type="button"
                        onClick={() => onZoomChange?.(Math.max(50, zoom - 10))}
                        className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                        title="Zoom out"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="size-3" />
                    </button>
                    <select
                        value={zoom}
                        onChange={(e) => onZoomChange?.(Number(e.target.value))}
                        className="bg-transparent text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer px-1 py-0.5"
                        title="Canvas zoom level"
                        aria-label="Canvas zoom level"
                    >
                        <option value={50} className="bg-popover text-popover-foreground">50%</option>
                        <option value={75} className="bg-popover text-popover-foreground">75%</option>
                        <option value={80} className="bg-popover text-popover-foreground">80%</option>
                        <option value={90} className="bg-popover text-popover-foreground">90%</option>
                        <option value={100} className="bg-popover text-popover-foreground">100%</option>
                        <option value={125} className="bg-popover text-popover-foreground">125%</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => onZoomChange?.(Math.min(150, zoom + 10))}
                        className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                        title="Zoom in"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="size-3" />
                    </button>
                </div>

                {/* Global Code Quick Button */}
                {onOpenCodeSettings ? (
                    <button
                        type="button"
                        onClick={onOpenCodeSettings}
                        className="hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        title="Global HTML Head & Body Code"
                    >
                        <Code2 className="size-3" />
                        <span className="hidden lg:inline">Code</span>
                    </button>
                ) : null}

                {/* Live Preview Button */}
                {pageId ? (
                    <a
                        href={route('preview.pages.show', pageId)}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        title="Live preview in new tab"
                    >
                        <ExternalLink className="size-3" />
                        <span className="hidden lg:inline">Preview</span>
                    </a>
                ) : null}

                <div className="h-3.5 w-px bg-border/60" />

                {/* Cloud Save Sync Status */}
                <StatusCloudIndicator status={saveStatus} error={saveError} onRetry={onRetry} />
            </div>
        </footer>
    );
}

function StatusCloudIndicator({
    status,
    error,
    onRetry,
}: {
    status: BuilderSaveStatus;
    error: string | null;
    onRetry: () => void;
}) {
    if (status === 'error') {
        return (
            <div className="flex items-center gap-1 text-[11px] font-medium text-destructive" title={error ?? 'Save failed'}>
                <CloudOff className="size-3 shrink-0" />
                <span className="hidden sm:inline">Save failed</span>
                <button type="button" className="underline hover:text-destructive/80 ml-0.5" onClick={onRetry}>
                    Retry
                </button>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 shrink-0 text-primary animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
            </div>
        );
    }

    if (status === 'unsaved') {
        return (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400" title="Unsaved changes">
                <Cloud className="size-3 shrink-0" />
                <span className="hidden sm:inline">Unsaved</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground" title="All changes saved to cloud">
            <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Saved</span>
        </div>
    );
}

export default BuilderFooterBar;
