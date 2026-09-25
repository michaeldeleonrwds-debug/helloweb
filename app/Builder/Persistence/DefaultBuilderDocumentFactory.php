<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;

final class DefaultBuilderDocumentFactory
{
    public function create(): BuilderDocument
    {
        return BuilderDocument::fromArray([
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => self::node('root', 'layout.root', [], [
                self::section('hero', [
                    'minHeight' => '100vh',
                    'padding' => '8rem 2rem',
                    'backgroundColor' => '#f4f6f9',
                ], [
                    self::row('hero-row', [
                        'maxWidth' => '800px',
                        'margin' => '0 auto',
                        'backgroundColor' => 'transparent',
                    ], [
                        self::column('hero-column', [
                            'display' => 'flex',
                            'flexDirection' => 'column',
                            'alignItems' => 'center',
                            'gap' => '1.5rem',
                            'backgroundColor' => 'transparent',
                        ], [
                            self::text('hero-brand', 'HelloWeb', [
                                'fontSize' => '0.875rem',
                                'fontWeight' => 700,
                                'letterSpacing' => '0.18rem',
                                'textTransform' => 'uppercase',
                                'color' => '#134e35',
                            ]),
                            self::heading('hero-heading', 'Welcome to your new website.', 1, [
                                'fontSize' => '3.5rem',
                                'fontWeight' => 800,
                                'lineHeight' => 1.15,
                                'color' => '#0f172a',
                                'textAlign' => 'center',
                            ]),
                            self::text('hero-copy', 'Start building something amazing with HelloWeb.', [
                                'fontSize' => '1.25rem',
                                'lineHeight' => 1.6,
                                'color' => '#64748b',
                                'textAlign' => 'center',
                            ]),
                            self::flex('hero-actions', [
                                'gap' => '1rem',
                                'justifyContent' => 'center',
                                'backgroundColor' => 'transparent',
                            ], [
                                self::button('hero-button', 'Launch Builder', '/builder', [
                                    'backgroundColor' => '#134e35',
                                    'color' => '#ffffff',
                                    'padding' => '0.85rem 2rem',
                                    'borderRadius' => '999px',
                                    'fontWeight' => 700,
                                    'fontSize' => '1rem',
                                ]),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
        ]);
    }

    private static function section(string $id, array $styles, array $children): array
    {
        return self::node('section-'.$id, 'layout.section', [], $children, $styles);
    }

    private static function row(string $id, array $styles, array $children): array
    {
        return self::node($id, 'layout.row', [], $children, $styles);
    }

    private static function column(string $id, array $styles, array $children): array
    {
        return self::node($id, 'layout.column', [], $children, $styles);
    }

    private static function flex(string $id, array $styles, array $children): array
    {
        return self::node($id, 'layout.flex', [], $children, $styles);
    }

    private static function heading(string $id, string $text, int $level, array $styles): array
    {
        return self::node($id, 'content.heading', ['text' => $text, 'level' => $level], [], $styles);
    }

    private static function text(string $id, string $text, array $styles): array
    {
        return self::node($id, 'content.text', ['text' => $text], [], $styles);
    }

    private static function button(string $id, string $text, string $href, array $styles): array
    {
        return self::node($id, 'content.button', ['text' => $text, 'href' => $href], [], $styles);
    }

    private static function link(string $id, string $text, string $href, array $styles): array
    {
        return self::node($id, 'content.link', ['text' => $text, 'href' => $href], [], $styles);
    }

    private static function card(string $id, string $heading, string $copy): array
    {
        return self::node($id, 'marketing.card', [], [
            self::heading($id.'-heading', $heading, 3, ['fontSize' => '1.25rem', 'color' => '#0f172a']),
            self::text($id.'-copy', $copy, ['color' => '#64748b', 'lineHeight' => 1.6]),
        ], ['padding' => '1.5rem', 'backgroundColor' => '#ffffff', 'borderRadius' => '1rem', 'borderWidth' => '1px', 'borderStyle' => 'solid', 'borderColor' => '#e2e8f0']);
    }

    private static function node(string $id, string $type, array $props, array $children, array $styles = []): array
    {
        return [
            'id' => $id,
            'type' => $type,
            'props' => $props,
            'styles' => $styles === [] ? [] : ['desktop' => $styles],
            'children' => $children,
        ];
    }
}
