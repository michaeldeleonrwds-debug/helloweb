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
    LayoutTemplate,
    Loader2,
    Monitor,
    PanelBottom,
    PanelRight,
    PanelsTopLeft,
    Redo2,
    Smartphone,
    Tablet,
    Undo2,
    UploadCloud,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

import type { BuilderBreakpoint } from '../document';
import type { BuilderSaveStatus } from './use-builder-autosave';

export interface BuilderToolbarProps {
    websiteName: string;
    pageName: string;
    pageId: number | null;
    breakpoint: BuilderBreakpoint;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
    zoom?: number;
    onZoomChange?: (zoom: number) => void;
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
    onOpenImport?: () => void;
    pageStatus?: string;
    onPublish?: () => void;
    isPublishing?: boolean;
    isTemplate?: boolean;
    templateType?: string;
    onOpenHeaderPicker?: () => void;
    onOpenFooterPicker?: () => void;
    onOpenBlueprintsPicker?: () => void;
    activeHeaderName?: string | null;
    activeFooterName?: string | null;
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
    zoom,
    onZoomChange,
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
    onOpenImport,
    pageStatus,
    onPublish,
    isPublishing = false,
    isTemplate = false,
    templateType,
    onOpenHeaderPicker,
    onOpenFooterPicker,
    onOpenBlueprintsPicker,
    activeHeaderName,
    activeFooterName,
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
                    aria-label={isTemplate ? 'Back to templates' : 'Back to dashboard'}
                    title={isTemplate ? 'Back to templates' : 'Back to dashboard'}
                >
                    <ArrowLeft className="size-4" />
                </button>

                <div className="h-4 w-px bg-border/60" />

                {/* Site & Page Navigation */}
                <div className="flex min-w-0 items-center gap-1.5">
                    <Globe className="size-3.5 shrink-0 text-muted-foreground/60 hidden sm:block" />
                    <span className="hidden max-w-32 truncate text-xs font-medium text-muted-foreground sm:inline" title={isTemplate ? 'Templates' : websiteName}>
                        {isTemplate ? 'Templates' : websiteName}
                    </span>
                    <span className="hidden text-xs text-muted-foreground/40 sm:inline">/</span>
                    <div className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted/60">
                        <span className="max-w-40 truncate md:max-w-64" title={pageName}>
                            {pageName}
                        </span>
                        <ChevronDown className="size-3 shrink-0 text-muted-foreground/60" />
                    </div>
                    {isTemplate ? (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {templateType === 'header' ? 'Global Header' : templateType === 'footer' ? 'Global Footer' : 'Page Blueprint'}
                        </span>
                    ) : pageStatus ? (
                        <span
                            className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                pageStatus === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}
                        >
                            {pageStatus}
                        </span>
                    ) : null}
                </div>

                <div className="hidden h-4 w-px bg-border/60 md:block" />

                {/* Google Docs style Save Indicator */}
                <GoogleCloudSaveIndicator status={saveStatus} error={saveError} onRetry={onRetry} />

                {/* Theme Layout Quick Pickers (Pages only) */}
                {!isTemplate && (onOpenHeaderPicker || onOpenFooterPicker) ? (
                    <div className="hidden lg:flex items-center gap-1.5 ml-1 border-l border-border/60 pl-2">
                        {onOpenHeaderPicker && (
                            <button
                                type="button"
                                onClick={onOpenHeaderPicker}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted px-2.5 text-xs font-medium text-foreground transition active:scale-95"
                                title="Choose or switch Global Header design"
                            >
                                <PanelsTopLeft className="size-3.5 text-primary" />
                                <span className="max-w-28 truncate">{activeHeaderName || 'No Header'}</span>
                                <ChevronDown className="size-3 text-muted-foreground" />
                            </button>
                        )}
                        {onOpenFooterPicker && (
                            <button
                                type="button"
                                onClick={onOpenFooterPicker}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted px-2.5 text-xs font-medium text-foreground transition active:scale-95"
                                title="Choose or switch Global Footer design"
                            >
                                <PanelBottom className="size-3.5 text-primary" />
                                <span className="max-w-28 truncate">{activeFooterName || 'No Footer'}</span>
                                <ChevronDown className="size-3 text-muted-foreground" />
                            </button>
                        )}
                        {onOpenBlueprintsPicker && (
                            <button
                                type="button"
                                onClick={onOpenBlueprintsPicker}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted px-2.5 text-xs font-medium text-foreground transition active:scale-95"
                                title="Browse and apply Page Blueprints"
                            >
                                <LayoutTemplate className="size-3.5 text-blue-500" />
                                <span className="hidden xl:inline">Blueprints</span>
                            </button>
                        )}
                    </div>
                ) : null}
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

                {/* Import Button */}
                {onOpenImport ? (
                    <button
                        type="button"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Import component or template"
                        title="Import design package (ZIP)"
                        onClick={onOpenImport}
                    >
                        <UploadCloud className="size-3.5" />
                        <span className="hidden lg:inline">Import</span>
                    </button>
                ) : null}

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

                {/* Save Draft / Template Button */}
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs transition active:scale-95 ${
                        saveStatus === 'unsaved'
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80'
                            : 'border border-border/80 bg-muted/40 text-muted-foreground cursor-default'
                    }`}
                    title={isTemplate ? 'Save template changes' : 'Save current composition as draft'}
                >
                    {saveStatus === 'saving' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Check className={`size-3.5 ${saveStatus === 'saved' ? 'text-primary' : ''}`} />
                    )}
                    <span>
                        {saveStatus === 'saving'
                            ? 'Saving...'
                            : saveStatus === 'saved'
                            ? isTemplate
                                ? 'Template Saved'
                                : 'Draft Saved'
                            : isTemplate
                            ? 'Save Template'
                            : 'Save Draft'}
                    </span>
                </button>

                {/* Publish Button (pages only) */}
                {!isTemplate && onPublish ? (
                    <button
                        type="button"
                        onClick={onPublish}
                        disabled={isPublishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50"
                        title={pageStatus === 'published' ? 'Page is published. Click to publish latest changes.' : 'Publish this page publicly'}
                    >
                        {isPublishing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Globe className="size-3.5" />
                        )}
                        <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                    </button>
                ) : null}


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
