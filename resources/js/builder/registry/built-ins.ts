import type { ComponentDefinition } from '../component/definition';
import { ComponentRegistry } from './component-registry';

export const BUILT_IN_COMPONENT_DEFINITIONS: ComponentDefinition[] = [
    {
        type: 'layout.root',
        name: 'Root',
        category: 'layout',
        description: 'Structural document root for rendering top-level page sections.',
        capabilities: {
            canHaveChildren: true,
            canAcceptChildren: true,
            supportsResponsiveStyles: false,
        },
        defaultProps: {},
        defaultStyles: {},
        propSchema: {},
        childRules: {
            allowedTypes: ['layout.section'],
        },
        integration: {
            rendererKey: 'layout.root',
        },
    },
    {
        type: 'layout.section',
        name: 'Section',
        category: 'layout',
        description: 'Top-level page section for grouping layout and content nodes.',
        capabilities: {
            canHaveChildren: true,
            canAcceptChildren: true,
            supportsResponsiveStyles: true,
        },
        defaultProps: {},
        defaultStyles: {
            desktop: {
                display: 'block',
            },
        },
        propSchema: {},
        childRules: {
            allowedTypes: ['layout.container', 'content.heading'],
        },
        integration: {
            rendererKey: 'layout.section',
            editorKey: 'layout.section',
        },
    },
    {
        type: 'layout.container',
        name: 'Container',
        category: 'layout',
        description: 'Nested layout primitive for constraining and grouping child components.',
        capabilities: {
            canHaveChildren: true,
            canAcceptChildren: true,
            supportsResponsiveStyles: true,
        },
        defaultProps: {},
        defaultStyles: {
            desktop: {
                maxWidth: '72rem',
            },
        },
        propSchema: {},
        childRules: {
            allowedTypes: ['layout.container', 'content.heading'],
        },
        integration: {
            rendererKey: 'layout.container',
            editorKey: 'layout.container',
        },
    },
    {
        type: 'content.heading',
        name: 'Heading',
        category: 'content',
        description: 'Text heading content primitive.',
        capabilities: {
            supportsText: true,
            supportsResponsiveStyles: true,
        },
        defaultProps: {
            text: 'Heading',
            level: 2,
        },
        defaultStyles: {
            desktop: {
                fontSize: '2rem',
            },
        },
        propSchema: {
            text: { type: 'string' },
            level: { type: 'integer', min: 1, max: 6 },
        },
        childRules: {
            allowedTypes: [],
        },
        integration: {
            rendererKey: 'content.heading',
            editorKey: 'content.heading',
        },
    },
];

export function createBuiltInComponentRegistry(): ComponentRegistry {
    return new ComponentRegistry(BUILT_IN_COMPONENT_DEFINITIONS);
}
