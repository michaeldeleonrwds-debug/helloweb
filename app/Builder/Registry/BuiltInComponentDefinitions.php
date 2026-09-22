<?php

namespace App\Builder\Registry;

use App\Builder\Component\ComponentDefinition;

final class BuiltInComponentDefinitions
{
    /**
     * @return list<ComponentDefinition>
     */
    public static function all(): array
    {
        return [
            new ComponentDefinition(
                type: 'layout.root',
                name: 'Root',
                category: 'layout',
                description: 'Structural document root for rendering top-level page sections.',
                capabilities: [
                    'canHaveChildren' => true,
                    'canAcceptChildren' => true,
                    'supportsResponsiveStyles' => false,
                ],
                defaultProps: [],
                defaultStyles: [],
                propSchema: [],
                childRules: [
                    'allowedTypes' => ['layout.section'],
                ],
                integration: [
                    'rendererKey' => 'layout.root',
                ],
            ),
            new ComponentDefinition(
                type: 'layout.section',
                name: 'Section',
                category: 'layout',
                description: 'Top-level page section for grouping layout and content nodes.',
                capabilities: [
                    'canHaveChildren' => true,
                    'canAcceptChildren' => true,
                    'supportsResponsiveStyles' => true,
                ],
                defaultProps: [],
                defaultStyles: [
                    'desktop' => [
                        'display' => 'block',
                    ],
                ],
                propSchema: [],
                childRules: [
                    'allowedTypes' => ['layout.container', 'content.heading'],
                ],
                integration: [
                    'rendererKey' => 'layout.section',
                    'editorKey' => 'layout.section',
                ],
            ),
            new ComponentDefinition(
                type: 'layout.container',
                name: 'Container',
                category: 'layout',
                description: 'Nested layout primitive for constraining and grouping child components.',
                capabilities: [
                    'canHaveChildren' => true,
                    'canAcceptChildren' => true,
                    'supportsResponsiveStyles' => true,
                ],
                defaultProps: [],
                defaultStyles: [
                    'desktop' => [
                        'maxWidth' => '72rem',
                    ],
                ],
                propSchema: [],
                childRules: [
                    'allowedTypes' => ['layout.container', 'content.heading'],
                ],
                integration: [
                    'rendererKey' => 'layout.container',
                    'editorKey' => 'layout.container',
                ],
            ),
            new ComponentDefinition(
                type: 'content.heading',
                name: 'Heading',
                category: 'content',
                description: 'Text heading content primitive.',
                capabilities: [
                    'supportsText' => true,
                    'supportsResponsiveStyles' => true,
                ],
                defaultProps: [
                    'text' => 'Heading',
                    'level' => 2,
                ],
                defaultStyles: [
                    'desktop' => [
                        'fontSize' => '2rem',
                    ],
                ],
                propSchema: [
                    'text' => ['type' => 'string'],
                    'level' => ['type' => 'integer', 'min' => 1, 'max' => 6],
                ],
                childRules: [
                    'allowedTypes' => [],
                ],
                integration: [
                    'rendererKey' => 'content.heading',
                    'editorKey' => 'content.heading',
                ],
            ),
        ];
    }

    public static function registry(): ComponentRegistry
    {
        return new ComponentRegistry(self::all());
    }
}
