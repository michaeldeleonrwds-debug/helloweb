import { BUILDER_DOCUMENT_SCHEMA_VERSION, type BuilderComponentNode, type BuilderPageDocument } from '../document';

export function createSampleBuilderDocument(): BuilderPageDocument {
    return {
        schemaVersion: BUILDER_DOCUMENT_SCHEMA_VERSION,
        root: {
            id: 'node_root',
            type: 'layout.root',
            props: {},
            styles: {},
            children: [
                sectionNode('section-1', [
                    rowNode('row-1', [
                        columnNode('column-1', [
                            headingNode('heading-1', {
                                text: 'Hello Builder',
                                level: 1,
                            }),
                        ]),
                    ]),
                ]),
            ],
            metadata: {},
        },
        metadata: {},
    };
}

export function sectionNode(id: string, children: BuilderComponentNode[] = []): BuilderComponentNode {
    return {
        id,
        type: 'layout.section',
        props: {},
        styles: {
            desktop: {
                paddingTop: { value: 10, unit: 'px' },
                paddingBottom: { value: 10, unit: 'px' },
            },
        },
        children,
        metadata: {},
    };
}

export function containerNode(id: string, children: BuilderComponentNode[] = []): BuilderComponentNode {
    return {
        id,
        type: 'layout.container',
        props: {},
        styles: {
            desktop: {
                maxWidth: '64rem',
                minHeight: '8rem',
            },
        },
        children,
        metadata: {},
    };
}

export function rowNode(id: string, children: BuilderComponentNode[] = []): BuilderComponentNode {
    return {
        id,
        type: 'layout.row',
        props: {},
        styles: {},
        children,
        metadata: {},
    };
}

export function columnNode(id: string, children: BuilderComponentNode[] = []): BuilderComponentNode {
    return {
        id,
        type: 'layout.column',
        props: {},
        styles: {},
        children,
        metadata: {},
    };
}

export function headingNode(id: string, props: { text: string; level: number }): BuilderComponentNode {
    return {
        id,
        type: 'content.heading',
        props,
        styles: {
            desktop: {
                fontSize: '3rem',
            },
        },
        children: [],
        metadata: {},
    };
}
