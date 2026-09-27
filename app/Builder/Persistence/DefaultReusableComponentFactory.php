<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocumentSchema;

final class DefaultReusableComponentFactory
{
    /**
     * Return list of starter platform reusable blocks.
     *
     * @return list<array{name: string, description: string, document: array<string, mixed>}>
     */
    public static function defaultComponents(): array
    {
        return [
            [
                'name' => 'Hero Banner Block',
                'description' => 'High-impact hero section with headline, supporting text, and primary call to action.',
                'document' => self::heroBlockDocument(),
            ],
            [
                'name' => 'Feature 3-Column Grid',
                'description' => 'Tri-column layout showcasing product capabilities and core benefits.',
                'document' => self::featuresBlockDocument(),
            ],
            [
                'name' => 'Call To Action Banner',
                'description' => 'Engaging full-width banner designed to convert visitors into subscribers or customers.',
                'document' => self::ctaBlockDocument(),
            ],
            [
                'name' => 'Testimonial Spotlight',
                'description' => 'Customer quote card with attribution and credibility styling.',
                'document' => self::testimonialBlockDocument(),
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function heroBlockDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'hero-block-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f8fafc',
                                'padding' => '5rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'hero-block-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '900px',
                                        'margin' => '0 auto',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'hero-block-column',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '100%',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.25rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'hero-block-heading',
                                                'type' => 'content.heading',
                                                'props' => [
                                                    'text' => 'Build Faster With Next-Gen Studio Tools',
                                                    'level' => 1,
                                                ],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '48px',
                                                        'lineHeight' => 1.2,
                                                        'fontWeight' => 800,
                                                        'color' => '#0f172a',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'hero-block-text',
                                                'type' => 'content.text',
                                                'props' => [
                                                    'text' => 'Empower your team to launch production-grade websites with unified design tokens, global themes, and modular components.',
                                                ],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '18px',
                                                        'lineHeight' => 1.6,
                                                        'color' => '#475569',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'hero-block-button',
                                                'type' => 'content.button',
                                                'props' => [
                                                    'text' => 'Get Started Today',
                                                    'href' => '#signup',
                                                ],
                                                'styles' => [
                                                    'desktop' => [
                                                        'backgroundColor' => '#134e35',
                                                        'color' => '#ffffff',
                                                        'padding' => '0.875rem 2rem',
                                                        'borderRadius' => '9999px',
                                                        'fontWeight' => 600,
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function featuresBlockDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'feat-block-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '4rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'feat-block-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1140px',
                                        'margin' => '0 auto',
                                        'display' => 'flex',
                                        'gap' => '2rem',
                                    ],
                                ],
                                'children' => [
                                    self::featureColumn('feat-col-1', 'Lightning Fast', 'Engineered for optimal performance with static asset caching and clean semantic markup.'),
                                    self::featureColumn('feat-col-2', 'Pixel Perfect', 'Full responsive breakpoint control across desktop, tablet, and mobile devices.'),
                                    self::featureColumn('feat-col-3', 'Extensible Ecosystem', 'Modular reusable blocks and theme templates synchronized across your entire site.'),
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private static function featureColumn(string $id, string $title, string $desc): array
    {
        return [
            'id' => $id,
            'type' => 'layout.column',
            'props' => [],
            'styles' => [
                'desktop' => [
                    'width' => '33.333%',
                    'padding' => '1.5rem',
                    'backgroundColor' => '#f8fafc',
                    'borderRadius' => '16px',
                    'display' => 'flex',
                    'flexDirection' => 'column',
                    'gap' => '0.75rem',
                ],
            ],
            'children' => [
                [
                    'id' => "{$id}-heading",
                    'type' => 'content.heading',
                    'props' => ['text' => $title, 'level' => 3],
                    'styles' => [
                        'desktop' => [
                            'fontSize' => '20px',
                            'fontWeight' => 700,
                            'color' => '#0f172a',
                        ],
                    ],
                    'children' => [],
                ],
                [
                    'id' => "{$id}-desc",
                    'type' => 'content.text',
                    'props' => ['text' => $desc],
                    'styles' => [
                        'desktop' => [
                            'fontSize' => '15px',
                            'lineHeight' => 1.5,
                            'color' => '#64748b',
                        ],
                    ],
                    'children' => [],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function ctaBlockDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'cta-block-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#134e35',
                                'padding' => '4.5rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'cta-block-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '800px',
                                        'margin' => '0 auto',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'cta-block-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '100%',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.25rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'cta-block-heading',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Ready to Launch Your Next Site?', 'level' => 2],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '36px',
                                                        'fontWeight' => 800,
                                                        'color' => '#ffffff',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'cta-block-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Join thousands of creators building high-impact web experiences.'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '18px',
                                                        'color' => 'rgba(255, 255, 255, 0.85)',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'cta-block-btn',
                                                'type' => 'content.button',
                                                'props' => ['text' => 'Start Free Trial', 'href' => '#start'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'backgroundColor' => '#ffffff',
                                                        'color' => '#134e35',
                                                        'padding' => '0.875rem 2rem',
                                                        'borderRadius' => '9999px',
                                                        'fontWeight' => 700,
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function testimonialBlockDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    [
                        'id' => 'test-block-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f1f5f9',
                                'padding' => '4rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'test-block-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '750px',
                                        'margin' => '0 auto',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'test-block-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '100%',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'test-block-quote',
                                                'type' => 'content.text',
                                                'props' => [
                                                    'text' => '"HelloWeb completely transformed how we build and publish landing pages. The flexibility and visual fidelity are unmatched."',
                                                ],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '20px',
                                                        'color' => '#1e293b',
                                                        'textAlign' => 'center',
                                                        'lineHeight' => 1.6,
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'test-block-author',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Alex Rivera — Head of Product at NextWave', 'level' => 4],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '14px',
                                                        'fontWeight' => 600,
                                                        'color' => '#64748b',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
