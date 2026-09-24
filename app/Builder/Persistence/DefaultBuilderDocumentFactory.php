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
                    'minHeight' => '620px',
                    'padding' => '7rem 2rem',
                    'backgroundColor' => '#0f172a',
                    'backgroundType' => 'gradient',
                    'backgroundGradient' => 'linear-gradient(135deg, #0f172a 0%, #172554 52%, #0f766e 100%)',
                ], [
                    self::row('hero-row', [
                        'maxWidth' => '1120px',
                        'margin' => '0 auto',
                        'backgroundColor' => 'transparent',
                    ], [
                        self::column('hero-column', ['maxWidth' => '720px', 'gap' => '1.5rem', 'backgroundColor' => 'transparent'], [
                            self::text('hero-eyebrow', 'A clearer way to build online', ['fontSize' => '0.8rem', 'fontWeight' => 700, 'letterSpacing' => '0.18rem', 'textTransform' => 'uppercase', 'color' => '#99f6e4']),
                            self::heading('hero-heading', 'Make your next idea feel inevitable.', 1, ['fontSize' => '5.5rem', 'lineHeight' => 0.98, 'color' => '#f8fafc']),
                            self::text('hero-copy', 'A focused digital home for teams with something worth sharing. Shape the story, launch with confidence, and give every detail a reason to be there.', ['fontSize' => '1.15rem', 'lineHeight' => 1.7, 'color' => '#cbd5e1']),
                            self::flex('hero-actions', ['gap' => '0.75rem', 'backgroundColor' => 'transparent'], [
                                self::button('hero-primary-action', 'Start a conversation', '#contact', ['backgroundColor' => '#5eead4', 'color' => '#042f2e', 'padding' => '0.9rem 1.2rem', 'borderRadius' => '999px', 'fontWeight' => 700]),
                                self::link('hero-secondary-action', 'Explore the approach ->', '#approach', ['color' => '#e2e8f0', 'fontWeight' => 600]),
                            ]),
                        ]),
                    ]),
                ]),
                self::section('approach', ['padding' => '7rem 2rem', 'backgroundColor' => '#f8fafc'], [
                    self::row('approach-row', ['maxWidth' => '1120px', 'margin' => '0 auto', 'gap' => '3rem', 'backgroundColor' => 'transparent'], [
                        self::column('approach-intro', ['maxWidth' => '360px', 'backgroundColor' => 'transparent'], [
                            self::heading('approach-heading', 'Built around clarity.', 2, ['fontSize' => '2.5rem', 'lineHeight' => 1.05, 'color' => '#0f172a']),
                            self::text('approach-copy', 'The best experiences do less, better. Start with a strong point of view and let the details carry it through.', ['fontSize' => '1rem', 'lineHeight' => 1.7, 'color' => '#475569']),
                        ]),
                        self::column('approach-cards', ['gap' => '1rem', 'backgroundColor' => 'transparent'], [
                            self::card('approach-card-one', '01  Find the signal', 'Turn a complex offer into a message people understand in a single breath.'),
                            self::card('approach-card-two', '02  Make it useful', 'Give visitors a clear next step and make the path from interest to action feel natural.'),
                        ]),
                    ]),
                ]),
                self::section('contact', ['padding' => '5rem 2rem', 'backgroundColor' => '#0f172a'], [
                    self::row('contact-row', ['maxWidth' => '1120px', 'margin' => '0 auto', 'backgroundColor' => 'transparent'], [
                        self::column('contact-column', ['backgroundColor' => 'transparent'], [
                            self::heading('contact-heading', 'Ready when you are.', 2, ['fontSize' => '3rem', 'color' => '#f8fafc']),
                            self::text('contact-copy', 'Replace this starter content with your own story, then publish the page as your new home.', ['color' => '#cbd5e1', 'lineHeight' => 1.7]),
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
