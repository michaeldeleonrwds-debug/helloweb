import { Loader2, Sparkles, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MediaExplorer } from '@/media/MediaExplorer';
import type { MediaAssetItem } from '@/media/types';

import type { MediaAsset } from '../persistence';
import { convertImageToWebp, removeImageBackground } from '../utils/image-processing';

export function MediaManager({
    assets,
    onUpload,
    onSelect,
    onClose,
}: {
    assets: MediaAsset[];
    onUpload: (file: File, folderId?: number | null) => Promise<MediaAsset>;
    onSelect: (asset: MediaAsset) => void;
    onClose: () => void;
}) {
    const [status, setStatus] = useState<string | null>(null);
    // AI & Optimization Options
    const [convertToWebp, setConvertToWebp] = useState(true);
    const [removeBg, setRemoveBg] = useState(false);

    // Per-asset operation tracking
    const [processing, setProcessing] = useState<{ assetId: number | null; label: string | null }>({ assetId: null, label: null });

    const uploadWithPipeline = async (file: File, folderId: number | null): Promise<MediaAssetItem> => {
        try {
            let processedFile = file;

            if (removeBg) {
                setStatus('AI: Removing background…');
                processedFile = await removeImageBackground(file, {
                    format: convertToWebp ? 'image/webp' : 'image/png',
                    onProgress: (stage, percent) => setStatus(`${stage} (${percent}%)`),
                });
            } else if (convertToWebp && !file.type.includes('webp') && !file.name.toLowerCase().endsWith('.webp')) {
                setStatus('Optimizing to WebP…');
                processedFile = await convertImageToWebp(file);
            }

            setStatus('Uploading…');
            return await onUpload(processedFile, folderId);
        } finally {
            setStatus(null);
        }
    };

    const handleRemoveBackground = async (asset: MediaAssetItem) => {
        if (!asset.url) return;
        setProcessing({ assetId: asset.id, label: 'AI Cutout…' });
        try {
            const cutoutFile = await removeImageBackground(asset.url, {
                format: 'image/webp',
                fileName: asset.originalFilename,
                onProgress: (_stage, percent) => setProcessing({ assetId: asset.id, label: `Cutout ${percent}%` }),
            });
            const created = await onUpload(cutoutFile, asset.folderId ?? null);
            onSelect(created);
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'AI background removal failed.');
        } finally {
            setProcessing({ assetId: null, label: null });
        }
    };

    const handleConvertToWebp = async (asset: MediaAssetItem) => {
        if (!asset.url) return;
        setProcessing({ assetId: asset.id, label: 'To WebP…' });
        try {
            const webpFile = await convertImageToWebp(asset.url, { fileName: asset.originalFilename });
            const created = await onUpload(webpFile, asset.folderId ?? null);
            onSelect(created);
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : 'WebP conversion failed.');
        } finally {
            setProcessing({ assetId: null, label: null });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Media manager">
            <div className="border-border bg-card text-card-foreground flex h-[85vh] w-[80vw] max-w-[80vw] min-w-[640px] flex-col overflow-hidden rounded-xl border shadow-2xl">
                <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-3.5">
                    <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Library</p>
                        <h2 className="mt-0.5 text-base font-semibold">Media Manager</h2>
                    </div>
                    <button type="button" className="text-muted-foreground hover:text-foreground rounded-md p-1" onClick={onClose} aria-label="Close media manager">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1">
                    <MediaExplorer
                        initialAssets={assets}
                        uploadFile={uploadWithPipeline}
                        onSelect={(asset) => onSelect(asset)}
                        processing={processing}
                        className="h-full"
                        toolbarExtra={
                            <div className="flex items-center gap-3">
                                {status ? (
                                    <span className="text-muted-foreground hidden items-center gap-1 text-[11px] lg:inline-flex">
                                        <Loader2 className="size-3 animate-spin" />
                                        {status}
                                    </span>
                                ) : null}

                                <label className="flex cursor-pointer items-center gap-1.5 select-none">
                                    <input
                                        type="checkbox"
                                        checked={convertToWebp}
                                        onChange={(event) => setConvertToWebp(event.target.checked)}
                                        className="border-border text-primary focus:ring-primary/20 size-3.5 rounded"
                                    />
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                                        <Zap className="size-3 shrink-0 text-amber-500" />
                                        WebP
                                    </span>
                                </label>

                                <label className="flex cursor-pointer items-center gap-1.5 select-none">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(event) => setRemoveBg(event.target.checked)}
                                        className="border-border text-primary focus:ring-primary/20 size-3.5 rounded"
                                    />
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                                        <Sparkles className="text-primary size-3 shrink-0" />
                                        AI cutout
                                    </span>
                                </label>
                            </div>
                        }
                        cardExtra={(asset) => {
                            const isWebp = asset.originalFilename.toLowerCase().endsWith('.webp') || (asset.mimeType?.includes('webp') ?? false);
                            return (
                                <>
                                    <button
                                        type="button"
                                        title="Remove background with in-browser AI and select"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleRemoveBackground(asset);
                                        }}
                                        className="bg-primary/95 text-primary-foreground hover:bg-primary inline-flex flex-1 items-center justify-center gap-1 rounded py-1 text-[9px] font-semibold shadow-xs transition"
                                    >
                                        Cutout
                                    </button>
                                    {!isWebp ? (
                                        <button
                                            type="button"
                                            title="Convert to WebP and select"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                void handleConvertToWebp(asset);
                                            }}
                                            className="bg-amber-600/95 hover:bg-amber-600 inline-flex flex-1 items-center justify-center gap-1 rounded py-1 text-[9px] font-semibold text-white shadow-xs transition"
                                        >
                                            WebP
                                        </button>
                                    ) : null}
                                </>
                            );
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
