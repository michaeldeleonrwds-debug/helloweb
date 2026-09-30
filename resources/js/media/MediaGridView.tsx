import { Check, Image, Loader2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { AssetContextMenu, startAssetDrag } from './AssetContextMenu';
import { formatBytes, formatDimensions } from './format';
import type { MediaAssetItem } from './types';
import type { MediaExplorerController } from './useMediaExplorer';

interface MediaGridViewProps {
    assets: MediaAssetItem[];
    controller: MediaExplorerController;
    onSelect?: (asset: MediaAssetItem) => void;
    cardExtra?: (asset: MediaAssetItem) => ReactNode;
    processing?: { assetId: number | null; label: string | null };
}

export function MediaGridView({ assets, controller, onSelect, cardExtra, processing }: MediaGridViewProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {assets.map((asset) => {
                const isCutout = asset.originalFilename.toLowerCase().includes('-nobg');
                const isWebp = asset.originalFilename.toLowerCase().endsWith('.webp') || (asset.mimeType?.includes('webp') ?? false);
                const badge = asset.originalFilename.split('.').pop()?.toUpperCase() || (isWebp ? 'WEBP' : 'IMG');
                const isProcessing = processing?.assetId === asset.id;

                return (
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
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs transition hover:border-primary/60 hover:shadow-xs"
                        >
                            <div className="bg-muted/40 relative flex aspect-square items-center justify-center overflow-hidden">
                                {asset.url ? (
                                    <img
                                        src={asset.url}
                                        alt={asset.altText ?? asset.originalFilename}
                                        loading="lazy"
                                        className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                ) : (
                                    <Image className="text-muted-foreground size-5" />
                                )}

                                <div className="pointer-events-none absolute top-1.5 left-1.5 flex items-center gap-1">
                                    <span className="rounded bg-black/65 px-1 py-0.5 font-mono text-[8px] font-bold text-white uppercase backdrop-blur-xs">{badge}</span>
                                    {isCutout ? (
                                        <span className="flex items-center gap-0.5 rounded bg-emerald-600/90 px-1 py-0.5 text-[8px] font-semibold text-white backdrop-blur-xs">
                                            <Sparkles className="size-2" />
                                            Cutout
                                        </span>
                                    ) : null}
                                </div>

                                {asset.status === 'archived' ? (
                                    <span className="pointer-events-none absolute top-1.5 right-1.5 rounded bg-black/65 px-1 py-0.5 text-[8px] font-semibold text-white backdrop-blur-xs">Trash</span>
                                ) : null}

                                {asset.fileSize ? (
                                    <span className="pointer-events-none absolute right-1 bottom-1 rounded bg-black/65 px-1 font-mono text-[8px] text-white/90 backdrop-blur-xs">{formatBytes(asset.fileSize)}</span>
                                ) : null}

                                {onSelect ? (
                                    <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 hidden rounded-full p-1 shadow-xs group-hover:block">
                                        <Check className="size-3" />
                                    </span>
                                ) : null}

                                {isProcessing ? (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 bg-black/75 p-2 text-center text-white">
                                        <Loader2 className="text-primary size-5 animate-spin" />
                                        <span className="text-[10px] font-medium leading-tight">{processing?.label}</span>
                                    </div>
                                ) : null}

                                {cardExtra && !isProcessing ? (
                                    <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">{cardExtra(asset)}</div>
                                ) : null}
                            </div>

                            <div className="px-2 py-1.5">
                                <p className="truncate text-[11px] font-medium text-foreground" title={asset.originalFilename}>
                                    {asset.originalFilename}
                                </p>
                                <p className="text-muted-foreground truncate text-[10px] tabular-nums">
                                    {[formatDimensions(asset), asset.mimeType?.replace('image/', '')].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                        </div>
                    </AssetContextMenu>
                );
            })}
        </div>
    );
}
