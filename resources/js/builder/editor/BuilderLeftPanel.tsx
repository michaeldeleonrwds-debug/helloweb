import {
    Image as ImageIcon,
    Layers,
    LayoutGrid,
    LayoutTemplate,
    Plus,
    Search,
    Sparkles,
    UploadCloud,
    X,
} from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

import type { ComponentDefinition } from '../component/definition';
import type { BuilderComponentNode, BuilderPageDocument, ComponentType } from '../document';
import type { MediaAsset } from '../persistence';
import type { ComponentRegistry } from '../registry/component-registry';
import type { ReusableComponentDefinition } from '../reusable';
import { BuilderElementsPanel } from './BuilderElementsPanel';
import { BuilderLayersPanel } from './BuilderLayersPanel';

export type LeftPanelTab = 'elements' | 'layers' | 'library' | 'media';

export interface BuilderLeftPanelProps {
    definitions: ComponentDefinition[];
    templates: { id: number; name: string; description?: string | null }[];
    reusableDefinitions: ReusableComponentDefinition[];
    mediaAssets: MediaAsset[];
    onInsert: (type: ComponentType) => void;
    onStartDrag: (type: ComponentType) => void;
    onOpenLayoutTemplates?: (type: 'columns' | 'grid') => void;
    onInsertTemplate: (id: number) => void;
    onInsertReusable: (id: number) => void;
    onOpenImport?: () => void;
    onUploadMedia?: (file: File) => Promise<MediaAsset>;
    document: BuilderPageDocument;
    registry: ComponentRegistry;
    selectedNodeId: string | null;
    dropTargetId?: string | null;
    onSelectNode: (nodeId: string) => void;
    onStartDragNode?: (nodeId: string) => void;
    onDragOverNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onDropNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => void;
    onEndDragNode?: () => void;
    canDropOnNode?: (nodeId: string, mode: 'append' | 'before' | 'after') => boolean;
}

export function BuilderLeftPanel({
    definitions,
    templates,
    reusableDefinitions,
    mediaAssets,
    onInsert,
    onStartDrag,
    onOpenLayoutTemplates,
    onInsertTemplate,
    onInsertReusable,
    onOpenImport,
    onUploadMedia,
    document,
    registry,
    selectedNodeId,
    dropTargetId,
    onSelectNode,
    onStartDragNode,
    onDragOverNode,
    onDropNode,
    onEndDragNode,
    canDropOnNode,
}: BuilderLeftPanelProps) {
    const [tab, setTab] = useState<LeftPanelTab>('elements');

    // Count layers
    const layerCount = useMemo(() => {
        let count = 0;
        const traverse = (node: BuilderComponentNode) => {
            count += 1;
            node.children.forEach(traverse);
        };
        document.root.children.forEach(traverse);
        return count;
    }, [document]);

    return (
        <aside className="builder-left-panel flex h-full min-h-0 w-full flex-col overflow-hidden bg-card text-card-foreground" aria-label="Builder controls">
            {/* Top Navigation Bar: 4 Equal Grid Tabs */}
            <div className="flex h-11 shrink-0 items-center border-b border-border bg-card px-1.5">
                <div className="grid grid-cols-4 gap-1 w-full">
                    <button
                        type="button"
                        onClick={() => setTab('elements')}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition ${
                            tab === 'elements'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                        title="Elements Catalog"
                    >
                        <LayoutGrid className="size-3.5 shrink-0" />
                        <span className="truncate">Elements</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('layers')}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition ${
                            tab === 'layers'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                        title="Layers Tree"
                    >
                        <Layers className="size-3.5 shrink-0" />
                        <span className="truncate">Layers</span>
                        {layerCount > 0 ? (
                            <span className="rounded-full bg-muted px-1 text-[9px] font-mono text-muted-foreground">
                                {layerCount}
                            </span>
                        ) : null}
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('library')}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition ${
                            tab === 'library'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                        title="Templates & Components"
                    >
                        <LayoutTemplate className="size-3.5 shrink-0" />
                        <span className="truncate">Library</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('media')}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition ${
                            tab === 'media'
                                ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                        title="Media Assets"
                    >
                        <ImageIcon className="size-3.5 shrink-0" />
                        <span className="truncate">Media</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area: Selected Tab at 100% Height */}
            <div className="min-h-0 flex-1 overflow-hidden">
                <div className="h-full">
                        {tab === 'elements' ? (
                            <BuilderElementsPanel
                                definitions={definitions}
                                onInsert={onInsert}
                                onStartDrag={onStartDrag}
                                onOpenLayoutTemplates={onOpenLayoutTemplates}
                            />
                        ) : null}

                        {tab === 'layers' ? (
                            <BuilderLayersPanel
                                document={document}
                                registry={registry}
                                selectedNodeId={selectedNodeId}
                                dropTargetId={dropTargetId}
                                onSelect={onSelectNode}
                                onStartDrag={onStartDragNode}
                                onDragOverNode={onDragOverNode}
                                onDropNode={onDropNode}
                                onEndDrag={onEndDragNode}
                                canDropOnNode={canDropOnNode}
                                showHeader={true}
                            />
                        ) : null}

                        {tab === 'library' ? (
                            <LibraryPanel
                                templates={templates}
                                reusableDefinitions={reusableDefinitions}
                                onInsertTemplate={onInsertTemplate}
                                onInsertReusable={onInsertReusable}
                                onOpenImport={onOpenImport}
                            />
                        ) : null}

                        {tab === 'media' ? (
                            <MediaPanel
                                assets={mediaAssets}
                                onUploadMedia={onUploadMedia}
                            />
                        ) : null}
                    </div>
            </div>
        </aside>
    );
}

