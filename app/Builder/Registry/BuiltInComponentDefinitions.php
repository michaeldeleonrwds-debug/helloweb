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
        $columnChildren = [
            'layout.container', 'layout.stack', 'layout.flex', 'layout.grid', 'layout.columns', 'layout.spacer', 'layout.divider',
            'content.heading', 'content.text', 'content.richtext', 'content.button', 'content.link', 'media.image', 'marketing.card', 'reusable.instance',
        ];
        $internalLayoutChildren = $columnChildren;

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
                styleCapabilities: [],
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
                        'width' => '100%',
                        'position' => 'relative',
                        'paddingTop' => ['value' => 10, 'unit' => 'px'],
                        'paddingBottom' => ['value' => 10, 'unit' => 'px'],
                        'paddingLeft' => ['value' => 0, 'unit' => 'px'],
                        'paddingRight' => ['value' => 0, 'unit' => 'px'],
                    ],
                ],
                styleCapabilities: ['display', 'width', 'minHeight', 'margin', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'backgroundColor', 'position', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow', 'opacity'],
                propSchema: [],
                childRules: [
                    'allowedTypes' => ['layout.row'],
                ],
                integration: [
                    'rendererKey' => 'layout.section',
                    'editorKey' => 'layout.section',
                ],
            ),
            new ComponentDefinition(
                type: 'layout.row',
                name: 'Row',
                category: 'layout',
                description: 'Horizontal composition layer inside a Section.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'row', 'width' => '100%', 'gap' => '1rem', 'flexWrap' => 'nowrap']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'backgroundColor'],
                propSchema: [],
                childRules: ['allowedTypes' => ['layout.column']],
                integration: ['rendererKey' => 'layout.row', 'editorKey' => 'layout.row'],
            ),
            new ComponentDefinition(
                type: 'layout.column',
                name: 'Column',
                category: 'layout',
                description: 'Content container inside a Row.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'column', 'gap' => '1rem', 'width' => '100%']],
                styleCapabilities: ['display', 'width', 'minWidth', 'maxWidth', 'minHeight', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'backgroundColor'],
                propSchema: [],
                childRules: ['allowedTypes' => $columnChildren],
                integration: ['rendererKey' => 'layout.column', 'editorKey' => 'layout.column'],
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
                styleCapabilities: ['display', 'width', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'backgroundColor'],
                propSchema: [],
                childRules: [
                    'allowedTypes' => $internalLayoutChildren,
                ],
                integration: [
                    'rendererKey' => 'layout.container',
                    'editorKey' => 'layout.container',
                ],
            ),
            new ComponentDefinition(
                type: 'layout.stack',
                name: 'Stack',
                category: 'layout',
                description: 'A vertical flow layout with consistent spacing.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'column', 'gap' => '1rem']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'backgroundColor'],
                childRules: ['allowedTypes' => $internalLayoutChildren],
                integration: ['rendererKey' => 'layout.stack', 'icon' => 'stack'],
            ),
            new ComponentDefinition(
                type: 'layout.flex',
                name: 'Flex',
                category: 'layout',
                description: 'A flexible row or column layout primitive.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'row', 'gap' => '1rem']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'backgroundColor'],
                childRules: ['allowedTypes' => $internalLayoutChildren],
                integration: ['rendererKey' => 'layout.flex', 'icon' => 'flex'],
            ),
            new ComponentDefinition(
                type: 'layout.grid',
                name: 'Grid',
                category: 'layout',
                description: 'A responsive grid for cards and repeated content.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'grid', 'gridTemplateColumns' => 'repeat(3, minmax(0, 1fr))', 'gap' => '1rem']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'gridTemplateColumns', 'backgroundColor'],
                childRules: ['allowedTypes' => $internalLayoutChildren],
                integration: ['rendererKey' => 'layout.grid', 'icon' => 'grid'],
            ),
            new ComponentDefinition(
                type: 'layout.columns',
                name: 'Columns',
                category: 'layout',
                description: 'A simple multi-column composition primitive.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'row', 'gap' => '1rem']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap'],
                childRules: ['allowedTypes' => $internalLayoutChildren],
                integration: ['rendererKey' => 'layout.columns', 'icon' => 'columns'],
            ),
            new ComponentDefinition(
                type: 'layout.spacer',
                name: 'Spacer',
                category: 'layout',
                description: 'Adds intentional vertical space to a composition.',
                capabilities: ['supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['minHeight' => '2rem']],
                styleCapabilities: ['width', 'height', 'minHeight', 'maxHeight', 'margin'],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'layout.spacer', 'icon' => 'spacer'],
            ),
            new ComponentDefinition(
                type: 'layout.divider',
                name: 'Divider',
                category: 'layout',
                description: 'A visual separator between content groups.',
                capabilities: ['supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['borderWidth' => '1px', 'borderStyle' => 'solid', 'borderColor' => 'hsl(160 10% 88%)']],
                styleCapabilities: ['width', 'margin', 'borderWidth', 'borderStyle', 'borderColor'],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'layout.divider', 'icon' => 'divider'],
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
                styleCapabilities: ['margin', 'padding', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign'],
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
            new ComponentDefinition(
                type: 'content.text',
                name: 'Text',
                category: 'content',
                description: 'A readable paragraph of body copy.',
                capabilities: ['supportsText' => true, 'supportsResponsiveStyles' => true],
                defaultProps: ['text' => 'Add a paragraph of text.'],
                defaultStyles: ['desktop' => ['fontSize' => '1rem', 'lineHeight' => 1.6]],
                styleCapabilities: ['margin', 'padding', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'textAlign'],
                propSchema: ['text' => ['type' => 'string']],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'content.text', 'icon' => 'text'],
            ),
            new ComponentDefinition(
                type: 'content.richtext',
                name: 'Rich Text',
                category: 'content',
                description: 'Structured editorial copy for longer content.',
                capabilities: ['supportsText' => true, 'supportsResponsiveStyles' => true],
                defaultProps: ['text' => 'Add rich text content.'],
                styleCapabilities: ['margin', 'padding', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'textAlign'],
                propSchema: ['text' => ['type' => 'string']],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'content.richtext', 'icon' => 'rich-text'],
            ),
            new ComponentDefinition(
                type: 'content.button',
                name: 'Button',
                category: 'content',
                description: 'A clear action link for visitors.',
                capabilities: ['supportsText' => true, 'supportsResponsiveStyles' => true],
                defaultProps: ['text' => 'Get started', 'href' => '#'],
                defaultStyles: ['desktop' => ['display' => 'inline-block', 'padding' => '0.75rem 1rem', 'backgroundColor' => 'hsl(158 64% 32%)', 'color' => 'white', 'borderRadius' => '0.5rem', 'textAlign' => 'center']],
                styleCapabilities: ['display', 'margin', 'padding', 'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'borderRadius', 'borderWidth', 'borderStyle', 'borderColor', 'boxShadow'],
                propSchema: ['text' => ['type' => 'string'], 'href' => ['type' => 'string']],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'content.button', 'icon' => 'button'],
            ),
            new ComponentDefinition(
                type: 'content.link',
                name: 'Link',
                category: 'content',
                description: 'A lightweight inline navigation link.',
                capabilities: ['supportsText' => true, 'supportsResponsiveStyles' => true],
                defaultProps: ['text' => 'Learn more', 'href' => '#'],
                styleCapabilities: ['margin', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textDecoration', 'textAlign'],
                propSchema: ['text' => ['type' => 'string'], 'href' => ['type' => 'string']],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'content.link', 'icon' => 'link'],
            ),
            new ComponentDefinition(
                type: 'media.image',
                name: 'Image',
                category: 'media',
                description: 'An image reference with accessible alt text.',
                capabilities: ['supportsResponsiveStyles' => true],
                defaultProps: ['src' => '', 'alt' => ''],
                styleCapabilities: ['display', 'width', 'height', 'minWidth', 'maxWidth', 'margin', 'borderRadius', 'objectFit'],
                propSchema: ['src' => ['type' => 'string'], 'alt' => ['type' => 'string']],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'media.image', 'icon' => 'image'],
            ),
            new ComponentDefinition(
                type: 'marketing.card',
                name: 'Card',
                category: 'marketing',
                description: 'A contained surface for grouped content.',
                capabilities: ['canHaveChildren' => true, 'canAcceptChildren' => true, 'supportsResponsiveStyles' => true],
                defaultStyles: ['desktop' => ['display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.75rem', 'padding' => '1.5rem', 'backgroundColor' => 'white', 'borderWidth' => '1px', 'borderStyle' => 'solid', 'borderColor' => 'hsl(160 10% 88%)', 'borderRadius' => '0.75rem', 'boxShadow' => '0 1px 2px rgba(0,0,0,.08)']],
                styleCapabilities: ['display', 'width', 'minHeight', 'maxWidth', 'margin', 'padding', 'gap', 'flexDirection', 'justifyContent', 'alignItems', 'backgroundColor', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'boxShadow'],
                childRules: ['allowedTypes' => $internalLayoutChildren],
                integration: ['rendererKey' => 'marketing.card', 'icon' => 'card'],
            ),
            new ComponentDefinition(
                type: 'reusable.instance',
                name: 'Reusable component',
                category: 'content',
                description: 'A reference to an owned reusable component definition.',
                capabilities: ['supportsResponsiveStyles' => false],
                defaultProps: [],
                defaultStyles: [],
                styleCapabilities: [],
                propSchema: [],
                childRules: ['allowedTypes' => []],
                integration: ['rendererKey' => 'reusable.instance'],
            ),
        ];
    }

    public static function registry(): ComponentRegistry
    {
        return new ComponentRegistry(self::all());
    }
}
