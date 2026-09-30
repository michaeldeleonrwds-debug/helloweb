import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ConfirmDialog, PromptDialog } from '@/components/ui/prompt-dialog';
import { Copy, FolderInput, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { DragEvent, ReactNode } from 'react';
import { useState } from 'react';

import { absoluteUrl } from './format';
import { MEDIA_ASSET_DRAG_TYPE } from './types';
import type { MediaAssetItem } from './types';
import type { MediaExplorerController } from './useMediaExplorer';

interface AssetContextMenuProps {
    asset: MediaAssetItem;
    controller: MediaExplorerController;
    onSelect?: (asset: MediaAssetItem) => void;
    children: ReactNode;
}

async function run(action: () => Promise<unknown>, controller: MediaExplorerController, fallback: string) {
    try {
        await action();
    } catch (caught) {
        controller.setError(caught instanceof Error ? caught.message : fallback);
    }
}

export function AssetContextMenu({ asset, controller, onSelect, children }: AssetContextMenuProps) {
    const inTrash = asset.status === 'archived';
    const [renaming, setRenaming] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [dialogError, setDialogError] = useState<string | null>(null);

    const copyUrl = () => {
        const url = absoluteUrl(asset.url);
        if (!url) return;
        void navigator.clipboard.writeText(url);
        void import('sonner').then(({ toast }) => toast.success('Link copied.'));
    };

    const rename = () => {
        setDialogError(null);
        setRenaming(true);
    };

    const moveTo = async (folderId: number | null) => {
        await run(() => controller.moveAsset(asset.id, folderId), controller, 'Could not move the file.');
    };

    const archive = async () => {
        await run(() => controller.archiveAsset(asset.id), controller, 'Could not move the file to the trash.');
    };

    const restore = async () => {
        await run(() => controller.restoreAsset(asset.id), controller, 'Could not restore the file.');
    };

    const destroy = () => {
        setDialogError(null);
        setConfirmingDelete(true);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-56">
                {onSelect ? (
                    <ContextMenuItem onSelect={() => onSelect(asset)}>Use this image</ContextMenuItem>
                ) : null}

                <ContextMenuItem onSelect={copyUrl}>
                    <Copy className="size-3.5" />
                    Copy link
                </ContextMenuItem>

                {!inTrash ? (
                    <>
                        <ContextMenuItem onSelect={rename}>
                            <Pencil className="size-3.5" />
                            Rename…
                        </ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger>
                                <FolderInput className="size-3.5" />
                                Move to
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <ContextMenuItem onSelect={() => void moveTo(null)}>Library root</ContextMenuItem>
                                {controller.flatFolders.map((entry) => (
                                    <ContextMenuItem key={entry.folder.id} onSelect={() => void moveTo(entry.folder.id)}>
                                        {entry.folder.name}
                                    </ContextMenuItem>
                                ))}
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="text-destructive focus:text-destructive" onSelect={() => void archive()}>
                            <Trash2 className="size-3.5" />
                            Move to trash
                        </ContextMenuItem>
                    </>
                ) : (
                    <>
                        <ContextMenuItem onSelect={() => void restore()}>
                            <RotateCcw className="size-3.5" />
                            Restore
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="text-destructive focus:text-destructive" onSelect={destroy}>
                            <Trash2 className="size-3.5" />
                            Delete permanently
                        </ContextMenuItem>
                    </>
                )}
            </ContextMenuContent>

            <PromptDialog
                open={renaming}
                title="Rename file"
                label="File name"
                initialValue={asset.originalFilename}
                confirmLabel="Rename"
                error={dialogError}
                onCancel={() => {
                    setRenaming(false);
                    setDialogError(null);
                }}
                onSubmit={async (name) => {
                    try {
                        await controller.renameAsset(asset.id, name);
                        setRenaming(false);
                        setDialogError(null);
                    } catch (caught) {
                        setDialogError(caught instanceof Error ? caught.message : 'Could not rename the file.');
                    }
                }}
            />

            <ConfirmDialog
                open={confirmingDelete}
                title="Delete permanently"
                description={`"${asset.originalFilename}" will be removed from storage for good. Pages using it will show a broken image.`}
                confirmLabel="Delete permanently"
                error={dialogError}
                onCancel={() => {
                    setConfirmingDelete(false);
                    setDialogError(null);
                }}
                onConfirm={async () => {
                    try {
                        await controller.destroyAsset(asset.id);
                        setConfirmingDelete(false);
                        setDialogError(null);
                    } catch (caught) {
                        setDialogError(caught instanceof Error ? caught.message : 'Could not delete the file.');
                    }
                }}
            />
        </ContextMenu>
    );
}

export function startAssetDrag(asset: MediaAssetItem, event: DragEvent) {
    event.dataTransfer.setData(MEDIA_ASSET_DRAG_TYPE, String(asset.id));
    event.dataTransfer.effectAllowed = 'move';
}
