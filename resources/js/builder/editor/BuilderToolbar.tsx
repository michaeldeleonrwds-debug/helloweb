import {
    ArrowLeft,
    Check,
    ChevronDown,
    Cloud,
    CloudOff,
    Code2,
    ExternalLink,
    Globe,
    LayoutGrid,
    Loader2,
    Monitor,
    PanelRight,
    Redo2,
    Smartphone,
    Tablet,
    Undo2,
} from 'lucide-react';

import type { BuilderBreakpoint } from '../document';
import type { BuilderSaveStatus } from './use-builder-autosave';

export interface BuilderToolbarProps {
    websiteName: string;
    pageName: string;
    pageId: number | null;
    breakpoint: BuilderBreakpoint;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
    saveStatus: BuilderSaveStatus;
    saveError: string | null;
    onRetry: () => void;
    onToggleElements: () => void;
    onToggleInspector: () => void;
    elementsOpen?: boolean;
    inspectorOpen?: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onNavigateBack: () => void;
    onOpenCodeSettings: () => void;
}

const devices: { id: BuilderBreakpoint; label: string; icon: typeof Monitor }[] = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export function BuilderToolbar({
    websiteName,
    pageName,
    pageId,
    breakpoint,
    onBreakpointChange,
    saveStatus,
    saveError,
    onRetry,
    onToggleElements,
    onToggleInspector,
    elementsOpen = true,
    inspectorOpen = true,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onSave,
    onNavigateBack,
    onOpenCodeSettings,
}: BuilderToolbarProps) {
    return (
        <header
            className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-3 text-card-foreground shadow-2xs backdrop-blur-md"
            aria-label="Builder toolbar"
        >
            {/* Left section: Back button, Site/Page Breadcrumbs, Cloud Save Status */}
            <div className="flex min-w-0 items-center gap-2.5">
                <button
                    type="button"
                    onClick={onNavigateBack}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
                    aria-label="Back to dashboard"
                    title="Back to dashboard"
                >
                    <ArrowLeft className="size-4" />
                </button>

                <div className="h-4 w-px bg-border/60" />

                {/* Site & Page Navigation */}
                <div className="flex min-w-0 items-center gap-1.5">
                    <Globe className="size-3.5 shrink-0 text-muted-foreground/60 hidden sm:block" />
                    <span className="hidden max-w-32 truncate text-xs font-medium text-muted-foreground sm:inline" title={websiteName}>
                        {websiteName}
                    </span>
                    <span className="hidden text-xs text-muted-foreground/40 sm:inline">/</span>
                    <div className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted/60">
                        <span className="max-w-40 truncate md:max-w-64" title={pageName}>
                            {pageName}
                        </span>
                        <ChevronDown className="size-3 shrink-0 text-muted-foreground/60" />
                    </div>
                </div>

                <div className="hidden h-4 w-px bg-border/60 md:block" />

                {/* Google Docs style Save Indicator */}
                <GoogleCloudSaveIndicator status={saveStatus} error={saveError} onRetry={onRetry} />
            </div>

            {/* Center section: Google M3 Segmented Viewport Switcher */}
            <div
                className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-border/80 bg-muted/60 p-0.5 shadow-2xs md:flex"
                aria-label="Device viewport switcher"
            >
                {devices.map(({ id, label, icon: Icon }) => {
                    const isActive = breakpoint === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-label={label}
                            aria-pressed={isActive}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                                isActive
                                    ? 'bg-card text-primary font-semibold shadow-2xs'
                                    : 'text-muted-foreground hover:bg-card/40 hover:text-foreground'
                            }`}
                            onClick={() => onBreakpointChange(id)}
                        >
                            <Icon className="size-3.5" />
                            <span className="hidden lg:inline">{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Right section: History, Code, Preview, Save, Panel toggles */}
            <div className="flex items-center gap-1.5">
                {/* Undo / Redo */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                        disabled={!canUndo}
                        onClick={onUndo}
                    >
                        <Undo2 className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Redo"
                        title="Redo (Ctrl+Y)"
                        disabled={!canRedo}
                        onClick={onRedo}
                    >
                        <Redo2 className="size-3.5" />
                    </button>
                </div>

                <div className="h-4 w-px bg-border/60" />

                {/* Global Code Button */}
                <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Global code settings"
                    title="Global HTML head & footer code"
                    onClick={onOpenCodeSettings}
                >
                    <Code2 className="size-3.5" />
                    <span className="hidden xl:inline">Code</span>
                </button>

                {/* Preview Button */}
                {pageId ? (
                    <a
                        href={route('preview.pages.show', pageId)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Preview page in new tab"
                        title="Live preview in new tab"
                    >
                        <ExternalLink className="size-3.5" />
                        <span className="hidden lg:inline">Preview</span>
                    </a>
                ) : null}

                {/* Save Button */}
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-2xs transition active:scale-95 ${
                        saveStatus === 'unsaved'
                            ? 'bg-primary text-primary-foreground hover:brightness-105'
                            : 'border border-border/80 bg-muted/40 text-muted-foreground cursor-default'
                    }`}
                >
                    {saveStatus === 'saving' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Check className={`size-3.5 ${saveStatus === 'saved' ? 'text-primary' : ''}`} />
                    )}
                    <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
                </button>

                <div className="h-4 w-px bg-border/60" />

                {/* Side Panel Toggles */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        className={`inline-flex size-8 items-center justify-center rounded-lg transition ${
                            elementsOpen ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={onToggleElements}
                        aria-label="Toggle elements panel"
                        title="Toggle elements catalog (left panel)"
                    >
                        <LayoutGrid className="size-4" />
                    </button>

                    <button
                        type="button"
                        className={`inline-flex size-8 items-center justify-center rounded-lg transition ${
                            inspectorOpen ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={onToggleInspector}
                        aria-label="Toggle design panel"
                        title="Toggle component inspector (right panel)"
                    >
                        <PanelRight className="size-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default BuilderToolbar;

function GoogleCloudSaveIndicator({ status, error, onRetry }: { status: BuilderSaveStatus; error: string | null; onRetry: () => void }) {
    if (status === 'error') {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive" title={error ?? 'Save failed'}>
                <CloudOff className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Save failed</span>
                <button type="button" className="ml-0.5 underline hover:text-destructive/80" onClick={onRetry}>
                    Retry
                </button>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 shrink-0 text-primary animate-spin" />
                <span className="hidden sm:inline">Saving to cloud...</span>
            </div>
        );
    }

    if (status === 'unsaved') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400" title="Unsaved changes">
                <Cloud className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Unsaved changes</span>
            </div>
        );
    }

    // Default 'saved' state
    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="All changes saved to cloud">
            <div className="relative flex items-center justify-center">
                <Cloud className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <Check className="absolute size-2 stroke-[3] text-card" />
            </div>
            <span className="hidden md:inline">Saved to cloud</span>
        </div>
    );
}
