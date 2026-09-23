import { Check, Image, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import type { MediaAsset } from '../persistence';

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
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const asset = await onUpload(file);
            onSelect(asset);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The image upload failed.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Media manager"
        >
            <div className="border-border bg-card text-card-foreground flex max-h-[min(680px,calc(100vh-3rem))] w-full max-w-3xl flex-col rounded-xl border shadow-2xl">
                <div className="border-border flex items-center justify-between border-b px-5 py-4">
                    <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Library</p>
                        <h2 className="mt-1 text-base font-semibold">Media manager</h2>
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
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <p className="text-muted-foreground text-xs">Choose an image for this element or upload a new asset.</p>
                        <>
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
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium"
                                disabled={uploading}
                                onClick={() => inputRef.current?.click()}
                            >
                                <Upload className="size-3.5" />
                                {uploading ? 'Uploading...' : 'Upload image'}
                            </button>
                        </>
                    </div>
                    {error ? (
                        <p className="text-destructive mb-4 text-xs" role="alert">
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
                            {assets.map((asset) => (
                                <button
                                    key={asset.id}
                                    type="button"
                                    className="border-border hover:border-primary group overflow-hidden rounded-lg border text-left transition"
                                    onClick={() => onSelect(asset)}
                                >
                                    <div className="bg-muted relative flex aspect-square items-center justify-center">
                                        {asset.url ? (
                                            <img src={asset.url} alt={asset.altText ?? asset.originalFilename} className="size-full object-cover" />
                                        ) : (
                                            <Image className="text-muted-foreground size-5" />
                                        )}
                                        <span className="bg-primary text-primary-foreground absolute right-2 bottom-2 hidden rounded-full p-1 group-hover:block">
                                            <Check className="size-3" />
                                        </span>
                                    </div>
                                    <p className="truncate px-2 py-2 text-[11px]" title={asset.originalFilename}>
                                        {asset.originalFilename}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
