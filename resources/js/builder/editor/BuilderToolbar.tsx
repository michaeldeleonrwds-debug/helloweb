import {
    ArrowLeft,
    Check,
    ChevronDown,
    Cloud,
    CloudOff,
    Code2,
    Eye,
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

interface BuilderToolbarProps {
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
    onBeforeLeave: () => boolean;
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
    onBeforeLeave,
    onOpenCodeSettings,
}: BuilderToolbarProps) {
    return (
        <header className="border-border bg-card text-card-foreground relative z-20 flex h-14 shrink-0 items-center justify-between border-b px-3 shadow-xs">
            {/* Left section: Back, Title, Cloud save status */}
            <div className="flex min-w-0 items-center gap-2">
                <a
                    href="/builder"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition"
                    aria-label="Back to builder pages"
                    title="Back to pages"
                    onClick={(event) => {
                        if (!onBeforeLeave()) event.preventDefault();
                    }}
                >
                    <ArrowLeft className="size-4" />
                </a>

                <div className="flex min-w-0 items-center gap-1.5 pl-1">
                    <span className="text-muted-foreground hidden max-w-32 truncate text-xs font-normal sm:inline">{websiteName}</span>
                    <span className="text-muted-foreground/40 hidden text-xs sm:inline">/</span>
                    <span className="text-foreground max-w-36 truncate text-sm font-semibold tracking-tight md:max-w-56">{pageName}</span>
                    <ChevronDown className="text-muted-foreground size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                </div>

                <div className="bg-border hidden h-4 w-px sm:block" />

                <GoogleCloudSaveIndicator status={saveStatus} error={saveError} onRetry={onRetry} />
            </div>

            {/* Center section: Google M3 Segmented Viewport Switcher */}
            <div
                className="bg-muted/80 border-border absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border p-1 shadow-xs md:flex"
                aria-label="Website viewport"
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
                                isActive ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
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
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-full transition disabled:opacity-30"
                    aria-label="Undo"
                    title="Undo"
                    disabled={!canUndo}
                    onClick={onUndo}
                >
                    <Undo2 className="size-4" />
                </button>
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-full transition disabled:opacity-30"
                    aria-label="Redo"
                    title="Redo"
                    disabled={!canRedo}
                    onClick={onRedo}
                >
                    <Redo2 className="size-4" />
                </button>

                <div className="bg-border hidden h-4 w-px md:block" />

                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition"
                    aria-label="Global code"
                    title="Global code"
                    onClick={onOpenCodeSettings}
                >
                    <Code2 className="size-3.5" />
                    <span className="hidden xl:inline">Code</span>
                </button>

                {pageId ? (
                    <a
                        href={route('preview.pages.show', pageId)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition"
                        aria-label="Preview page"
                        title="Preview in new tab"
                    >
                        <Eye className="size-3.5" />
                        <span className="hidden lg:inline">Preview</span>
                    </a>
                ) : null}

                <button
                    type="button"
                    className="bg-primary text-primary-foreground inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-xs transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                    onClick={onSave}
                >
                    <Check className="size-3.5" />
                    <span>Save</span>
                </button>

                <div className="bg-border hidden h-4 w-px lg:block" />

                <button
                    type="button"
                    className={`inline-flex size-8 items-center justify-center rounded-full transition ${
                        elementsOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={onToggleElements}
                    aria-label="Toggle elements panel"
                    title="Toggle elements panel"
                >
                    <LayoutGrid className="size-4" />
                </button>

                <button
                    type="button"
                    className={`inline-flex size-8 items-center justify-center rounded-full transition ${
                        inspectorOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={onToggleInspector}
                    aria-label="Toggle design panel"
                    title="Toggle design inspector"
                >
                    <PanelRight className="size-4" />
                </button>
            </div>
        </header>
    );
}

function GoogleCloudSaveIndicator({ status, error, onRetry }: { status: BuilderSaveStatus; error: string | null; onRetry: () => void }) {
    if (status === 'error') {
        return (
            <div className="text-destructive flex items-center gap-1.5 text-xs font-medium" title={error ?? 'Save failed'}>
                <CloudOff className="size-4 shrink-0" />
                <span className="hidden sm:inline">Save failed</span>
                <button type="button" className="ml-0.5 underline-offset-2 hover:underline" onClick={onRetry}>
                    Retry
                </button>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Loader2 className="text-primary size-3.5 shrink-0 animate-spin" />
                <span className="hidden sm:inline">Saving to cloud...</span>
            </div>
        );
    }

    if (status === 'unsaved') {
        return (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs" title="Unsaved changes">
                <Cloud className="size-3.5 shrink-0 text-amber-500" />
                <span className="hidden sm:inline">Unsaved changes</span>
            </div>
        );
    }

    // Default 'saved' state
    return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs" title="All changes saved to cloud">
            <div className="relative flex items-center justify-center">
                <Cloud className="text-muted-foreground/80 size-4 shrink-0" />
                <Check className="text-primary absolute size-2 stroke-[3]" />
            </div>
            <span className="hidden md:inline">Saved to cloud</span>
        </div>
    );
}
