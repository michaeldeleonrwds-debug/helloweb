import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { requestJson } from './api';
import { flattenFolders } from './tree-utils';
import type { MediaAssetItem, MediaExplorerView, MediaFolderNode } from './types';

interface IndexPayload {
    media: MediaAssetItem[];
    folders: MediaFolderNode[];
}

export interface UseMediaExplorerOptions {
    initialAssets?: MediaAssetItem[];
    initialFolders?: MediaFolderNode[];
    uploadFile?: (file: File, folderId: number | null) => Promise<MediaAssetItem>;
    fetchOnInit?: boolean;
}

function defaultUpload(file: File, folderId: number | null): Promise<MediaAssetItem> {
    const form = new FormData();
    form.append('file', file);
    if (folderId !== null) form.append('folder_id', String(folderId));

    return requestJson<{ media: MediaAssetItem }>(route('builder.media.store'), { method: 'POST', body: form }).then(
        (payload) => payload.media,
    );
}

export function useMediaExplorer(options: UseMediaExplorerOptions = {}) {
    const { initialAssets, initialFolders, uploadFile, fetchOnInit = true } = options;

    const [assets, setAssets] = useState<MediaAssetItem[]>(initialAssets ?? []);
    const [folderNodes, setFolderNodes] = useState<MediaFolderNode[]>(initialFolders ?? []);
    const [loading, setLoading] = useState(fetchOnInit && initialFolders === undefined);
    const [error, setError] = useState<string | null>(null);

    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<MediaExplorerView>('grid');
    const [trash, setTrash] = useState(false);
    const [uploading, setUploading] = useState(false);

    const uploadRef = useRef<(file: File, folderId: number | null) => Promise<MediaAssetItem>>(uploadFile ?? defaultUpload);
    uploadRef.current = uploadFile ?? defaultUpload;

    const refresh = useCallback(async () => {
        try {
            const payload = await requestJson<IndexPayload>(`${route('builder.media.index')}?status=all`);
            setAssets(payload.media);
            setFolderNodes(payload.folders);
            setError(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Could not load your media library.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!fetchOnInit) {
            setLoading(false);
            return;
        }

        if (initialFolders !== undefined && initialAssets !== undefined) {
            setLoading(false);
            return;
        }

        void refresh();
    }, [fetchOnInit, initialAssets, initialFolders, refresh]);

    /**
     * Folder counts are derived from `assets` rather than trusted from the
     * server payload, so dragging an image between folders updates the badge
     * immediately without a refetch. Only active assets count, matching the
     * `withCount(... status = active)` query behind the API payload.
     */
    const folders = useMemo(() => {
        const counts = new Map<number, number>();
        for (const asset of assets) {
            if (asset.status !== 'active') continue;
            const folderId = asset.folderId ?? null;
            if (folderId === null) continue;
            counts.set(folderId, (counts.get(folderId) ?? 0) + 1);
        }

        const apply = (nodes: MediaFolderNode[]): MediaFolderNode[] =>
            nodes.map((node) => ({ ...node, assetCount: counts.get(node.id) ?? 0, children: apply(node.children) }));

        return apply(folderNodes);
    }, [assets, folderNodes]);

    const flatFolders = useMemo(() => flattenFolders(folders), [folders]);

    const breadcrumbs = useMemo(() => {
        const trail: { id: number | null; name: string }[] = [{ id: null, name: 'Library' }];
        if (currentFolderId === null) return trail;

        const chain: MediaFolderNode[] = [];
        const lookup = new Map(flatFolders.map((entry) => [entry.folder.id, entry.folder]));
        let cursor = lookup.get(currentFolderId);
        let guard = 0;

        while (cursor && guard < 50) {
            chain.unshift(cursor);
            cursor = cursor.parentId === null ? undefined : lookup.get(cursor.parentId);
            guard++;
        }

        return [...trail, ...chain.map((folder) => ({ id: folder.id, name: folder.name }))];
    }, [currentFolderId, flatFolders]);

    const visibleAssets = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return assets.filter((asset) => {
            if (trash) return asset.status === 'archived';
            if (asset.status !== 'active') return false;
            if (needle) return asset.originalFilename.toLowerCase().includes(needle);
            return (asset.folderId ?? null) === currentFolderId;
        });
    }, [assets, currentFolderId, search, trash]);

    const trashCount = useMemo(() => assets.filter((asset) => asset.status === 'archived').length, [assets]);

    const fail = useCallback((caught: unknown, fallback: string) => {
        const message = caught instanceof Error ? caught.message : fallback;
        setError(message);
        toast.error(message);
    }, []);

    const upload = useCallback(
        async (files: File[] | FileList, folderId: number | null = currentFolderId) => {
            const queue = Array.from(files);
            if (queue.length === 0) return;

            setUploading(true);
            setError(null);

            for (const file of queue) {
                try {
                    const asset = await uploadRef.current(file, folderId);
                    setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
                    toast.success(`Uploaded ${file.name}`);
                } catch (caught) {
                    fail(caught, `Could not upload ${file.name}.`);
                }
            }

            setUploading(false);
        },
        [currentFolderId, fail],
    );

    const createFolder = useCallback(
        async (name: string, parentId: number | null = currentFolderId) => {
            await requestJson<{ folder: MediaFolderNode }>(route('builder.media.folders.store'), {
                method: 'POST',
                body: JSON.stringify({ name, parent_id: parentId }),
            });
            await refresh();
            toast.success('Folder created.');
        },
        [currentFolderId, refresh],
    );

    const renameFolder = useCallback(
        async (folderId: number, name: string) => {
            await requestJson(route('builder.media.folders.update', folderId), {
                method: 'PATCH',
                body: JSON.stringify({ name }),
            });
            await refresh();
            toast.success('Folder renamed.');
        },
        [refresh],
    );

    const moveFolder = useCallback(
        async (folderId: number, parentId: number | null) => {
            await requestJson(route('builder.media.folders.move', folderId), {
                method: 'PATCH',
                body: JSON.stringify({ parent_id: parentId }),
            });
            await refresh();
            toast.success('Folder moved.');
        },
        [refresh],
    );

    const deleteFolder = useCallback(
        async (folderId: number) => {
            await requestJson(route('builder.media.folders.destroy', folderId), { method: 'DELETE' });
            if (currentFolderId === folderId) setCurrentFolderId(null);
            await refresh();
            toast.success('Folder deleted. Its files moved to the library root.');
        },
        [currentFolderId, refresh],
    );

    const renameAsset = useCallback(async (assetId: number, filename: string) => {
        const payload = await requestJson<{ media: MediaAssetItem }>(route('builder.media.update', assetId), {
            method: 'PATCH',
            body: JSON.stringify({ original_filename: filename }),
        });
        setAssets((current) => current.map((asset) => (asset.id === assetId ? payload.media : asset)));
        toast.success('File renamed.');
    }, []);

    const moveAsset = useCallback(async (assetId: number, folderId: number | null) => {
        const payload = await requestJson<{ media: MediaAssetItem }>(route('builder.media.update', assetId), {
            method: 'PATCH',
            body: JSON.stringify({ folder_id: folderId }),
        });
        setAssets((current) => current.map((asset) => (asset.id === assetId ? payload.media : asset)));
        toast.success('File moved.');
    }, []);

    const archiveAsset = useCallback(async (assetId: number) => {
        await requestJson(route('builder.media.archive', assetId), { method: 'POST' });
        setAssets((current) => current.map((asset) => (asset.id === assetId ? { ...asset, status: 'archived' } : asset)));
        toast.success('Moved to trash.');
    }, []);

    const restoreAsset = useCallback(async (assetId: number) => {
        const payload = await requestJson<{ media: MediaAssetItem }>(route('builder.media.restore', assetId), {
            method: 'POST',
        });
        setAssets((current) => current.map((asset) => (asset.id === assetId ? payload.media : asset)));
        toast.success('File restored.');
    }, []);

    const destroyAsset = useCallback(async (assetId: number) => {
        await requestJson(route('builder.media.destroy', assetId), { method: 'DELETE' });
        setAssets((current) => current.filter((asset) => asset.id !== assetId));
        toast.success('File permanently deleted.');
    }, []);

    return {
        assets,
        folders,
        flatFolders,
        breadcrumbs,
        visibleAssets,
        trashCount,
        loading,
        uploading,
        error,
        currentFolderId,
        search,
        view,
        trash,
        setError,
        setSearch,
        setView,
        setTrash,
        setCurrentFolderId,
        refresh,
        upload,
        createFolder,
        renameFolder,
        moveFolder,
        deleteFolder,
        renameAsset,
        moveAsset,
        archiveAsset,
        restoreAsset,
        destroyAsset,
    };
}

export type MediaExplorerController = ReturnType<typeof useMediaExplorer>;
