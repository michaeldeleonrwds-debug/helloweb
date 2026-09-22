import { ArrowLeft, Check, ChevronDown, LayoutPanelLeft, Monitor, PanelRight, Redo2, Smartphone, Tablet, Undo2 } from 'lucide-react';

import type { BuilderBreakpoint } from '../document';
import type { BuilderSaveStatus } from './use-builder-autosave';

interface BuilderToolbarProps {
    websiteName: string;
    pageName: string;
    breakpoint: BuilderBreakpoint;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
    saveStatus: BuilderSaveStatus;
    saveError: string | null;
    onRetry: () => void;
    onToggleElements: () => void;
    onToggleInspector: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
}

const devices: { id: BuilderBreakpoint; label: string; icon: typeof Monitor }[] = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export function BuilderToolbar({
    websiteName,
    pageName,
    breakpoint,
    onBreakpointChange,
    saveStatus,
    saveError,
    onRetry,
    onToggleElements,
    onToggleInspector,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onSave,
}: BuilderToolbarProps) {
    return (
        <header className="border-border bg-card text-card-foreground relative z-20 flex h-14 shrink-0 items-center justify-between border-b px-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
                <a
                    href="/builder"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition"
                    aria-label="Back to builder pages"
                >
                    <ArrowLeft className="size-4" />
                </a>
                <div className="bg-border hidden h-5 w-px sm:block" />
                <div className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="text-muted-foreground hidden max-w-32 truncate sm:inline">{websiteName}</span>
                    <span className="text-muted-foreground hidden sm:inline">/</span>
                    <span className="max-w-32 truncate font-medium md:max-w-48">{pageName}</span>
                    <ChevronDown className="text-muted-foreground size-3.5" aria-hidden="true" />
                </div>
            </div>

            <div
                className="border-border bg-muted/60 absolute left-1/2 hidden -translate-x-1/2 items-center rounded-lg border p-0.5 md:flex"
                aria-label="Website viewport"
            >
                {devices.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        aria-label={label}
                        aria-pressed={breakpoint === id}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${breakpoint === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => onBreakpointChange(id)}
                    >
                        <Icon className="size-3.5" />
                        <span className="hidden lg:inline">{label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md disabled:opacity-40"
                    aria-label="Undo"
                    title="Undo"
                    disabled={!canUndo}
                    onClick={onUndo}
                >
                    <Undo2 className="size-4" />
                </button>
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md disabled:opacity-40"
                    aria-label="Redo"
                    title="Redo"
                    disabled={!canRedo}
                    onClick={onRedo}
                >
                    <Redo2 className="size-4" />
                </button>
                <SaveIndicator status={saveStatus} error={saveError} onRetry={onRetry} />
                <button
                    type="button"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                    onClick={onSave}
                >
                    <Check className="size-3.5" />
                    Save
                </button>
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground hidden size-8 items-center justify-center rounded-md transition lg:inline-flex"
                    onClick={onToggleElements}
                    aria-label="Toggle elements panel"
                >
                    <LayoutPanelLeft className="size-4" />
                </button>
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition"
                    onClick={onToggleInspector}
                    aria-label="Toggle design panel"
                >
                    <PanelRight className="size-4" />
                </button>
            </div>
        </header>
    );
}

function SaveIndicator({ status, error, onRetry }: { status: BuilderSaveStatus; error: string | null; onRetry: () => void }) {
    const label = { saved: 'Saved', unsaved: 'Unsaved', saving: 'Saving', error: 'Save failed' }[status];
    return (
        <div className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs" title={error ?? undefined}>
            <span
                className={`size-1.5 rounded-full ${status === 'error' ? 'bg-destructive' : status === 'saving' || status === 'unsaved' ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
            <span className="hidden sm:inline">{label}</span>
            {status === 'error' ? (
                <button type="button" className="hover:text-foreground underline underline-offset-2" onClick={onRetry}>
                    Retry
                </button>
            ) : null}
        </div>
    );
}
