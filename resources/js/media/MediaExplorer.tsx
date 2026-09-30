import { PromptDialog } from '@/components/ui/prompt-dialog';
import { cn } from '@/lib/utils';
import { ChevronRight, FolderPlus, Grid2x2, Image, List, Loader2, Search, Trash2, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';
import { toast } from 'sonner';

import { FolderTree } from './FolderTree';
import { absoluteUrl } from './format';
import { MediaGridView } from './MediaGridView';
import { MediaListView } from './MediaListView';
import { FolderListSkeleton, MediaGridSkeleton, MediaListSkeleton } from './MediaSkeleton';
import { MEDIA_ASSET_DRAG_TYPE, MEDIA_FOLDER_DRAG_TYPE } from './types';
import type { MediaAssetItem, MediaExplorerView, MediaFolderNode } from './types';
import { useMediaExplorer } from './useMediaExplorer';

export interface MediaExplorerProps {
    initialAssets?: MediaAssetItem[];
    initialFolders?: MediaFolderNode[];
    uploadFile?: (file: File, folderId: number | null) => Promise<MediaAssetItem>;
    onSelect?: (asset: MediaAssetItem) => void;
    toolbarExtra?: ReactNode;
    cardExtra?: (asset: MediaAssetItem) => ReactNode;
    processing?: { assetId: number | null; label: string | null };
    className?: string;
}

export function MediaExplorer({
    initialAssets,
    initialFolders,
    uploadFile,
    onSelect,
    toolbarExtra,
    cardExtra,
    processing,
    className,
}: MediaExplorerProps) {
    const controller = useMediaExplorer({ initialAssets, initialFolders, uploadFile });
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [folderPromptOpen, setFolderPromptOpen] = useState(false);
    const [folderPromptError, setFolderPromptError] = useState<string | null>(null);

    const {
        visibleAssets,
        breadcrumbs,
        currentFolderId,
        trash,
        trashCount,
        loading,
        uploading,
        error,
        search,
        view,
    } = controller;

    const startFolder = () => {
        setFolderPromptError(null);
        setFolderPromptOpen(true);
    };

    const submitFolder = async (name: string) => {
        try {
            await controller.createFolder(name);
            setFolderPromptOpen(false);
            setFolderPromptError(null);
        } catch (caught) {
            setFolderPromptError(caught instanceof Error ? caught.message : 'Could not create the folder.');
        }
    };

    const copyLink = (asset: MediaAssetItem) => {
        const url = absoluteUrl(asset.url);
        if (!url) return;
        void navigator.clipboard.writeText(url);
        setCopiedId(asset.id);
        toast.success('Link copied.');
        window.setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragActive(false);

        const assetId = event.dataTransfer.getData(MEDIA_ASSET_DRAG_TYPE);
        if (assetId) {
            void controller.moveAsset(Number(assetId), currentFolderId).catch((caught: unknown) => controller.setError(caught instanceof Error ? caught.message : 'Could not move the file.'));
            return;
        }

        const folderId = event.dataTransfer.getData(MEDIA_FOLDER_DRAG_TYPE);
        if (folderId) {
            void controller.moveFolder(Number(folderId), currentFolderId).catch((caught: unknown) => controller.setError(caught instanceof Error ? caught.message : 'Could not move the folder.'));
            return;
        }

        if (event.dataTransfer.files?.length) {
            void controller.upload(event.dataTransfer.files);
        }
    };

    const emptyMessage = loading
        ? null
        : search
          ? 'No files match your search.'
          : trash
            ? 'Trash is empty.'
            : currentFolderId !== null
              ? 'This folder is empty.'
              : 'No media assets yet.';

    return (
        <div className={cn('flex h-full min-h-0 w-full', className)}>
            <aside className="hidden w-56 shrink-0 flex-col border-r border-border sm:flex">
                <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">Folders</span>
                    <button
                        type="button"
                        onClick={startFolder}
                        title="New folder"
                        className="text-muted-foreground hover:text-foreground rounded-md p-1 transition"
                    >
                        <FolderPlus className="size-3.5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
                    <button
                        type="button"
                        onClick={() => {
                            controller.setTrash(false);
                            controller.setSearch('');
                            controller.setCurrentFolderId(null);
                        }}
                        className={cn(
                            'flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
                            !trash && currentFolderId === null
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                        )}
                    >
                        Library
                    </button>
                    {loading ? <FolderListSkeleton /> : <FolderTree controller={controller} />}
                </div>

                <div className="border-border border-t p-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            controller.setTrash(true);
                            controller.setSearch('');
                        }}
                        className={cn(
                            'flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs transition-colors',
                            trash ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                        )}
                    >
                        <Trash2 className="size-3.5" />
                        <span className="flex-1 text-left">Trash</span>
                        {trashCount > 0 ? <span className="text-[10px] tabular-nums opacity-60">{trashCount}</span> : null}
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-border flex flex-wrap items-center gap-2 border-b px-3 py-2">
                    <nav aria-label="Folder path" className="flex min-w-0 items-center gap-1 text-xs">
                        {trash ? (
                            <span className="font-medium text-foreground">Trash</span>
                        ) : (
                            breadcrumbs.map((crumb, index) => (
                                <span key={`${crumb.id ?? 'root'}-${index}`} className="flex min-w-0 items-center gap-1">
                                    {index > 0 ? <ChevronRight className="text-muted-foreground size-3 shrink-0" /> : null}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            controller.setTrash(false);
                                            controller.setSearch('');
                                            controller.setCurrentFolderId(crumb.id);
                                        }}
                                        className={cn(
                                            'truncate rounded px-1 py-0.5 transition',
                                            index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        {crumb.name}
                                    </button>
                                </span>
                            ))
                        )}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {toolbarExtra}

                        <div className="relative hidden items-center md:flex">
                            <Search className="text-muted-foreground absolute left-2.5 size-3.5" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => controller.setSearch(event.target.value)}
                                placeholder="Search files…"
                                className="border-border bg-muted/40 focus:border-primary/50 h-8 w-44 rounded-md border pl-8 pr-7 text-xs outline-none transition"
                            />
                            {search ? (
                                <button
                                    type="button"
                                    onClick={() => controller.setSearch('')}
                                    className="text-muted-foreground hover:text-foreground absolute right-2"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : null}
                        </div>

                        <div className="border-border bg-muted/40 flex items-center rounded-md border p-0.5">
                            {(['grid', 'list'] as MediaExplorerView[]).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => controller.setView(mode)}
                                    aria-label={mode === 'grid' ? 'Grid view' : 'List view'}
                                    aria-pressed={view === mode}
                                    className={cn('rounded p-1.5 transition', view === mode ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
                                >
                                    {mode === 'grid' ? <Grid2x2 className="size-3.5" /> : <List className="size-3.5" />}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={startFolder}
                            className="border-border text-muted-foreground hover:text-foreground hidden h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition sm:inline-flex"
                        >
                            <FolderPlus className="size-3.5" />
                            New folder
                        </button>

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={uploading}
                            onChange={(event) => {
                                if (event.target.files?.length) void controller.upload(event.target.files);
                                event.target.value = '';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold shadow-xs transition disabled:opacity-60"
                        >
                            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                            Upload
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="mx-3 mt-2 flex items-start justify-between gap-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
                        <span>{error}</span>
                        <button type="button" onClick={() => controller.setError(null)} aria-label="Dismiss">
                            <X className="size-3.5" />
                        </button>
                    </div>
                ) : null}

                <div
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                        setDragActive(true);
                    }}
                    onDragLeave={(event) => {
                        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                        setDragActive(false);
                    }}
                    onDrop={handleDrop}
                    className="relative min-h-0 flex-1 overflow-y-auto p-3"
                >
                    {loading ? (
                        view === 'grid' ? (
                            <MediaGridSkeleton />
                        ) : (
                            <MediaListSkeleton />
                        )
                    ) : visibleAssets.length === 0 ? (
                        <div className="border-border text-muted-foreground flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs">
                            <Image className="size-5" />
                            {emptyMessage}
                        </div>
                    ) : view === 'grid' ? (
                        <MediaGridView assets={visibleAssets} controller={controller} onSelect={onSelect} cardExtra={cardExtra} processing={processing} />
                    ) : (
                        <MediaListView assets={visibleAssets} controller={controller} onSelect={onSelect} onCopyLink={copyLink} copiedId={copiedId} />
                    )}

                    {dragActive ? (
                        <div className="border-primary bg-primary/10 pointer-events-none absolute inset-2 z-30 flex items-center justify-center rounded-xl border-2 border-dashed text-xs font-semibold text-primary">
                            Drop to upload or move here
                        </div>
                    ) : null}
                </div>
            </div>

            <PromptDialog
                open={folderPromptOpen}
                title="New folder"
                description={`Create a folder ${currentFolderId === null ? 'in the library root' : 'here'}.`}
                label="Folder name"
                placeholder="e.g. Brand assets"
                confirmLabel="Create folder"
                error={folderPromptError}
                onCancel={() => {
                    setFolderPromptOpen(false);
                    setFolderPromptError(null);
                }}
                onSubmit={submitFolder}
            />
        </div>
    );
}