export default BuilderLeftPanel;

function LibraryPanel({
    templates,
    reusableDefinitions,
    onInsertTemplate,
    onInsertReusable,
    onOpenImport,
}: {
    templates: { id: number; name: string; description?: string | null }[];
    reusableDefinitions: ReusableComponentDefinition[];
    onInsertTemplate: (id: number) => void;
    onInsertReusable: (id: number) => void;
    onOpenImport?: () => void;
}) {
    const [filter, setFilter] = useState<'all' | 'templates' | 'components'>('all');
    const [query, setQuery] = useState('');

    const filteredTemplates = useMemo(() => {
        if (filter === 'components') return [];
        const q = query.trim().toLowerCase();
        return templates.filter((t) => !q || `${t.name} ${t.description ?? ''}`.toLowerCase().includes(q));
    }, [templates, filter, query]);

    const filteredComponents = useMemo(() => {
        if (filter === 'templates') return [];
        const q = query.trim().toLowerCase();
        return reusableDefinitions.filter((c) => !q || `${c.name} ${c.description ?? ''}`.toLowerCase().includes(q));
    }, [reusableDefinitions, filter, query]);

    const totalResults = filteredTemplates.length + filteredComponents.length;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Search & Sub-Filter Bar */}
            <div className="shrink-0 space-y-2 border-b border-border p-3">
                {onOpenImport ? (
                    <button
                        type="button"
                        onClick={onOpenImport}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 px-3 text-xs font-bold text-primary transition hover:border-primary hover:bg-primary/10 active:scale-[0.98]"
                    >
                        <UploadCloud className="size-3.5 stroke-[2.2]" />
                        <span>Import Component / Template</span>
                    </button>
                ) : null}

                <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search library..."
                        className="h-8 w-full rounded-full border border-input bg-muted/50 pr-8 pl-8 text-xs text-foreground placeholder:text-muted-foreground transition outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute top-2 right-2.5 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3" />
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                            filter === 'all'
                                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        All ({templates.length + reusableDefinitions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('templates')}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                            filter === 'templates'
                                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        Templates ({templates.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('components')}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                            filter === 'components'
                                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        Components ({reusableDefinitions.length})
                    </button>
                </div>
            </div>

            {/* Items List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 space-y-4">
                {totalResults === 0 ? (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-center text-xs text-muted-foreground">
                        <LayoutTemplate className="size-5 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">No library items found</span>
                        <span className="text-[11px] text-muted-foreground/70">Create templates or reusable components to use them here.</span>
                    </div>
                ) : (
                    <>
                        {filteredTemplates.length > 0 ? (
                            <section className="space-y-2">
                                <div className="flex items-center gap-2 px-0.5">
                                    <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Page Templates
                                    </h3>
                                    <div className="h-px flex-1 bg-border/60" />
                                </div>
                                <div className="space-y-2">
                                    {filteredTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-2xs transition hover:border-primary/50 hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <LayoutTemplate className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-foreground">{template.name}</p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        {template.description ?? 'Template section'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onInsertTemplate(template.id)}
                                                className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-medium text-primary-foreground shadow-2xs transition hover:brightness-105 active:scale-95"
                                            >
                                                <Plus className="size-3" />
                                                <span>Insert</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {filteredComponents.length > 0 ? (
                            <section className="space-y-2">
                                <div className="flex items-center gap-2 px-0.5">
                                    <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Reusable Components
                                    </h3>
                                    <div className="h-px flex-1 bg-border/60" />
                                </div>
                                <div className="space-y-2">
                                    {filteredComponents.map((component) => (
                                        <div
                                            key={component.id}
                                            className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-2xs transition hover:border-primary/50 hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <Sparkles className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold text-foreground">{component.name}</p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        {component.description ?? 'Reusable component block'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onInsertReusable(component.id)}
                                                className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-medium text-primary-foreground shadow-2xs transition hover:brightness-105 active:scale-95"
                                            >
                                                <Plus className="size-3" />
                                                <span>Insert</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}

function MediaPanel({
    assets,
    onUploadMedia,
}: {
    assets: MediaAsset[];
    onUploadMedia?: (file: File) => Promise<MediaAsset>;
}) {
    const fileInputId = useId();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !onUploadMedia) return;

        setUploading(true);
        setUploadError(null);
        try {
            await onUploadMedia(file);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Upload Area */}
            {onUploadMedia ? (
                <div className="shrink-0 border-b border-border p-3">
                    <label
                        htmlFor={fileInputId}
                        className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 bg-muted/30 p-3 text-center transition hover:border-primary/50 hover:bg-muted/50"
                    >
                        <input
                            ref={fileInputRef}
                            id={fileInputId}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                            disabled={uploading}
                        />
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-105">
                            <UploadCloud className="size-4" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-foreground">
                                {uploading ? 'Uploading image...' : 'Click to upload image'}
                            </span>
                            <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG, WebP</p>
                        </div>
                    </label>
                    {uploadError ? (
                        <p className="mt-1.5 text-[11px] text-destructive">{uploadError}</p>
                    ) : null}
                </div>
            ) : null}

            {/* Media Gallery */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {assets.length === 0 ? (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-center text-xs text-muted-foreground">
                        <ImageIcon className="size-5 text-muted-foreground/60" />
                        <span className="font-medium text-foreground">No media assets yet</span>
                        <span className="text-[11px] text-muted-foreground/70">Upload images to quickly use them in your designs.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {assets.map((asset) => (
                            <div
                                key={asset.id}
                                className="group relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs transition hover:border-primary/50 hover:shadow-xs"
                            >
                                <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted/40">
                                    {asset.url ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.altText ?? asset.originalFilename}
                                            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                    ) : (
                                        <ImageIcon className="size-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="p-1.5">
                                    <p className="truncate text-[10px] font-medium text-foreground" title={asset.originalFilename}>
                                        {asset.originalFilename}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
