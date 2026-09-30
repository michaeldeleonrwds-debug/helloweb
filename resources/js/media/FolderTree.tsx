import { ConfirmDialog, PromptDialog } from '@/components/ui/prompt-dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ChevronRight, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { subtreeIds } from './tree-utils';
import { MEDIA_ASSET_DRAG_TYPE, MEDIA_FOLDER_DRAG_TYPE } from './types';
import type { MediaFolderNode } from './types';
import type { MediaExplorerController } from './useMediaExplorer';

interface FolderTreeProps {
    controller: MediaExplorerController;
}

export function FolderTree({ controller }: FolderTreeProps) {
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
    const [renaming, setRenaming] = useState<MediaFolderNode | null>(null);
    const [deleting, setDeleting] = useState<MediaFolderNode | null>(null);
    const [dialogError, setDialogError] = useState<string | null>(null);

    const { folders, flatFolders, currentFolderId, trash } = controller;

    const toggle = (id: number) => {
        setCollapsed((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const moveTo = (assetId: number, folderId: number | null) => {
        void controller.moveAsset(assetId, folderId).catch((caught) => controller.setError(caught instanceof Error ? caught.message : 'Could not move the file.'));
    };

    const moveFolderTo = (folderId: number, parentId: number | null) => {
        void controller.moveFolder(folderId, parentId).catch((caught) => controller.setError(caught instanceof Error ? caught.message : 'Could not move the folder.'));
    };

    const renderRow = (folder: MediaFolderNode, depth: number) => {
        const hasChildren = folder.children.length > 0;
        const isCollapsed = collapsed.has(folder.id);
        const isActive = !trash && currentFolderId === folder.id;
        const blocked = subtreeIds(folders, folder.id);

        return (
            <ContextMenu key={folder.id}>
                <ContextMenuTrigger asChild>
                    <div
                        role="treeitem"
                        aria-expanded={hasChildren ? !isCollapsed : undefined}
                        aria-selected={isActive}
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData(MEDIA_FOLDER_DRAG_TYPE, String(folder.id));
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(event) => {
                            if (event.dataTransfer.types.includes(MEDIA_FOLDER_DRAG_TYPE) || event.dataTransfer.types.includes(MEDIA_ASSET_DRAG_TYPE)) {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                            }
                        }}
                        onDrop={(event) => {
                            const assetId = event.dataTransfer.getData(MEDIA_ASSET_DRAG_TYPE);
                            const folderId = event.dataTransfer.getData(MEDIA_FOLDER_DRAG_TYPE);
                            if (assetId) {
                                event.preventDefault();
                                event.stopPropagation();
                                moveTo(Number(assetId), folder.id);
                                return;
                            }
                            if (folderId && !blocked.has(Number(folderId))) {
                                event.preventDefault();
                                event.stopPropagation();
                                moveFolderTo(Number(folderId), folder.id);
                            }
                        }}
                        onClick={() => {
                            controller.setTrash(false);
                            controller.setSearch('');
                            controller.setCurrentFolderId(folder.id);
                        }}
                        className={`group flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-md pr-2 text-xs transition-colors ${
                            isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        }`}
                        style={{ paddingInlineStart: `${8 + depth * 14}px` }}
                    >
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (hasChildren) toggle(folder.id);
                            }}
                            className={`flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground ${hasChildren ? '' : 'invisible'}`}
                            aria-label={isCollapsed ? 'Expand folder' : 'Collapse folder'}
                        >
                            <ChevronRight className={`size-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                        </button>
                        {isActive ? <FolderOpen className="size-3.5 shrink-0 text-amber-500" /> : <Folder className="size-3.5 shrink-0" />}
                        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                        <span className="text-[10px] tabular-nums opacity-60">{folder.assetCount}</span>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                    <ContextMenuItem onSelect={() => handleRename(folder)}>Rename…</ContextMenuItem>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuItem onSelect={() => moveFolderTo(folder.id, null)}>Library root</ContextMenuItem>
                            {flatFolders
                                .filter((entry) => !blocked.has(entry.folder.id))
                                .map((entry) => (
                                    <ContextMenuItem key={entry.folder.id} onSelect={() => moveFolderTo(folder.id, entry.folder.id)}>
                                        {entry.folder.name}
                                    </ContextMenuItem>
                                ))}
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleDelete(folder)}>
                        <Trash2 className="size-3.5" />
                        Delete folder
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        );
    };

    const handleRename = (folder: MediaFolderNode) => {
        setDialogError(null);
        setRenaming(folder);
    };

    const handleDelete = (folder: MediaFolderNode) => {
        setDialogError(null);
        setDeleting(folder);
    };

    const renderNodes = (nodes: MediaFolderNode[], depth: number): ReactNode[] =>
        nodes.flatMap((folder) => {
            const row = renderRow(folder, depth);
            if (collapsed.has(folder.id)) return [row];
            return [row, ...renderNodes(folder.children, depth + 1)];
        });

    return (
        <>
            {folders.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-xs">No folders yet.</p>
            ) : (
                <div role="tree" aria-label="Media folders" className="space-y-0.5">
                    {renderNodes(folders, 0)}
                </div>
            )}

            <PromptDialog
                open={renaming !== null}
                title="Rename folder"
                label="Folder name"
                initialValue={renaming?.name}
                confirmLabel="Rename"
                error={dialogError}
                onCancel={() => {
                    setRenaming(null);
                    setDialogError(null);
                }}
                onSubmit={async (name) => {
                    const folder = renaming;
                    if (!folder) return;
                    try {
                        await controller.renameFolder(folder.id, name);
                        setRenaming(null);
                        setDialogError(null);
                    } catch (caught) {
                        setDialogError(caught instanceof Error ? caught.message : 'Could not rename the folder.');
                    }
                }}
            />

            <ConfirmDialog
                open={deleting !== null}
                title="Delete folder"
                description={`"${deleting?.name ?? ''}" and any nested folders will be removed. Files inside move to the library root.`}
                confirmLabel="Delete folder"
                error={dialogError}
                onCancel={() => {
                    setDeleting(null);
                    setDialogError(null);
                }}
                onConfirm={async () => {
                    const folder = deleting;
                    if (!folder) return;
                    try {
                        await controller.deleteFolder(folder.id);
                        setDeleting(null);
                        setDialogError(null);
                    } catch (caught) {
                        setDialogError(caught instanceof Error ? caught.message : 'Could not delete the folder.');
                    }
                }}
            />
        </>
    );
}
