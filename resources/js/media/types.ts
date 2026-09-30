import type { MediaAsset } from '@/builder/persistence';

export interface MediaAssetItem extends MediaAsset {
    folderId?: number | null;
    uploadedAt?: string | null;
}

export interface MediaFolderNode {
    id: number;
    name: string;
    parentId: number | null;
    assetCount: number;
    children: MediaFolderNode[];
}

export interface MediaExplorerSelection {
    asset: MediaAssetItem;
}

export type MediaExplorerView = 'grid' | 'list';

export interface MediaExplorerErrorBody {
    message?: string;
    errors?: Record<string, string[]>;
}

export const MEDIA_ASSET_DRAG_TYPE = 'application/x-media-asset';
export const MEDIA_FOLDER_DRAG_TYPE = 'application/x-media-folder';
