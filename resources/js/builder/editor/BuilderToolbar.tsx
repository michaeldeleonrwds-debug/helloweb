import {
    ArrowLeft,
    Bot,
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
    onToggleAiPanel?: () => void;
    elementsOpen?: boolean;
    inspectorOpen?: boolean;
    aiPanelOpen?: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onNavigateBack: () => void;
    onOpenCodeSettings: () => void;
    onOpenImport?: () => void;
    onPreview?: () => void;
    previewUrl?: string;
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
    aiStatus?: {
        openai: { connected: boolean; status: string; providerLabel?: string };
        mcp: { connected: boolean; status: string };
    };
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
    zoom,
    onZoomChange,
    saveStatus,
    saveError,
    onRetry,
    onToggleElements,
    onToggleInspector,
    onToggleAiPanel,
    elementsOpen = true,
    inspectorOpen = true,
    aiPanelOpen = false,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onSave,
    onNavigateBack,
    onOpenCodeSettings,
    onOpenImport,
    onPreview,
    previewUrl,
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
    aiStatus,
}: BuilderToolbarProps) {
    const showAiStatus = aiStatus?.openai.connected === true || aiStatus?.mcp.connected === true;

    return (
        <header
            className="border-border/80 bg-card/95 text-card-foreground relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-3 shadow-2xs backdrop-blur-md"
            aria-label="Builder toolbar"
        >
            {/* Left section: Back button, Site/Page Breadcrumbs, Cloud Save Status */}
            <div className="flex min-w-0 items-center gap-2.5">
                <button
                    type="button"
                    onClick={onNavigateBack}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95"
                    aria-label={isTemplate ? 'Back to templates' : 'Back to dashboard'}
                    title={isTemplate ? 'Back to templates' : 'Back to dashboard'}
                >
                    <ArrowLeft className="size-4" />
                </button>

                <div className="bg-border/60 h-4 w-px" />

                {/* Site & Page Navigation */}
                <div className="flex min-w-0 items-center gap-1.5">
                    <Globe className="text-muted-foreground/60 hidden size-3.5 shrink-0 sm:block" />
                    <span
                        className="text-muted-foreground hidden max-w-32 truncate text-xs font-medium sm:inline"
                        title={isTemplate ? 'Templates' : websiteName}
                    >
                        {isTemplate ? 'Templates' : websiteName}
                    </span>
                    <span className="text-muted-foreground/40 hidden text-xs sm:inline">/</span>
                    <div className="text-foreground hover:bg-muted/60 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold transition">
                        <span className="max-w-40 truncate md:max-w-64" title={pageName}>
                            {pageName}
                        </span>
                        <ChevronDown className="text-muted-foreground/60 size-3 shrink-0" />
                    </div>
                    {isTemplate ? (
                        <span className="bg-primary/10 border-primary/20 text-primary hidden items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:inline-flex">
                            {templateType === 'header' ? 'Global Header' : templateType === 'footer' ? 'Global Footer' : 'Page Blueprint'}
                        </span>
                    ) : pageStatus ? (
                        <span
                            className={`hidden items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:inline-flex ${
                                pageStatus === 'published'
                                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                    : 'border border-amber-500/20 bg-amber-500/10 text-amber-600'
                            }`}
                        >
                            {pageStatus}
                        </span>
                    ) : null}
                </div>

                <div className="bg-border/60 hidden h-4 w-px md:block" />

                {/* Google Docs style Save Indicator */}
                <GoogleCloudSaveIndicator status={saveStatus} error={saveError} onRetry={onRetry} />

                {/* Theme Layout Quick Pickers (Pages only) */}
                {!isTemplate && (onOpenHeaderPicker || onOpenFooterPicker) ? (
                    <div className="border-border/60 ml-1 hidden items-center gap-1.5 border-l pl-2 lg:flex">
                        {onOpenHeaderPicker && (
                            <button
                                type="button"
                                onClick={onOpenHeaderPicker}
                                className="border-border/80 bg-muted/30 hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition active:scale-95"
                                title="Choose or switch Global Header design"
                            >
                                <PanelsTopLeft className="text-primary size-3.5" />
                                <span className="max-w-28 truncate">{activeHeaderName || 'No Header'}</span>
                                <ChevronDown className="text-muted-foreground size-3" />
                            </button>
                        )}
                        {onOpenFooterPicker && (
                            <button
                                type="button"
                                onClick={onOpenFooterPicker}
                                className="border-border/80 bg-muted/30 hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition active:scale-95"
                                title="Choose or switch Global Footer design"
                            >
                                <PanelBottom className="text-primary size-3.5" />
                                <span className="max-w-28 truncate">{activeFooterName || 'No Footer'}</span>
                                <ChevronDown className="text-muted-foreground size-3" />
                            </button>
                        )}
                        {onOpenBlueprintsPicker && (
                            <button
                                type="button"
                                onClick={onOpenBlueprintsPicker}
                                className="border-border/80 bg-muted/30 hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition active:scale-95"
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
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition disabled:pointer-events-none disabled:opacity-30"
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                        disabled={!canUndo}
                        onClick={onUndo}
                    >
                        <Undo2 className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition disabled:pointer-events-none disabled:opacity-30"
                        aria-label="Redo"
                        title="Redo (Ctrl+Y)"
                        disabled={!canRedo}
                        onClick={onRedo}
                    >
                        <Redo2 className="size-3.5" />
                    </button>
                </div>

                <div className="bg-border/60 h-4 w-px" />

                {/* Global Code Button */}
                {showAiStatus ? (
                    <a
                        href={route('ai.settings.edit')}
                        className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition"
                        title="AI connection status"
                    >
                        <Bot className="size-3.5" />
                        <span className="hidden xl:inline">
                            {aiStatus?.openai.connected ? (aiStatus.openai.providerLabel ?? 'AI') : null}
                            {aiStatus?.openai.connected && aiStatus?.mcp.connected ? ' + ' : null}
                            {aiStatus?.mcp.connected ? 'MCP' : null}
                        </span>
                    </a>
                ) : null}

                {/* Global Code Button */}
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition"
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
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition"
                        aria-label="Import component or template"
                        title="Import design package (ZIP)"
                        onClick={onOpenImport}
                    >
                        <UploadCloud className="size-3.5" />
                        <span className="hidden lg:inline">Import</span>
                    </button>
                ) : null}

                {/* Preview Button */}
                {previewUrl ? (
                    onPreview ? (
                        <button
                            type="button"
                            onClick={onPreview}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition"
                            aria-label="Preview page in new tab"
                            title="Live preview in new tab (saves latest draft)"
                        >
                            <ExternalLink className="size-3.5" />
                            <span className="hidden lg:inline">Preview</span>
                        </button>
                    ) : (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition"
                            aria-label="Preview page in new tab"
                            title="Live preview in new tab"
                        >
                            <ExternalLink className="size-3.5" />
                            <span className="hidden lg:inline">Preview</span>
                        </a>
                    )
                ) : null}

                {/* Save Draft / Template Button */}
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saveStatus === 'saved' || saveStatus === 'saving'}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs transition active:scale-95 ${
                        saveStatus === 'unsaved'
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border/80 border'
                            : 'border-border/80 bg-muted/40 text-muted-foreground cursor-default border'
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
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                        title={pageStatus === 'published' ? 'Page is published. Click to publish latest changes.' : 'Publish this page publicly'}
                    >
                        {isPublishing ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
                        <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                    </button>
                ) : null}

                <div className="bg-border/60 h-4 w-px" />

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
                    {onToggleAiPanel ? (
                        <button
                            type="button"
                            className={`inline-flex size-8 items-center justify-center rounded-lg transition ${
                                aiPanelOpen ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                            onClick={onToggleAiPanel}
                            aria-label="Toggle AI chat"
                            title="Toggle AI chat"
                        >
                            <Bot className="size-4" />
                        </button>
                    ) : null}
                </div>
            </div>
        </header>
    );
}

export default BuilderToolbar;

function GoogleCloudSaveIndicator({ status, error, onRetry }: { status: BuilderSaveStatus; error: string | null; onRetry: () => void }) {
    if (status === 'error') {
        return (
            <div className="text-destructive flex items-center gap-1.5 text-xs font-medium" title={error ?? 'Save failed'}>
                <CloudOff className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Save failed</span>
                <button type="button" className="hover:text-destructive/80 ml-0.5 underline" onClick={onRetry}>
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
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400" title="Unsaved changes">
                <Cloud className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Unsaved changes</span>
            </div>
        );
    }

    // Default 'saved' state
    return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs" title="All changes saved to cloud">
            <div className="relative flex items-center justify-center">
                <Cloud className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <Check className="text-card absolute size-2 stroke-[3]" />
            </div>
            <span className="hidden md:inline">Saved to cloud</span>
        </div>
    );
}
