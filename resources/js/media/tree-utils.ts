import type { MediaFolderNode } from './types';

export interface FlatFolder {
    folder: MediaFolderNode;
    depth: number;
}

export function flattenFolders(nodes: MediaFolderNode[], depth = 0): FlatFolder[] {
    return nodes.flatMap((folder) => [{ folder, depth }, ...flattenFolders(folder.children, depth + 1)]);
}

export function subtreeIds(nodes: MediaFolderNode[], rootId: number): Set<number> {
    const found = new Set<number>();
    const stack = nodes.filter((node) => node.id === rootId);

    while (stack.length > 0) {
        const node = stack.pop();
        if (!node || found.has(node.id)) continue;
        found.add(node.id);
        stack.push(...node.children);
    }

    return found;
}
