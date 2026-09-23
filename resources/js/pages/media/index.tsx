import { Image } from 'lucide-react';
import { useRef, useState } from 'react';

import { AdminResourcePage, ResourceCard, ResourceEmpty } from '@/components/admin-resource-page';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            title="Media"
            description="Review the media assets available to the visual builder."
            empty="No media assets yet."
            icon={Image}
        >
            <ResourceCard>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle>Media library</CardTitle>
                        <CardDescription>Assets owned by your workspace.</CardDescription>
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
                        <button
                            type="button"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium"
                            disabled={uploading}
                            onClick={() => inputRef.current?.click()}
                        >
                            {uploading ? 'Uploading...' : 'Upload media'}
                        </button>
                    </>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <p className="text-destructive mb-4 text-sm" role="alert">
                            {error}
                        </p>
                    ) : null}
                    {assets.length === 0 ? (
                        <ResourceEmpty message="No media assets yet." action={{ label: 'Open builder', href: route('builder') }} />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {assets.map((asset) => (
                                <div key={asset.id} className="border-border overflow-hidden rounded-lg border">
                                    <div className="bg-muted flex aspect-video items-center justify-center">
                                        {asset.mimeType.startsWith('image/') ? (
                                            <img src={asset.url} alt={asset.altText || asset.originalFilename} className="size-full object-cover" />
                                        ) : (
                                            <Image className="text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm font-medium">{asset.originalFilename}</p>
                                        <p className="text-muted-foreground mt-1 truncate text-xs">
                                            {asset.mimeType} · {asset.fileSize} bytes
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </ResourceCard>
        </AdminResourcePage>
    );
}
