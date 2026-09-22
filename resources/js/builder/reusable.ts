import type { BuilderComponentNode, BuilderPageDocument, ReusableComponentReference } from './document';

export interface ReusableComponentDefinition {
    id: number;
    name: string;
    description?: string | null;
    document: BuilderPageDocument;
}

export function resolveReusableReferences(document: BuilderPageDocument, definitions: ReusableComponentDefinition[]): BuilderPageDocument {
    const byId = new Map(definitions.map((definition) => [definition.id, definition]));

    return { ...structuredClone(document), root: resolveNode(document.root, byId) };
}

function resolveNode(node: BuilderComponentNode, definitions: Map<number, ReusableComponentDefinition>): BuilderComponentNode {
    if (node.reusableReference) {
        const definition = definitions.get(node.reusableReference.id);
        if (definition) {
            return namespaceNode(structuredClone(definition.document.root), node.id);
        }
    }

    return { ...structuredClone(node), children: node.children.map((child) => resolveNode(child, definitions)) };
}

function namespaceNode(node: BuilderComponentNode, instanceId: string, root = true): BuilderComponentNode {
    return {
        ...node,
        id: root ? instanceId : `${instanceId}:${node.id}`,
        children: node.children.map((child) => namespaceNode(child, instanceId, false)),
    };
}

export function isReusableReference(value: unknown): value is ReusableComponentReference {
    return (
        typeof value === 'object' &&
        value !== null &&
        (value as ReusableComponentReference).type === 'reusable-component' &&
        Number.isInteger((value as ReusableComponentReference).id)
    );
}
