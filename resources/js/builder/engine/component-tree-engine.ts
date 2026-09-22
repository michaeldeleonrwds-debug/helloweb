import type { BuilderComponentNode, BuilderPageDocument, ComponentType } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';
import type { NodeIdGenerator } from './node-id-generator';
import { SequentialNodeIdGenerator } from './node-id-generator';
import type { TreeInsertPosition } from './tree-position';

export class TreeOperationError extends Error {
    static nodeNotFound(nodeId: string): TreeOperationError {
        return new TreeOperationError(`Node [${nodeId}] was not found.`);
    }

    static parentNotFound(parentId: string): TreeOperationError {
        return new TreeOperationError(`Parent node [${parentId}] was not found.`);
    }

    static invalidComponentType(type: string): TreeOperationError {
        return new TreeOperationError(`Component type [${type}] is not registered.`);
    }

    static invalidChildRelationship(parentType: string, childType: string): TreeOperationError {
        return new TreeOperationError(`Component type [${parentType}] cannot accept child type [${childType}].`);
    }

    static invalidPosition(message: string): TreeOperationError {
        return new TreeOperationError(message);
    }

    static invalidRootOperation(operation: string): TreeOperationError {
        return new TreeOperationError(`Cannot ${operation} the document root.`);
    }

    static duplicateIdGenerated(nodeId: string): TreeOperationError {
        return new TreeOperationError(`Generated duplicate node ID [${nodeId}].`);
    }
}

export class ComponentTreeEngine {
    constructor(
        private readonly registry: ComponentRegistry,
        private readonly idGenerator: NodeIdGenerator = new SequentialNodeIdGenerator(),
        private readonly rootAllowedTypes: ComponentType[] = ['layout.section'],
    ) {}

    find(document: BuilderPageDocument, nodeId: string): BuilderComponentNode | null {
        return findInNode(document.root, nodeId);
    }

    findParent(document: BuilderPageDocument, nodeId: string): BuilderComponentNode | null {
        if (document.root.id === nodeId) {
            return null;
        }

        return findParentInNode(document.root, nodeId);
    }

    insert(
        document: BuilderPageDocument,
        parentId: string,
        node: BuilderComponentNode,
        position: TreeInsertPosition = { mode: 'append' },
    ): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const existingIds = collectIds(nextDocument.root);

        this.assertNodeTreeCanBeInserted(node, existingIds);
        this.assertParentAccepts(nextDocument, parentId, node.type);

        if (!insertIntoNode(nextDocument.root, parentId, cloneNode(node), position)) {
            throw TreeOperationError.parentNotFound(parentId);
        }

