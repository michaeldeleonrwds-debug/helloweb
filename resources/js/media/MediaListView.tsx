import { Check, Copy, Image, RotateCcw, Trash2 } from 'lucide-react';

import { AssetContextMenu, startAssetDrag } from './AssetContextMenu';
import { formatBytes, formatDimensions } from './format';
import type { MediaAssetItem } from './types';
import type { MediaExplorerController } from './useMediaExplorer';

interface MediaListViewProps {
    assets: MediaAssetItem[];
    controller: MediaExplorerController;
    onSelect?: (asset: MediaAssetItem) => void;
    onCopyLink?: (asset: MediaAssetItem) => void;
    copiedId?: number | null;
}

export function MediaListView({ assets, controller, onSelect, onCopyLink, copiedId }: MediaListViewProps) {
    return (
        <div className="divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
            <div className="text-muted-foreground border-border/60 grid grid-cols-[1fr_auto] gap-3 border-b px-3 py-2 text-[10px] font-semibold tracking-wider uppercase sm:grid-cols-[minmax(0,2fr)_100px_100px_90px_120px]">
                <span>Name</span>
                <span className="hidden sm:block">Size</span>
                <span className="hidden sm:block">Dimensions</span>
                <span className="hidden sm:block">Type</span>
                <span className="text-right sm:text-left">Actions</span>
            </div>

            {assets.map((asset) => (
                <AssetContextMenu key={asset.id} asset={asset} controller={controller} onSelect={onSelect}>
                    <div
                        role="button"
                        tabIndex={0}
                        draggable
                        onDragStart={(event) => startAssetDrag(asset, event)}
                        onClick={() => onSelect?.(asset)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect?.(asset);
                            }
                        }}
                        className="hover:bg-accent/50 grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 border-b border-border/40 px-3 py-2 transition-colors last:border-b-0 sm:grid-cols-[minmax(0,2fr)_100px_100px_90px_120px]"
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="bg-muted/60 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60">
                                {asset.url ? <img src={asset.url} alt="" loading="lazy" className="size-full object-cover" /> : <Image className="size-3.5 text-muted-foreground" />}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-xs font-medium text-foreground" title={asset.originalFilename}>
                                    {asset.originalFilename}
                                </span>
                                <span className="text-muted-foreground block truncate text-[10px]">
                                    {asset.uploadedAt ? new Date(asset.uploadedAt).toLocaleDateString() : ''}
                                    {asset.status === 'archived' ? ' · in trash' : ''}
                                </span>
                            </span>
                        </div>

                        <span className="text-muted-foreground hidden text-xs tabular-nums sm:block">{formatBytes(asset.fileSize)}</span>
                        <span className="text-muted-foreground hidden text-xs tabular-nums sm:block">{formatDimensions(asset) || '—'}</span>
                        <span className="text-muted-foreground hidden truncate text-xs sm:block">{asset.mimeType?.replace('image/', '')}</span>

                        <div className="flex items-center justify-end gap-1 sm:justify-start" onClick={(event) => event.stopPropagation()}>
                            <button
                                type="button"
                                title="Copy link"
                                onClick={() => onCopyLink?.(asset)}
                                className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition"
                            >
                                {copiedId === asset.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                            </button>
                            {asset.status === 'archived' ? (
                                <button
                                    type="button"
                                    title="Restore"
                                    onClick={() => void controller.restoreAsset(asset.id).catch((caught: unknown) => controller.setError(caught instanceof Error ? caught.message : 'Could not restore the file.'))}
                                    className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition"
                                >
                                    <RotateCcw className="size-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    title="Move to trash"
                                    onClick={() => void controller.archiveAsset(asset.id).catch((caught: unknown) => controller.setError(caught instanceof Error ? caught.message : 'Could not move the file to the trash.'))}
                                    className="text-muted-foreground hover:text-destructive rounded-md p-1.5 transition"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </AssetContextMenu>
            ))}
        </div>
    );
}
