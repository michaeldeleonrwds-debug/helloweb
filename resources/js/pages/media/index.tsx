import { Image, Loader2, Plus, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

import { AdminResourcePage, ResourceEmpty } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

    return (
        <AdminResourcePage
            title="Media Library"
            description="Upload, inspect, and manage photos, icons, and graphic assets for use across your website builder."
            empty="No media assets yet."
            icon={Image}
        >
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Asset Gallery</CardTitle>
                        <CardDescription className="text-xs">
                            {assets.length} file{assets.length === 1 ? '' : 's'} uploaded and ready for canvas insertion.
                        </CardDescription>
                    </div>
                    <>
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
                            className="shadow-xs font-semibold gap-1.5"
                            disabled={uploading}
                            onClick={() => inputRef.current?.click()}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="size-4" />
                                    Upload Image
                                </>
                            )}
                        </Button>
                    </>
                </CardHeader>
                <CardContent className="p-6">
                    {error ? (
                        <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium" role="alert">
                            {error}
                        </div>
                    ) : null}

                    {assets.length === 0 ? (
                        <ResourceEmpty
                            message="No media assets uploaded yet."
                            action={{ label: 'Upload your first image', href: '#' }}
                            icon={Image}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="group overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="relative bg-muted/30 flex aspect-video items-center justify-center overflow-hidden border-b border-border/60">
                                        {asset.mimeType.startsWith('image/') ? (
                                            <img
                                                src={asset.url}
                                                alt={asset.altText || asset.originalFilename}
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <Image className="size-8 text-muted-foreground/60" />
                                        )}
                                        {asset.width && asset.height ? (
                                            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                                                {asset.width}x{asset.height}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition" title={asset.originalFilename}>
                                            {asset.originalFilename}
                                        </p>
                                        <p className="text-muted-foreground mt-1 truncate text-[11px]">
                                            {formatBytes(asset.fileSize)} · {asset.mimeType.replace('image/', '').toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminResourcePage>
    );
}
