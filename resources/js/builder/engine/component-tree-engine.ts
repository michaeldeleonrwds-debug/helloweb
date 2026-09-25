import type { BuilderBreakpoint, BuilderComponentNode, BuilderPageDocument, BuilderRecord, ComponentType, JsonValue } from '../document';
import type { ComponentRegistry } from '../registry/component-registry';
import { clearStyleOverride, validateStylePatch } from '../style/style';
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

    static invalidProp(nodeType: string, propName: string, message: string): TreeOperationError {
        return new TreeOperationError(`Invalid prop [${propName}] for component [${nodeType}]: ${message}`);
    }
}

export class ComponentTreeEngine {
    constructor(
        private readonly registry: ComponentRegistry,
        private readonly idGenerator: NodeIdGenerator = new SequentialNodeIdGenerator(),
        private readonly rootAllowedTypes: ComponentType[] = ['layout.section', 'layout.navbar'],
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

    canAcceptChild(document: BuilderPageDocument, parentId: string, childType: ComponentType): boolean {
        try {
            this.assertParentAccepts(document, parentId, childType);
            return true;
        } catch (error) {
            if (error instanceof TreeOperationError) {
                return false;
            }

            throw error;
        }
    }

    createNode(document: BuilderPageDocument, type: ComponentType): BuilderComponentNode {
        if (!this.registry.has(type)) {
            throw TreeOperationError.invalidComponentType(type);
        }

        const definition = this.registry.get(type);
        const existingIds = collectIds(document.root);
        const id = this.idGenerator.generate(type, existingIds);

        if (existingIds.has(id)) {
            throw TreeOperationError.duplicateIdGenerated(id);
        }

        return {
            id,
            type,
            props: structuredClone(definition.defaultProps ?? {}),
            styles: structuredClone(definition.defaultStyles ?? {}),
            children: [],
        };
    }

    insertComponent(
        document: BuilderPageDocument,
        parentId: string,
        type: ComponentType,
        position: TreeInsertPosition = { mode: 'append' },
    ): BuilderPageDocument {
        return this.insert(document, parentId, this.createNode(document, type), position);
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

        if (position.mode !== 'append' && position.siblingId === nodeId) {
            throw TreeOperationError.invalidPosition('A node cannot be moved before or after itself.');
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

    moveSibling(document: BuilderPageDocument, nodeId: string, direction: 'up' | 'down'): BuilderPageDocument {
        const parent = this.findParent(document, nodeId);
        if (!parent) throw TreeOperationError.invalidRootOperation('move');

        const index = parent.children.findIndex((child) => child.id === nodeId);
        const sibling = direction === 'up' ? parent.children[index - 1] : parent.children[index + 1];
        if (!sibling) return document;

        return this.move(document, nodeId, parent.id, {
            mode: direction === 'up' ? 'before' : 'after',
            siblingId: sibling.id,
        });
    }

    paste(document: BuilderPageDocument, parentId: string, source: BuilderComponentNode): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const existingIds = collectIds(nextDocument.root);
        this.assertParentAccepts(nextDocument, parentId, source.type);
        const pasted = this.duplicateNode(source, existingIds);
        if (!insertIntoNode(nextDocument.root, parentId, pasted, { mode: 'append' })) {
            throw TreeOperationError.parentNotFound(parentId);
        }

        return nextDocument;
    }

    updateMetadata(document: BuilderPageDocument, nodeId: string, patch: Record<string, JsonValue | undefined>): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const node = findInNode(nextDocument.root, nodeId);
        if (!node) throw TreeOperationError.nodeNotFound(nodeId);

        node.metadata = { ...(node.metadata ?? {}) };
        Object.entries(patch).forEach(([key, value]) => {
            if (value === undefined) delete node.metadata?.[key];
            else node.metadata![key] = structuredClone(value);
        });

        if (Object.keys(node.metadata).length === 0) delete node.metadata;
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

    updateProps(document: BuilderPageDocument, nodeId: string, patch: Partial<BuilderRecord>): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const node = findInNode(nextDocument.root, nodeId);

        if (!node) {
            throw TreeOperationError.nodeNotFound(nodeId);
        }

        const definition = this.registry.get(node.type);
        const validPatch: BuilderRecord = {};
        Object.entries(patch).forEach(([name, value]) => {
            const schema = definition.propSchema?.[name];

            if (!schema) {
                throw TreeOperationError.invalidProp(node.type, name, 'property is not editable.');
            }

            if (value === undefined) {
                throw TreeOperationError.invalidProp(node.type, name, 'value cannot be undefined.');
            }

            assertValidProp(node.type, name, value, schema);
            validPatch[name] = value;
        });

        node.props = { ...node.props, ...structuredClone(validPatch) };

        return nextDocument;
    }

    updateStyles(
        document: BuilderPageDocument,
        nodeId: string,
        breakpoint: BuilderBreakpoint,
        patch: Record<string, JsonValue | undefined>,
    ): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const node = findInNode(nextDocument.root, nodeId);
        if (!node) throw TreeOperationError.nodeNotFound(nodeId);
        const validPatch = validateStylePatch(this.registry.get(node.type), patch);
        node.styles[breakpoint] = { ...(node.styles[breakpoint] ?? {}), ...validPatch };
        return nextDocument;
    }

    clearStyleOverride(
        document: BuilderPageDocument,
        nodeId: string,
        breakpoint: BuilderBreakpoint,
        key: Parameters<typeof clearStyleOverride>[2],
    ): BuilderPageDocument {
        const nextDocument = cloneDocument(document);
        const node = findInNode(nextDocument.root, nodeId);
        if (!node) throw TreeOperationError.nodeNotFound(nodeId);
        node.styles = clearStyleOverride(node.styles, breakpoint, key);
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

function assertValidProp(nodeType: string, name: string, value: BuilderRecord[string], schema: BuilderRecord): void {
    const type = schema.type;

    if (type === 'string' && typeof value !== 'string') {
        throw TreeOperationError.invalidProp(nodeType, name, 'expected a string.');
    }

    if (type === 'boolean' && typeof value !== 'boolean') {
        throw TreeOperationError.invalidProp(nodeType, name, 'expected a boolean.');
    }

    if (type === 'integer' && (!Number.isInteger(value) || typeof value !== 'number')) {
        throw TreeOperationError.invalidProp(nodeType, name, 'expected an integer.');
    }

    if (typeof schema.min === 'number' && typeof value === 'number' && value < schema.min) {
        throw TreeOperationError.invalidProp(nodeType, name, `must be at least ${schema.min}.`);
    }

    if (typeof schema.max === 'number' && typeof value === 'number' && value > schema.max) {
        throw TreeOperationError.invalidProp(nodeType, name, `must be at most ${schema.max}.`);
    }

    if (Array.isArray(schema.values) && !schema.values.includes(value)) {
        throw TreeOperationError.invalidProp(nodeType, name, 'value is not allowed.');
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