        return nextDocument;
    }

    remove(document: BuilderPageDocument, nodeId: string): BuilderPageDocument {
        const nextDocument = cloneDocument(document);

        if (nextDocument.root.id === nodeId) {
            throw TreeOperationError.invalidRootOperation('remove');
        }

        if (!removeFromNode(nextDocument.root, nodeId)) {
            throw TreeOperationError.nodeNotFound(nodeId);
        }

        return nextDocument;
    }

    move(document: BuilderPageDocument, nodeId: string, newParentId: string, position: TreeInsertPosition = { mode: 'append' }): BuilderPageDocument {
        const nextDocument = cloneDocument(document);

        if (nextDocument.root.id === nodeId) {
            throw TreeOperationError.invalidRootOperation('move');
        }

        const node = findInNode(nextDocument.root, nodeId);

        if (!node) {
            throw TreeOperationError.nodeNotFound(nodeId);
        }

        if (findInNode(node, newParentId)) {
            throw TreeOperationError.invalidChildRelationship(node.type, newParentId);
        }

        if (!findInNode(nextDocument.root, newParentId)) {
            throw TreeOperationError.parentNotFound(newParentId);
        }

        this.assertParentAccepts(nextDocument, newParentId, node.type);
        removeFromNode(nextDocument.root, nodeId);

        if (!insertIntoNode(nextDocument.root, newParentId, node, position)) {
            throw TreeOperationError.parentNotFound(newParentId);
        }

        return nextDocument;
    }

    duplicate(document: BuilderPageDocument, nodeId: string): BuilderPageDocument {
        const nextDocument = cloneDocument(document);

        if (nextDocument.root.id === nodeId) {
            throw TreeOperationError.invalidRootOperation('duplicate');
        }

        const node = findInNode(nextDocument.root, nodeId);
        const parent = findParentInNode(nextDocument.root, nodeId);

        if (!node) {
            throw TreeOperationError.nodeNotFound(nodeId);
        }

        if (!parent) {
            throw TreeOperationError.invalidRootOperation('duplicate');
        }

        const existingIds = collectIds(nextDocument.root);
        const duplicate = this.duplicateNode(node, existingIds);

        insertIntoNode(nextDocument.root, parent.id, duplicate, { mode: 'after', siblingId: nodeId });

        return nextDocument;
    }

    private assertNodeTreeCanBeInserted(node: BuilderComponentNode, existingIds: Set<string>): void {
        if (!this.registry.has(node.type)) {
            throw TreeOperationError.invalidComponentType(node.type);
        }

        if (existingIds.has(node.id)) {
            throw TreeOperationError.duplicateIdGenerated(node.id);
        }

        existingIds.add(node.id);

        node.children.forEach((child) => {
            const allowedTypes = this.registry.get(node.type).childRules?.allowedTypes ?? [];

            if (!allowedTypes.includes(child.type)) {
                throw TreeOperationError.invalidChildRelationship(node.type, child.type);
            }

            this.assertNodeTreeCanBeInserted(child, existingIds);
        });
    }

    private assertParentAccepts(document: BuilderPageDocument, parentId: string, childType: ComponentType): void {
        const parent = findInNode(document.root, parentId);

        if (!parent) {
            throw TreeOperationError.parentNotFound(parentId);
        }

        if (parent.id === document.root.id) {
            if (!this.rootAllowedTypes.includes(childType)) {
                throw TreeOperationError.invalidChildRelationship(parent.type, childType);
            }

            return;
        }

        if (!this.registry.has(parent.type)) {
            throw TreeOperationError.invalidComponentType(parent.type);
        }

        const allowedTypes = this.registry.get(parent.type).childRules?.allowedTypes ?? [];

        if (!allowedTypes.includes(childType)) {
            throw TreeOperationError.invalidChildRelationship(parent.type, childType);
        }
    }

    private duplicateNode(node: BuilderComponentNode, existingIds: Set<string>): BuilderComponentNode {
        const nextId = this.idGenerator.generate(node.id, existingIds);

        if (existingIds.has(nextId)) {
            throw TreeOperationError.duplicateIdGenerated(nextId);
        }

        existingIds.add(nextId);

        return {
            ...cloneNode(node),
            id: nextId,
            children: node.children.map((child) => this.duplicateNode(child, existingIds)),
        };
    }
}

function findInNode(node: BuilderComponentNode, nodeId: string): BuilderComponentNode | null {
    if (node.id === nodeId) {
        return node;
    }

    for (const child of node.children) {
        const found = findInNode(child, nodeId);

        if (found) {
            return found;
        }
    }

    return null;
}

function findParentInNode(node: BuilderComponentNode, nodeId: string): BuilderComponentNode | null {
    for (const child of node.children) {
        if (child.id === nodeId) {
            return node;
        }

        const found = findParentInNode(child, nodeId);

        if (found) {
            return found;
        }
    }

    return null;
}

function insertIntoNode(node: BuilderComponentNode, parentId: string, newNode: BuilderComponentNode, position: TreeInsertPosition): boolean {
    if (node.id === parentId) {
        const index = indexForPosition(node.children, position);
        node.children.splice(index, 0, newNode);

        return true;
    }

    return node.children.some((child) => insertIntoNode(child, parentId, newNode, position));
}

function removeFromNode(node: BuilderComponentNode, nodeId: string): boolean {
    const index = node.children.findIndex((child) => child.id === nodeId);

    if (index !== -1) {
        node.children.splice(index, 1);

        return true;
    }

    return node.children.some((child) => removeFromNode(child, nodeId));
}

function indexForPosition(children: BuilderComponentNode[], position: TreeInsertPosition): number {
    if (position.mode === 'append') {
        return children.length;
    }

    const siblingIndex = children.findIndex((child) => child.id === position.siblingId);

    if (siblingIndex === -1) {
        throw TreeOperationError.invalidPosition(`Sibling node [${position.siblingId}] was not found in the target parent.`);
    }

    return position.mode === 'before' ? siblingIndex : siblingIndex + 1;
}

function collectIds(node: BuilderComponentNode): Set<string> {
    const ids = new Set<string>([node.id]);

    node.children.forEach((child) => {
        collectIds(child).forEach((id) => ids.add(id));
    });

    return ids;
}

function cloneDocument(document: BuilderPageDocument): BuilderPageDocument {
    return structuredClone(document);
}

function cloneNode(node: BuilderComponentNode): BuilderComponentNode {
    return structuredClone(node);
}
