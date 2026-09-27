import {
    Check,
    Image,
    Loader2,
    Sparkles,
    Upload,
    Wand2,
    X,
    Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';

import type { MediaAsset } from '../persistence';
import { convertImageToWebp, removeImageBackground } from '../utils/image-processing';

export function MediaManager({
    assets,
    onUpload,
    onSelect,
    onClose,
}: {
    assets: MediaAsset[];
    onUpload: (file: File) => Promise<MediaAsset>;
    onSelect: (asset: MediaAsset) => void;
    onClose: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // AI & Optimization Options
    const [convertToWebp, setConvertToWebp] = useState(true);
    const [removeBg, setRemoveBg] = useState(false);

    // Per-asset operation tracking
    const [processingAssetId, setProcessingAssetId] = useState<number | null>(null);
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            let processedFile = file;

            if (removeBg) {
                setUploadStatus('AI: Removing background...');
                processedFile = await removeImageBackground(file, {
                    format: convertToWebp ? 'image/webp' : 'image/png',
                    onProgress: (stage, percent) => {
                        setUploadStatus(`${stage} (${percent}%)`);
                    },
                });
            } else if (convertToWebp && !file.type.includes('webp') && !file.name.toLowerCase().endsWith('.webp')) {
                setUploadStatus('Optimizing to WebP...');
                processedFile = await convertImageToWebp(file);
            }

            setUploadStatus('Uploading to cloud...');
            const asset = await onUpload(processedFile);
            onSelect(asset);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The image upload failed.');
        } finally {
            setUploading(false);
            setUploadStatus(null);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleRemoveBackgroundFromAsset = async (asset: MediaAsset, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!asset.url) return;
        setProcessingAssetId(asset.id);
        setProcessingAction('AI Cutout...');
        setError(null);
        try {
            const cutoutFile = await removeImageBackground(asset.url, {
                format: 'image/webp',
                fileName: asset.originalFilename,
                onProgress: (_stage, percent) => {
                    setProcessingAction(`Cutout ${percent}%`);
                },
            });
            const newAsset = await onUpload(cutoutFile);
            onSelect(newAsset);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'AI background removal failed.');
        } finally {
            setProcessingAssetId(null);
            setProcessingAction(null);
        }
    };

    const handleConvertToWebpFromAsset = async (asset: MediaAsset, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!asset.url) return;
        setProcessingAssetId(asset.id);
        setProcessingAction('To WebP...');
        setError(null);
        try {
            const webpFile = await convertImageToWebp(asset.url, {
                fileName: asset.originalFilename,
            });
            const newAsset = await onUpload(webpFile);
            onSelect(newAsset);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'WebP conversion failed.');
        } finally {
            setProcessingAssetId(null);
            setProcessingAction(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label="Media manager"
        >
            <div className="border-border bg-card text-card-foreground flex max-h-[min(700px,calc(100vh-3rem))] w-full max-w-3xl flex-col rounded-xl border shadow-2xl">
                <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
                    <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Library</p>
                        <h2 className="mt-0.5 text-base font-semibold">Media Manager</h2>
                    </div>
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground rounded-md p-1"
                        onClick={onClose}
                        aria-label="Close media manager"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Header Controls: Upload and Optimization Settings */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">Choose an image from your library or upload a new asset.</p>
                            <div className="flex items-center gap-4 pt-0.5">
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground select-none">
                                    <input
                                        type="checkbox"
                                        checked={convertToWebp}
                                        onChange={(e) => setConvertToWebp(e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-primary/20 size-3.5"
                                    />
                                    <span className="inline-flex items-center gap-1 font-medium text-[11px]">
                                        <Zap className="size-3 text-amber-500 shrink-0" />
                                        Auto-convert to WebP
                                    </span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground select-none">
                                    <input
                                        type="checkbox"
                                        checked={removeBg}
                                        onChange={(e) => setRemoveBg(e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-primary/20 size-3.5"
                                    />
                                    <span className="inline-flex items-center gap-1 font-medium text-[11px]">
                                        <Sparkles className="size-3 text-primary shrink-0" />
                                        AI Background Remover
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) void upload(file);
                                }}
                            />
                            <button
                                type="button"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold shadow-xs"
                                disabled={uploading}
                                onClick={() => inputRef.current?.click()}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        {uploadStatus ?? 'Uploading...'}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="size-3.5" />
                                        Upload Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <p className="text-destructive text-xs" role="alert">
                            {error}
                        </p>
                    ) : null}

                    {assets.length === 0 ? (
                        <div className="border-border text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs">
                            <Image className="size-5" />
                            No media assets yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {assets.map((asset) => {
                                const isCutout = asset.originalFilename.toLowerCase().includes('-nobg');
                                const assetIsWebp =
                                    asset.originalFilename.toLowerCase().endsWith('.webp') ||
                                    (asset.mimeType?.includes('webp') ?? false);
                                const formatBadge =
                                    asset.originalFilename.split('.').pop()?.toUpperCase() || (assetIsWebp ? 'WEBP' : 'IMG');
                                const isProcessing = processingAssetId === asset.id;

                                return (
                                    <div
                                        key={asset.id}
                                        className="group relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs transition hover:border-primary/60 hover:shadow-xs flex flex-col text-left cursor-pointer"
                                        onClick={() => onSelect(asset)}
                                    >
                                        <div className="bg-muted/40 relative flex aspect-square items-center justify-center overflow-hidden">
                                            {asset.url ? (
                                                <img
                                                    src={asset.url}
                                                    alt={asset.altText ?? asset.originalFilename}
                                                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                            ) : (
                                                <Image className="text-muted-foreground size-5" />
                                            )}

                                            {/* Badges: Format & Cutout */}
                                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 pointer-events-none">
                                                <span className="rounded bg-black/65 px-1 py-0.5 text-[8px] font-mono font-bold text-white uppercase backdrop-blur-xs">
                                                    {formatBadge}
                                                </span>
                                                {isCutout ? (
                                                    <span className="rounded bg-emerald-600/90 px-1 py-0.5 text-[8px] font-semibold text-white backdrop-blur-xs flex items-center gap-0.5">
                                                        <Sparkles className="size-2" />
                                                        Cutout
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* File Size */}
                                            {asset.fileSize ? (
                                                <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1 text-[8px] font-mono text-white/90 backdrop-blur-xs pointer-events-none">
                                                    {formatFileSize(asset.fileSize)}
                                                </span>
                                            ) : null}

                                            {/* Selection Hover Icon */}
                                            <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 hidden rounded-full p-1 group-hover:block shadow-xs">
                                                <Check className="size-3" />
                                            </span>

                                            {/* Processing Spinner Overlay */}
                                            {isProcessing ? (
                                                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1 p-2 text-center text-white z-20">
                                                    <Loader2 className="size-5 animate-spin text-primary" />
                                                    <span className="text-[10px] font-medium leading-tight">{processingAction}</span>
                                                </div>
                                            ) : null}

                                            {/* Quick Action Buttons (Hover) */}
                                            {!isProcessing ? (
                                                <div className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                                                    <button
                                                        type="button"
                                                        title="Remove background with in-browser AI and select"
                                                        onClick={(e) => void handleRemoveBackgroundFromAsset(asset, e)}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-primary/95 hover:bg-primary text-primary-foreground py-1 text-[9px] font-semibold shadow-xs transition"
                                                    >
                                                        <Wand2 className="size-2.5" />
                                                        Cutout
                                                    </button>
                                                    {!assetIsWebp ? (
                                                        <button
                                                            type="button"
                                                            title="Convert to WebP and select"
                                                            onClick={(e) => void handleConvertToWebpFromAsset(asset, e)}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-amber-600/95 hover:bg-amber-600 text-white py-1 text-[9px] font-semibold shadow-xs transition"
                                                        >
                                                            <Zap className="size-2.5" />
                                                            WebP
                                                        </button>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>

                                        <p className="truncate px-2 py-1.5 text-[11px] font-medium text-foreground" title={asset.originalFilename}>
                                            {asset.originalFilename}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
