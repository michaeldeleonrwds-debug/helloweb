export interface NodeIdGenerator {
    generate(sourceNodeId: string, existingIds: ReadonlySet<string>): string;
}

export class SequentialNodeIdGenerator implements NodeIdGenerator {
    private next: number;

    constructor(start = 1) {
        this.next = start;
    }

    generate(_sourceNodeId: string, existingIds: ReadonlySet<string>): string {
        let nodeId = `node_${this.next}`;
        this.next += 1;

        while (existingIds.has(nodeId)) {
            nodeId = `node_${this.next}`;
            this.next += 1;
        }

        return nodeId;
    }
}
