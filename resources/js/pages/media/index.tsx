import { Check, Copy, Image, Loader2, Plus, Search, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminResourcePage, ResourceEmpty } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';

interface MediaAsset {
    id: number;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    width: number | null;
    height: number | null;
    altText: string | null;
    status: string;
    url: string;
    uploadedAt: string | null;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Media({ media }: { media: MediaAsset[] }) {
    const [assets, setAssets] = useState(media);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append('file', file);
            const response = await fetch(route('builder.media.store'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: form,
            });
            const payload = (await response.json()) as { media?: MediaAsset; message?: string };
            if (!response.ok || !payload.media) throw new Error(payload.message ?? 'The media upload failed.');
            setAssets((current) => [payload.media!, ...current]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'The media upload failed.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const copyUrl = (id: number, url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            return (
                asset.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [assets, searchQuery]);

    return (
        <AdminResourcePage
            title="Media Library"
            description="Upload, organize, and manage image assets and graphics for your website canvas."
            empty="No media assets yet."
            icon={Image}
        >
            <div className="space-y-6">
                {/* Upload & Search Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-neutral-200/70 bg-white p-3.5 shadow-xs">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search assets by file name..."
                            className="w-full rounded-full border border-neutral-200/80 bg-neutral-50/70 py-2 pl-9.5 pr-4 text-xs font-medium text-foreground placeholder:text-neutral-400 outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void upload(file);
                            }}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-5 gap-2 shadow-xs transition active:scale-98"
                            disabled={uploading}
                            onClick={() => inputRef.current?.click()}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="size-4" />
                                    <span>Upload Asset</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive font-medium" role="alert">
                        {error}
                    </div>
                ) : null}

                {/* Media Assets Grid */}
                {filteredAssets.length === 0 ? (
                    <ResourceEmpty
                        message={assets.length === 0 ? 'No media assets uploaded yet.' : 'No media assets match your search.'}
                        action={{ label: 'Upload Image', href: '#' }}
                        icon={Image}
                    />
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredAssets.map((asset) => (
                            <div
                                key={asset.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-neutral-200/70 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                            >
                                {/* Thumbnail Image */}
                                <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-neutral-100/80 border border-neutral-100 flex items-center justify-center">
                                    {asset.mimeType.startsWith('image/') ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.altText || asset.originalFilename}
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Image className="size-8 text-muted-foreground/60" />
                                    )}

                                    {/* Mime Badge */}
                                    <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                                        {asset.mimeType.replace('image/', '')}
                                    </span>

                                    {/* Dimensions Badge */}
                                    {asset.width && asset.height ? (
                                        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-mono font-medium text-white backdrop-blur-xs">
                                            {asset.width}x{asset.height}
                                        </span>
                                    ) : null}
                                </div>

                                {/* Metadata & Actions */}
                                <div className="p-2.5 pt-3">
                                    <h4 className="truncate text-xs font-bold text-foreground group-hover:text-primary transition" title={asset.originalFilename}>
                                        {asset.originalFilename}
                                    </h4>
                                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>{formatBytes(asset.fileSize)}</span>
                                        <button
                                            type="button"
                                            onClick={() => copyUrl(asset.id, asset.url)}
                                            className="flex items-center gap-1 font-semibold text-primary hover:underline"
                                            title="Copy public URL"
                                        >
                                            {copiedId === asset.id ? (
                                                <>
                                                    <Check className="size-3 text-emerald-600" />
                                                    <span className="text-emerald-600">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3" />
                                                    <span>Copy URL</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminResourcePage>
    );
}
