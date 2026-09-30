import { Image } from 'lucide-react';

import { AdminResourcePage } from '@/components/admin-resource-page';
import { MediaExplorer } from '@/media/MediaExplorer';
import type { MediaAssetItem, MediaFolderNode } from '@/media/types';

export default function Media({
    media,
    folders,
}: {
    media: MediaAssetItem[];
    folders: MediaFolderNode[];
}) {
    return (
        <AdminResourcePage
            title="Media Library"
            description="Upload, organize, and manage image assets and graphics for your website canvas."
            empty="No media assets yet."
            icon={Image}
        >
            <div className="border-border bg-card h-[calc(100vh-260px)] min-h-[520px] overflow-hidden rounded-[20px] border shadow-xs">
                <MediaExplorer initialAssets={media} initialFolders={folders} />
            </div>
        </AdminResourcePage>
    );
}
