<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocumentSchema;

final class DefaultTemplateFactory
{
    /**
     * Return list of starter templates for a new user or site.
     *
     * @return list<array{name: string, slug: string, description: string, type: string, document: array<string, mixed>}>
     */
    public static function defaultTemplates(): array
    {
        return [
            // ==================== HEADERS ====================
            [
                'name' => 'Main Navigation Header',
                'slug' => 'main-navigation-header',
                'description' => 'Site-wide responsive header featuring brand identity, top navigation links, and primary action button.',
                'type' => 'header',
                'document' => self::withResponsiveDefaults(self::mainHeaderDocument()),
            ],
            [
                'name' => 'Centered Minimal Header',
                'slug' => 'centered-minimal-header',
                'description' => 'Clean centered brand header ideal for modern portfolios, blogs, and editorial publications.',
                'type' => 'header',
                'document' => self::withResponsiveDefaults(self::minimalHeaderDocument()),
            ],
            [
                'name' => 'Dark Modern Glow Header',
                'slug' => 'dark-modern-glow-header',
                'description' => 'High-contrast dark mode header with glowing neon HelloWeb branding, navigation links, and Launch App button.',
                'type' => 'header',
                'document' => self::withResponsiveDefaults(self::darkGlowHeaderDocument()),
            ],
            [
                'name' => 'Floating Glassmorphism Pill Header',
                'slug' => 'floating-pill-header',
                'description' => 'Modern rounded floating pill navbar with subtle shadow, brand identity, and clean CTA.',
                'type' => 'header',
                'document' => self::withResponsiveDefaults(self::floatingPillHeaderDocument()),
            ],
            [
                'name' => 'Split CTA Header',
                'slug' => 'split-cta-header',
                'description' => 'Conversion-focused responsive header with a bold announcement strip, compact navigation, and dual calls to action.',
                'type' => 'header',
                'document' => self::withResponsiveDefaults(self::splitCtaHeaderDocument()),
            ],

            // ==================== FOOTERS ====================
            [
                'name' => 'Multi-Column Footer',
                'slug' => 'multi-column-footer',
                'description' => 'Full-featured 4-column site footer with company description, organized link groups, and copyright bar.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::multiColumnFooterDocument()),
            ],
            [
                'name' => 'SaaS Newsletter Footer',
                'slug' => 'saas-newsletter-footer',
                'description' => 'Modern SaaS footer with integrated newsletter subscription callout, link columns, and copyright.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::newsletterFooterDocument()),
            ],
            [
                'name' => 'Minimal Clean Footer',
                'slug' => 'minimal-footer',
                'description' => 'Clean and compact horizontal footer with brand copyright and inline navigation links.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::minimalFooterDocument()),
            ],
            [
                'name' => 'Centered Brand Footer',
                'slug' => 'centered-brand-footer',
                'description' => 'Symmetric centered footer featuring company motto, horizontal navigation pills, and copyright.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::centeredBrandFooterDocument()),
            ],
            [
                'name' => 'Dark Mega Footer',
                'slug' => 'dark-mega-footer',
                'description' => 'Rich enterprise dark footer with company bio, live status indicator, comprehensive solution links, and legal info.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::darkMegaFooterDocument()),
            ],
            [
                'name' => 'Editorial Footer',
                'slug' => 'editorial-footer',
                'description' => 'Publishing-style responsive footer with brand note, newsletter prompt, link groups, and social proof line.',
                'type' => 'footer',
                'document' => self::withResponsiveDefaults(self::editorialFooterDocument()),
            ],

            // ==================== PAGE BLUEPRINTS ====================
            [
                'name' => 'Modern Landing Page',
                'slug' => 'modern-landing-page',
                'description' => 'High-converting responsive landing page blueprint with hero statement, key features, and call-to-action.',
                'type' => 'page',
                'document' => self::withResponsiveDefaults(self::landingPageDocument()),
            ],
            [
                'name' => 'Agency & Portfolio Blueprint',
                'slug' => 'agency-portfolio-blueprint',
                'description' => 'Showcase blueprint for agencies and creatives with bold headline, project highlight cards, and inquiry CTA.',
                'type' => 'page',
                'document' => self::withResponsiveDefaults(self::agencyPortfolioDocument()),
            ],
            [
                'name' => 'SaaS Product Blueprint',
                'slug' => 'saas-product-blueprint',
                'description' => 'Comprehensive SaaS blueprint featuring value proposition hero, feature grid, 3-tier pricing table, and conversion banner.',
                'type' => 'page',
                'document' => self::withResponsiveDefaults(self::saasProductDocument()),
            ],
            [
                'name' => 'Blank Canvas Blueprint',
                'slug' => 'blank-canvas-blueprint',
                'description' => 'Clean full-width container layout ready for custom block and section composition.',
                'type' => 'page',
                'document' => self::withResponsiveDefaults(self::blankCanvasDocument()),
            ],
            [
                'name' => 'Local Service Blueprint',
                'slug' => 'local-service-blueprint',
                'description' => 'Lead-generation page blueprint for local services with trust badges, service cards, and booking call-to-action.',
                'type' => 'page',
                'document' => self::withResponsiveDefaults(self::localServiceDocument()),
            ],
        ];
    }

    /**
     * Create starter document for a given template type.
     *
     * @return array<string, mixed>
     */
    public static function documentForType(string $type): array
    {
        return match ($type) {
            'header' => self::withResponsiveDefaults(self::mainHeaderDocument()),
            'footer' => self::withResponsiveDefaults(self::multiColumnFooterDocument()),
            default => self::withResponsiveDefaults(self::landingPageDocument()),
        };
    }

    // ==================== HEADERS ====================

    /** @return array<string, mixed> */
    public static function mainHeaderDocument(): array
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
                        'id' => 'global-header-navbar',
                        'type' => 'layout.navbar',
                        'props' => [
                            'brandName' => 'HelloWeb',
                            'brandLogo' => '/images/helloweb-logo-light.png',
                            'brandHref' => '/',
                            'links' => [
                                ['label' => 'Home', 'href' => '/'],
                                ['label' => 'About', 'href' => '/about'],
                                ['label' => 'Services', 'href' => '#services'],
                                ['label' => 'Contact', 'href' => '#contact'],
                            ],
                            'ctaText' => 'Get Started',
                            'ctaHref' => '#contact',
                            'showCta' => true,
                        ],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '1rem 2rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function minimalHeaderDocument(): array
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
                        'id' => 'minimal-header-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '2rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'minimal-header-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1100px',
                                        'margin' => '0 auto',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'minimal-header-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'minimal-header-brand',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Studio', 'level' => 2],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '1.75rem',
                                                        'fontWeight' => 800,
                                                        'color' => '#0f172a',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'minimal-header-nav',
                                                'type' => 'layout.flex',
                                                'props' => [],
                                                'styles' => [
                                                    'desktop' => [
                                                        'gap' => '2rem',
                                                        'justifyContent' => 'center',
                                                    ],
                                                ],
                                                'children' => [
                                                    [
                                                        'id' => 'min-nav-1',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Works', 'href' => '#works'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.875rem', 'fontWeight' => 500, 'color' => '#475569']],
                                                        'children' => [],
                                                    ],
                                                    [
                                                        'id' => 'min-nav-2',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Studio', 'href' => '#studio'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.875rem', 'fontWeight' => 500, 'color' => '#475569']],
                                                        'children' => [],
                                                    ],
                                                    [
                                                        'id' => 'min-nav-3',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Journal', 'href' => '#journal'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.875rem', 'fontWeight' => 500, 'color' => '#475569']],
                                                        'children' => [],
                                                    ],
                                                    [
                                                        'id' => 'min-nav-4',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Contact', 'href' => '#contact'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.875rem', 'fontWeight' => 500, 'color' => '#475569']],
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
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function darkGlowHeaderDocument(): array
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
                        'id' => 'dark-glow-header-navbar',
                        'type' => 'layout.navbar',
                        'props' => [
                            'brandName' => 'HelloWeb',
                            'brandLogo' => '/images/helloweb-logo-dark.png',
                            'brandHref' => '/',
                            'links' => [
                                ['label' => 'Products', 'href' => '#products'],
                                ['label' => 'Solutions', 'href' => '#solutions'],
                                ['label' => 'Ecosystem', 'href' => '#ecosystem'],
                                ['label' => 'Pricing', 'href' => '#pricing'],
                            ],
                            'ctaText' => 'Launch App',
                            'ctaHref' => '#launch',
                            'showCta' => true,
                            'sticky' => true,
                        ],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#080b11',
                                'color' => '#f8fafc',
                                'padding' => '1.25rem 2rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function floatingPillHeaderDocument(): array
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
                        'id' => 'floating-pill-navbar',
                        'type' => 'layout.navbar',
                        'props' => [
                            'brandName' => 'HelloWeb',
                            'brandLogo' => '/images/helloweb-logo-light.png',
                            'brandHref' => '/',
                            'links' => [
                                ['label' => 'Features', 'href' => '#features'],
                                ['label' => 'Blueprints', 'href' => '#blueprints'],
                                ['label' => 'Pricing', 'href' => '#pricing'],
                                ['label' => 'Docs', 'href' => '#docs'],
                            ],
                            'ctaText' => 'Get Started',
                            'ctaHref' => '#get-started',
                            'showCta' => true,
                            'sticky' => false,
                        ],
                        'styles' => [
                            'desktop' => [
                                'position' => 'absolute',
                                'top' => '2rem',
                                'left' => '1.5rem',
                                'right' => '1.5rem',
                                'zIndex' => 60,
                                'maxWidth' => '960px',
                                'margin' => '0 auto',
                                'padding' => '0.75rem 1.75rem',
                                'borderRadius' => '9999px',
                                'backgroundColor' => '#ffffff',
                                'boxShadow' => '0 18px 50px rgba(15,23,42,.18)',
                                'backdropFilter' => 'blur(18px)',
                            ],
                            'tablet' => [
                                'top' => '1.5rem',
                                'left' => '1.25rem',
                                'right' => '1.25rem',
                                'maxWidth' => '100%',
                            ],
                            'mobile' => [
                                'top' => '1.5rem',
                                'left' => '1rem',
                                'right' => '1rem',
                                'maxWidth' => '100%',
                                'padding' => '0.65rem 1rem',
                            ],
                        ],
                        'children' => [],
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function splitCtaHeaderDocument(): array
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
                        'id' => 'split-cta-header-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'borderBottomWidth' => '1px',
                                'borderBottomStyle' => 'solid',
                                'borderBottomColor' => '#e2e8f0',
                                'padding' => '0',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'split-cta-announcement-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'backgroundColor' => '#e0f2fe',
                                        'display' => 'flex',
                                        'justifyContent' => 'center',
                                        'padding' => '0.55rem 1rem',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'split-cta-announcement-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['alignItems' => 'center']],
                                        'children' => [
                                            [
                                                'id' => 'split-cta-announcement-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'New: launch polished client sites faster with reusable theme blueprints.'],
                                                'styles' => ['desktop' => ['color' => '#075985', 'fontSize' => '0.8125rem', 'fontWeight' => 700, 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'split-cta-nav-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1180px',
                                        'margin' => '0 auto',
                                        'padding' => '1rem 1.5rem',
                                        'display' => 'flex',
                                        'alignItems' => 'center',
                                        'justifyContent' => 'space-between',
                                        'gap' => '2rem',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'split-cta-brand-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '28%']],
                                        'children' => [
                                            [
                                                'id' => 'split-cta-brand',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'HelloWeb', 'level' => 3],
                                                'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1.25rem', 'fontWeight' => 900]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'split-cta-links-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '44%']],
                                        'children' => [
                                            [
                                                'id' => 'split-cta-links',
                                                'type' => 'layout.flex',
                                                'props' => [],
                                                'styles' => ['desktop' => ['gap' => '1.5rem', 'justifyContent' => 'center']],
                                                'children' => [
                                                    ['id' => 'split-cta-link-1', 'type' => 'content.link', 'props' => ['text' => 'Features', 'href' => '#features'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 600]], 'children' => []],
                                                    ['id' => 'split-cta-link-2', 'type' => 'content.link', 'props' => ['text' => 'Workflows', 'href' => '#workflows'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 600]], 'children' => []],
                                                    ['id' => 'split-cta-link-3', 'type' => 'content.link', 'props' => ['text' => 'Pricing', 'href' => '#pricing'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 600]], 'children' => []],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'split-cta-actions-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '28%', 'alignItems' => 'flex-end']],
                                        'children' => [
                                            [
                                                'id' => 'split-cta-actions',
                                                'type' => 'layout.flex',
                                                'props' => [],
                                                'styles' => ['desktop' => ['gap' => '0.75rem', 'justifyContent' => 'flex-end']],
                                                'children' => [
                                                    ['id' => 'split-cta-login', 'type' => 'content.link', 'props' => ['text' => 'Sign in', 'href' => '/login'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 700]], 'children' => []],
                                                    ['id' => 'split-cta-button', 'type' => 'content.button', 'props' => ['text' => 'Book demo', 'href' => '#demo'], 'styles' => ['desktop' => ['backgroundColor' => '#0f172a', 'borderRadius' => '9999px', 'color' => '#ffffff', 'fontWeight' => 800, 'padding' => '0.65rem 1rem']], 'children' => []],
                                                ],
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

    // ==================== FOOTERS ====================

    /** @return array<string, mixed> */
    public static function multiColumnFooterDocument(): array
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
                        'id' => 'global-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#0f172a',
                                'padding' => '4rem 2rem 2.5rem 2rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'global-footer-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1200px',
                                        'margin' => '0 auto',
                                        'display' => 'flex',
                                        'gap' => '3rem',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'footer-col-brand',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '40%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '1rem']],
                                        'children' => [
                                            [
                                                'id' => 'footer-brand-title',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'HelloWeb', 'level' => 3],
                                                'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '1.35rem', 'fontWeight' => 800]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'footer-brand-bio',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'The next-generation visual builder framework for modern digital experiences.'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.875rem', 'lineHeight' => 1.6]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'footer-col-product',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '20%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.75rem']],
                                        'children' => [
                                            [
                                                'id' => 'footer-prod-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Product', 'level' => 4],
                                                'styles' => ['desktop' => ['color' => '#f8fafc', 'fontSize' => '0.875rem', 'fontWeight' => 700]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'footer-prod-1',
                                                'type' => 'content.link',
                                                'props' => ['text' => 'Builder Features', 'href' => '#features'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'footer-prod-2',
                                                'type' => 'content.link',
                                                'props' => ['text' => 'Templates', 'href' => '/templates'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'footer-col-company',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '20%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.75rem']],
                                        'children' => [
                                            [
                                                'id' => 'footer-comp-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Company', 'level' => 4],
                                                'styles' => ['desktop' => ['color' => '#f8fafc', 'fontSize' => '0.875rem', 'fontWeight' => 700]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'footer-comp-1',
                                                'type' => 'content.link',
                                                'props' => ['text' => 'About Us', 'href' => '/about'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'footer-comp-2',
                                                'type' => 'content.link',
                                                'props' => ['text' => 'Contact', 'href' => '#contact'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'footer-bottom-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1200px',
                                        'margin' => '3rem auto 0 auto',
                                        'padding' => '1.5rem 0 0 0',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'footer-copyright-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '100%']],
                                        'children' => [
                                            [
                                                'id' => 'footer-copyright-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => '© '.date('Y').' HelloWeb. Built with modern framework architecture.'],
                                                'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.75rem', 'textAlign' => 'center']],
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
    public static function newsletterFooterDocument(): array
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
                        'id' => 'nl-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#0b1120',
                                'padding' => '4.5rem 2rem 2.5rem 2rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'nl-footer-top-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1200px',
                                        'margin' => '0 auto',
                                        'display' => 'flex',
                                        'justifyContent' => 'space-between',
                                        'alignItems' => 'center',
                                        'gap' => '2rem',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'nl-footer-msg-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '60%']],
                                        'children' => [
                                            [
                                                'id' => 'nl-footer-title',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Stay ahead with the latest blueprints & components', 'level' => 3],
                                                'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '1.5rem', 'fontWeight' => 700]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'nl-footer-desc',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Join creators receiving release notes, theme templates, and framework tutorials.'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.875rem', 'lineHeight' => 1.6]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'nl-footer-action-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '35%', 'display' => 'flex', 'gap' => '0.75rem']],
                                        'children' => [
                                            [
                                                'id' => 'nl-footer-btn',
                                                'type' => 'content.button',
                                                'props' => ['text' => 'Subscribe to Updates', 'href' => '#newsletter'],
                                                'styles' => ['desktop' => ['backgroundColor' => '#2563eb', 'color' => '#ffffff', 'padding' => '12px 24px', 'borderRadius' => '8px', 'fontWeight' => 600]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'nl-footer-divider',
                                'type' => 'layout.divider',
                                'props' => [],
                                'styles' => ['desktop' => ['borderColor' => '#1e293b', 'margin' => '2.5rem 0']],
                                'children' => [],
                            ],
                            [
                                'id' => 'nl-footer-cols-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '2rem']],
                                'children' => [
                                    [
                                        'id' => 'nl-col-brand',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '34%']],
                                        'children' => [
                                            [
                                                'id' => 'nl-b-title',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'HelloWeb', 'level' => 4],
                                                'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '1.25rem', 'fontWeight' => 800]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'nl-b-desc',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Empowering modern web development with structured tree persistence.'],
                                                'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.8125rem', 'lineHeight' => 1.5]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'nl-col-1',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '22%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.5rem']],
                                        'children' => [
                                            [
                                                'id' => 'nl-col-1-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Platform', 'level' => 5],
                                                'styles' => ['desktop' => ['color' => '#e2e8f0', 'fontSize' => '0.875rem', 'fontWeight' => 600]],
                                                'children' => [],
                                            ],
                                            ['id' => 'nl-c1-l1', 'type' => 'content.link', 'props' => ['text' => 'Builder Studio', 'href' => '/builder'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'nl-c1-l2', 'type' => 'content.link', 'props' => ['text' => 'Templates Catalog', 'href' => '/templates'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'nl-c1-l3', 'type' => 'content.link', 'props' => ['text' => 'Reusable Blocks', 'href' => '/reusable-components'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'nl-col-2',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '22%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.5rem']],
                                        'children' => [
                                            [
                                                'id' => 'nl-col-2-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Resources', 'level' => 5],
                                                'styles' => ['desktop' => ['color' => '#e2e8f0', 'fontSize' => '0.875rem', 'fontWeight' => 600]],
                                                'children' => [],
                                            ],
                                            ['id' => 'nl-c2-l1', 'type' => 'content.link', 'props' => ['text' => 'Architecture Docs', 'href' => '#docs'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'nl-c2-l2', 'type' => 'content.link', 'props' => ['text' => 'Release Notes', 'href' => '#releases'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'nl-col-3',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '22%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.5rem']],
                                        'children' => [
                                            [
                                                'id' => 'nl-col-3-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Legal', 'level' => 5],
                                                'styles' => ['desktop' => ['color' => '#e2e8f0', 'fontSize' => '0.875rem', 'fontWeight' => 600]],
                                                'children' => [],
                                            ],
                                            ['id' => 'nl-c3-l1', 'type' => 'content.link', 'props' => ['text' => 'Privacy Policy', 'href' => '#privacy'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'nl-c3-l2', 'type' => 'content.link', 'props' => ['text' => 'Terms of Service', 'href' => '#terms'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'nl-footer-copy-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '2.5rem auto 0 auto', 'padding' => '1.5rem 0 0 0']],
                                'children' => [
                                    [
                                        'id' => 'nl-copy-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '100%']],
                                        'children' => [
                                            [
                                                'id' => 'nl-copy-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => '© '.date('Y').' HelloWeb. Engineered for scale and design freedom.'],
                                                'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.75rem', 'textAlign' => 'center']],
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
    public static function minimalFooterDocument(): array
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
                        'id' => 'minimal-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f8fafc',
                                'padding' => '2rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'min-footer-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1100px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'min-footer-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'justifyContent' => 'space-between',
                                                'alignItems' => 'center',
                                                'flexWrap' => 'wrap',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'min-footer-copy',
                                                'type' => 'content.text',
                                                'props' => ['text' => '© '.date('Y').' All rights reserved.'],
                                                'styles' => ['desktop' => ['fontSize' => '0.8125rem', 'color' => '#64748b']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'min-footer-links',
                                                'type' => 'layout.flex',
                                                'props' => [],
                                                'styles' => ['desktop' => ['gap' => '1.5rem']],
                                                'children' => [
                                                    [
                                                        'id' => 'min-f-link-1',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Privacy', 'href' => '#privacy'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.8125rem', 'color' => '#64748b']],
                                                        'children' => [],
                                                    ],
                                                    [
                                                        'id' => 'min-f-link-2',
                                                        'type' => 'content.link',
                                                        'props' => ['text' => 'Terms', 'href' => '#terms'],
                                                        'styles' => ['desktop' => ['fontSize' => '0.8125rem', 'color' => '#64748b']],
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
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function centeredBrandFooterDocument(): array
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
                        'id' => 'centered-brand-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f8fafc',
                                'padding' => '4rem 1.5rem 2.5rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'centered-footer-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '800px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'centered-footer-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.25rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'c-footer-logo-title',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'HelloWeb', 'level' => 3],
                                                'styles' => ['desktop' => ['fontSize' => '1.75rem', 'fontWeight' => 800, 'color' => '#0f172a']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'c-footer-motto',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Empowering founders, agencies, and creators to build without boundaries.'],
                                                'styles' => ['desktop' => ['fontSize' => '0.9375rem', 'color' => '#64748b', 'textAlign' => 'center', 'lineHeight' => 1.5]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'c-footer-nav',
                                                'type' => 'layout.flex',
                                                'props' => [],
                                                'styles' => ['desktop' => ['gap' => '1.75rem', 'justifyContent' => 'center', 'flexWrap' => 'wrap']],
                                                'children' => [
                                                    ['id' => 'c-fn-1', 'type' => 'content.link', 'props' => ['text' => 'Features', 'href' => '#features'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 500]], 'children' => []],
                                                    ['id' => 'c-fn-2', 'type' => 'content.link', 'props' => ['text' => 'Templates', 'href' => '/templates'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 500]], 'children' => []],
                                                    ['id' => 'c-fn-3', 'type' => 'content.link', 'props' => ['text' => 'Pricing', 'href' => '#pricing'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 500]], 'children' => []],
                                                    ['id' => 'c-fn-4', 'type' => 'content.link', 'props' => ['text' => 'Contact', 'href' => '#contact'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem', 'fontWeight' => 500]], 'children' => []],
                                                ],
                                            ],
                                            [
                                                'id' => 'c-footer-divider',
                                                'type' => 'layout.divider',
                                                'props' => [],
                                                'styles' => ['desktop' => ['borderColor' => '#e2e8f0', 'width' => '100%']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'c-footer-copy',
                                                'type' => 'content.text',
                                                'props' => ['text' => '© '.date('Y').' HelloWeb Inc. All rights reserved.'],
                                                'styles' => ['desktop' => ['fontSize' => '0.8125rem', 'color' => '#94a3b8']],
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
    public static function darkMegaFooterDocument(): array
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
                        'id' => 'dark-mega-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#07090e',
                                'padding' => '5rem 2rem 2.5rem 2rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'dm-footer-grid-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '3rem']],
                                'children' => [
                                    [
                                        'id' => 'dm-brand-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '40%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '1rem']],
                                        'children' => [
                                            [
                                                'id' => 'dm-brand-title',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'HelloWeb Enterprise', 'level' => 3],
                                                'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '1.5rem', 'fontWeight' => 800]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'dm-brand-desc',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'The complete website builder framework built with clean boundaries, extensible schemas, and enterprise reliability.'],
                                                'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.875rem', 'lineHeight' => 1.6]],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'dm-status-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => '● All Systems Operational · v2.5 Stable'],
                                                'styles' => ['desktop' => ['color' => '#10b981', 'fontSize' => '0.75rem', 'fontWeight' => 600]],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'dm-col-solutions',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '20%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.65rem']],
                                        'children' => [
                                            ['id' => 'dm-sol-h', 'type' => 'content.heading', 'props' => ['text' => 'Solutions', 'level' => 5], 'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '0.875rem', 'fontWeight' => 700]], 'children' => []],
                                            ['id' => 'dm-sol-1', 'type' => 'content.link', 'props' => ['text' => 'For Agencies', 'href' => '#agencies'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-sol-2', 'type' => 'content.link', 'props' => ['text' => 'For Startups', 'href' => '#startups'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-sol-3', 'type' => 'content.link', 'props' => ['text' => 'For Enterprises', 'href' => '#enterprises'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'dm-col-ecosystem',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '20%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.65rem']],
                                        'children' => [
                                            ['id' => 'dm-eco-h', 'type' => 'content.heading', 'props' => ['text' => 'Ecosystem', 'level' => 5], 'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '0.875rem', 'fontWeight' => 700]], 'children' => []],
                                            ['id' => 'dm-eco-1', 'type' => 'content.link', 'props' => ['text' => 'Theme Templates', 'href' => '/templates'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-eco-2', 'type' => 'content.link', 'props' => ['text' => 'Reusable Blocks', 'href' => '/reusable-components'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-eco-3', 'type' => 'content.link', 'props' => ['text' => 'Media Assets', 'href' => '/media'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'dm-col-support',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '20%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '0.65rem']],
                                        'children' => [
                                            ['id' => 'dm-sup-h', 'type' => 'content.heading', 'props' => ['text' => 'Support', 'level' => 5], 'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '0.875rem', 'fontWeight' => 700]], 'children' => []],
                                            ['id' => 'dm-sup-1', 'type' => 'content.link', 'props' => ['text' => 'Documentation', 'href' => '#docs'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-sup-2', 'type' => 'content.link', 'props' => ['text' => 'API Reference', 'href' => '#api'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                            ['id' => 'dm-sup-3', 'type' => 'content.link', 'props' => ['text' => 'System Status', 'href' => '#status'], 'styles' => ['desktop' => ['color' => '#94a3b8', 'fontSize' => '0.8125rem']], 'children' => []],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'dm-footer-bottom-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '3rem auto 0 auto', 'padding' => '1.5rem 0 0 0']],
                                'children' => [
                                    [
                                        'id' => 'dm-copy-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '100%']],
                                        'children' => [
                                            [
                                                'id' => 'dm-copy-text',
                                                'type' => 'content.text',
                                                'props' => ['text' => '© '.date('Y').' HelloWeb Inc. All rights reserved. Enterprise-grade visual builder.'],
                                                'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.75rem', 'textAlign' => 'center']],
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
    public static function editorialFooterDocument(): array
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
                        'id' => 'editorial-footer-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f8fafc',
                                'borderTopWidth' => '1px',
                                'borderTopStyle' => 'solid',
                                'borderTopColor' => '#e2e8f0',
                                'padding' => '4.5rem 1.5rem 2rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'editorial-footer-main-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1120px',
                                        'margin' => '0 auto',
                                        'display' => 'flex',
                                        'gap' => '3rem',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'editorial-footer-brand-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '42%',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            ['id' => 'editorial-footer-title', 'type' => 'content.heading', 'props' => ['text' => 'HelloWeb Journal', 'level' => 3], 'styles' => ['desktop' => ['color' => '#111827', 'fontSize' => '1.5rem', 'fontWeight' => 900]], 'children' => []],
                                            ['id' => 'editorial-footer-note', 'type' => 'content.text', 'props' => ['text' => 'Ideas, launch notes, and practical guidance for teams building better websites with a real visual framework.'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.95rem', 'lineHeight' => 1.65]], 'children' => []],
                                            ['id' => 'editorial-footer-proof', 'type' => 'content.text', 'props' => ['text' => 'Trusted by founders, agencies, and platform teams.'], 'styles' => ['desktop' => ['color' => '#0f766e', 'fontSize' => '0.8125rem', 'fontWeight' => 800]], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'editorial-footer-links-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '29%']],
                                        'children' => [
                                            [
                                                'id' => 'editorial-footer-links-stack',
                                                'type' => 'layout.stack',
                                                'props' => [],
                                                'styles' => ['desktop' => ['gap' => '0.65rem']],
                                                'children' => [
                                                    ['id' => 'editorial-footer-lh', 'type' => 'content.heading', 'props' => ['text' => 'Explore', 'level' => 4], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '0.875rem', 'fontWeight' => 800]], 'children' => []],
                                                    ['id' => 'editorial-footer-l1', 'type' => 'content.link', 'props' => ['text' => 'Blueprints', 'href' => '/templates'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem']], 'children' => []],
                                                    ['id' => 'editorial-footer-l2', 'type' => 'content.link', 'props' => ['text' => 'Components', 'href' => '/reusable-components'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem']], 'children' => []],
                                                    ['id' => 'editorial-footer-l3', 'type' => 'content.link', 'props' => ['text' => 'Media Library', 'href' => '/media'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '0.875rem']], 'children' => []],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'editorial-footer-news-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '29%',
                                                'backgroundColor' => '#ffffff',
                                                'borderRadius' => '12px',
                                                'padding' => '1.25rem',
                                            ],
                                        ],
                                        'children' => [
                                            ['id' => 'editorial-footer-news-h', 'type' => 'content.heading', 'props' => ['text' => 'Monthly field notes', 'level' => 4], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1rem', 'fontWeight' => 800]], 'children' => []],
                                            ['id' => 'editorial-footer-news-p', 'type' => 'content.text', 'props' => ['text' => 'Get practical builder patterns and release highlights in your inbox.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.875rem', 'lineHeight' => 1.5]], 'children' => []],
                                            ['id' => 'editorial-footer-news-btn', 'type' => 'content.button', 'props' => ['text' => 'Subscribe', 'href' => '#subscribe'], 'styles' => ['desktop' => ['backgroundColor' => '#0f172a', 'borderRadius' => '8px', 'color' => '#ffffff', 'fontWeight' => 800, 'marginTop' => '1rem', 'padding' => '0.75rem 1rem', 'textAlign' => 'center']], 'children' => []],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'editorial-footer-bottom-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => [
                                    'desktop' => [
                                        'maxWidth' => '1120px',
                                        'margin' => '2.5rem auto 0 auto',
                                        'paddingTop' => '1.25rem',
                                        'borderTopWidth' => '1px',
                                        'borderTopStyle' => 'solid',
                                        'borderTopColor' => '#e2e8f0',
                                    ],
                                ],
                                'children' => [
                                    [
                                        'id' => 'editorial-footer-copy-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['alignItems' => 'center']],
                                        'children' => [
                                            ['id' => 'editorial-footer-copy', 'type' => 'content.text', 'props' => ['text' => '© '.date('Y').' HelloWeb. Framework-first website building.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.8125rem', 'textAlign' => 'center']], 'children' => []],
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

    // ==================== PAGE BLUEPRINTS ====================

    /** @return array<string, mixed> */
    public static function landingPageDocument(): array
    {
        return (new DefaultBuilderDocumentFactory)->create()->toArray();
    }

    /** @return array<string, mixed> */
    public static function agencyPortfolioDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    // Section 1: Hero
                    [
                        'id' => 'agency-hero-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#f8fafc',
                                'padding' => '6rem 1.5rem 5rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'agency-hero-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '960px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'agency-hero-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.5rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'agency-hero-badge',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'CREATIVE DIGITAL STUDIO'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '0.8125rem',
                                                        'fontWeight' => 700,
                                                        'letterSpacing' => '0.1em',
                                                        'color' => '#2563eb',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'agency-hero-heading',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'We craft distinct digital identities & high-impact websites', 'level' => 1],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '3rem',
                                                        'fontWeight' => 800,
                                                        'lineHeight' => 1.15,
                                                        'color' => '#0f172a',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'agency-hero-sub',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Partnering with visionary founders and established brands to build extraordinary digital experiences.'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '1.125rem',
                                                        'color' => '#64748b',
                                                        'textAlign' => 'center',
                                                        'lineHeight' => 1.6,
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'agency-hero-cta',
                                                'type' => 'content.button',
                                                'props' => ['text' => 'Explore Selected Works', 'href' => '#portfolio'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'backgroundColor' => '#0f172a',
                                                        'color' => '#ffffff',
                                                        'padding' => '14px 32px',
                                                        'borderRadius' => '8px',
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

                    // Section 2: Projects Showcase
                    [
                        'id' => 'agency-projects-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '6rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'agency-projects-header-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '0 auto 3rem auto']],
                                'children' => [
                                    [
                                        'id' => 'agency-proj-h-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '100%']],
                                        'children' => [
                                            [
                                                'id' => 'agency-proj-heading',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Featured Client Engagements', 'level' => 2],
                                                'styles' => ['desktop' => ['fontSize' => '2rem', 'fontWeight' => 700, 'color' => '#0f172a']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'agency-projects-grid-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '2rem']],
                                'children' => [
                                    [
                                        'id' => 'agency-col-1',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '50%']],
                                        'children' => [
                                            [
                                                'id' => 'agency-card-1',
                                                'type' => 'marketing.blurb',
                                                'props' => [
                                                    'icon' => 'sparkles',
                                                    'title' => 'Fintech Brand Architecture',
                                                    'description' => 'Complete digital experience and scalable design system engineered for a global payments network.',
                                                    'linkText' => 'View Case Study →',
                                                    'linkHref' => '#case-1',
                                                    'iconColor' => '#2563eb',
                                                    'iconBg' => '#eff6ff',
                                                ],
                                                'styles' => ['desktop' => ['padding' => '2.5rem', 'backgroundColor' => '#f8fafc', 'borderRadius' => '16px']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'agency-col-2',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '50%']],
                                        'children' => [
                                            [
                                                'id' => 'agency-card-2',
                                                'type' => 'marketing.blurb',
                                                'props' => [
                                                    'icon' => 'sparkles',
                                                    'title' => 'SaaS Analytics Workspace',
                                                    'description' => 'High-throughput analytics visualization dashboard designed with responsive precision.',
                                                    'linkText' => 'View Case Study →',
                                                    'linkHref' => '#case-2',
                                                    'iconColor' => '#059669',
                                                    'iconBg' => '#ecfdf5',
                                                ],
                                                'styles' => ['desktop' => ['padding' => '2.5rem', 'backgroundColor' => '#f8fafc', 'borderRadius' => '16px']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // Section 3: Call to Action Banner
                    [
                        'id' => 'agency-cta-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#0f172a',
                                'padding' => '6rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'agency-cta-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '800px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'agency-cta-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.5rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'agency-cta-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Ready to build something unforgettable?', 'level' => 2],
                                                'styles' => ['desktop' => ['fontSize' => '2.25rem', 'fontWeight' => 800, 'color' => '#ffffff', 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'agency-cta-p',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Let us talk about your timeline, vision, and how we can bring it to life.'],
                                                'styles' => ['desktop' => ['fontSize' => '1rem', 'color' => '#94a3b8', 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'agency-cta-btn',
                                                'type' => 'content.button',
                                                'props' => ['text' => 'Get in Touch With Us', 'href' => '#contact'],
                                                'styles' => ['desktop' => ['backgroundColor' => '#2563eb', 'color' => '#ffffff', 'padding' => '14px 32px', 'borderRadius' => '8px', 'fontWeight' => 600]],
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
    public static function saasProductDocument(): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [
                    // Section 1: SaaS Hero
                    [
                        'id' => 'saas-hero-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '6.5rem 1.5rem 4.5rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'saas-hero-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '960px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'saas-hero-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1.5rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'saas-badge',
                                                'type' => 'content.text',
                                                'props' => ['text' => '🚀 INTRODUCING HELLOWEB PLATFORM V2.5'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '0.8125rem',
                                                        'fontWeight' => 700,
                                                        'color' => '#059669',
                                                        'letterSpacing' => '0.05em',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'saas-hero-h',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Build and scale high-conversion websites in record time', 'level' => 1],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '3rem',
                                                        'fontWeight' => 800,
                                                        'lineHeight' => 1.15,
                                                        'color' => '#0f172a',
                                                        'textAlign' => 'center',
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'saas-hero-p',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Say goodbye to bloated builders. HelloWeb delivers clean, responsive component trees with enterprise performance.'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'fontSize' => '1.125rem',
                                                        'color' => '#64748b',
                                                        'textAlign' => 'center',
                                                        'lineHeight' => 1.6,
                                                    ],
                                                ],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'saas-hero-btn',
                                                'type' => 'content.button',
                                                'props' => ['text' => 'Start Your Free 14-Day Trial', 'href' => '#trial'],
                                                'styles' => [
                                                    'desktop' => [
                                                        'backgroundColor' => '#059669',
                                                        'color' => '#ffffff',
                                                        'padding' => '14px 32px',
                                                        'borderRadius' => '8px',
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

                    // Section 2: Features Grid
                    [
                        'id' => 'saas-feat-section',
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
                                'id' => 'saas-feat-grid-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1200px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '2rem']],
                                'children' => [
                                    [
                                        'id' => 'saas-feat-col-1',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '33.333%']],
                                        'children' => [
                                            [
                                                'id' => 'saas-blurb-1',
                                                'type' => 'marketing.blurb',
                                                'props' => [
                                                    'icon' => 'sparkles',
                                                    'title' => 'Tree Document Storage',
                                                    'description' => 'Pages are stored as immutable, structured document trees rather than brittle HTML strings.',
                                                    'linkText' => 'Learn more →',
                                                    'linkHref' => '#architecture',
                                                    'iconColor' => '#2563eb',
                                                    'iconBg' => '#eff6ff',
                                                ],
                                                'styles' => ['desktop' => ['padding' => '2rem', 'backgroundColor' => '#ffffff', 'borderRadius' => '12px']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'saas-feat-col-2',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '33.333%']],
                                        'children' => [
                                            [
                                                'id' => 'saas-blurb-2',
                                                'type' => 'marketing.blurb',
                                                'props' => [
                                                    'icon' => 'sparkles',
                                                    'title' => 'WordPress Theme Model',
                                                    'description' => 'Configure global headers, global footers, and page blueprints that stay synced across every page.',
                                                    'linkText' => 'Learn more →',
                                                    'linkHref' => '#theme',
                                                    'iconColor' => '#059669',
                                                    'iconBg' => '#ecfdf5',
                                                ],
                                                'styles' => ['desktop' => ['padding' => '2rem', 'backgroundColor' => '#ffffff', 'borderRadius' => '12px']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'saas-feat-col-3',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '33.333%']],
                                        'children' => [
                                            [
                                                'id' => 'saas-blurb-3',
                                                'type' => 'marketing.blurb',
                                                'props' => [
                                                    'icon' => 'sparkles',
                                                    'title' => 'Platform Catalog',
                                                    'description' => 'Central superadmin catalog providing curated components and layouts directly into user builders.',
                                                    'linkText' => 'Learn more →',
                                                    'linkHref' => '#catalog',
                                                    'iconColor' => '#d97706',
                                                    'iconBg' => '#fffbeb',
                                                ],
                                                'styles' => ['desktop' => ['padding' => '2rem', 'backgroundColor' => '#ffffff', 'borderRadius' => '12px']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // Section 3: Pricing Cards
                    [
                        'id' => 'saas-pricing-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'backgroundColor' => '#ffffff',
                                'padding' => '6rem 1.5rem',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'saas-price-h-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '800px', 'margin' => '0 auto 3.5rem auto']],
                                'children' => [
                                    [
                                        'id' => 'saas-price-h-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['display' => 'flex', 'flexDirection' => 'column', 'alignItems' => 'center', 'gap' => '0.75rem']],
                                        'children' => [
                                            [
                                                'id' => 'saas-price-heading',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Simple, Transparent Pricing', 'level' => 2],
                                                'styles' => ['desktop' => ['fontSize' => '2.25rem', 'fontWeight' => 800, 'color' => '#0f172a', 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'saas-price-desc',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Start free, upgrade as your site grows. No hidden transaction fees.'],
                                                'styles' => ['desktop' => ['fontSize' => '1rem', 'color' => '#64748b', 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'saas-price-grid-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1100px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '2rem']],
                                'children' => [
                                    [
                                        'id' => 'saas-plan-1',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '33.333%',
                                                'backgroundColor' => '#f8fafc',
                                                'padding' => '2.5rem',
                                                'borderRadius' => '16px',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            ['id' => 'sp1-h', 'type' => 'content.heading', 'props' => ['text' => 'Starter', 'level' => 3], 'styles' => ['desktop' => ['fontSize' => '1.25rem', 'fontWeight' => 700, 'color' => '#0f172a']], 'children' => []],
                                            ['id' => 'sp1-p', 'type' => 'content.text', 'props' => ['text' => '$19 / month'], 'styles' => ['desktop' => ['fontSize' => '2rem', 'fontWeight' => 800, 'color' => '#0f172a']], 'children' => []],
                                            ['id' => 'sp1-desc', 'type' => 'content.text', 'props' => ['text' => 'Ideal for personal sites, landing pages, and solo creators.'], 'styles' => ['desktop' => ['fontSize' => '0.875rem', 'color' => '#64748b']], 'children' => []],
                                            ['id' => 'sp1-btn', 'type' => 'content.button', 'props' => ['text' => 'Choose Starter', 'href' => '#starter'], 'styles' => ['desktop' => ['backgroundColor' => '#0f172a', 'color' => '#ffffff', 'padding' => '10px 20px', 'borderRadius' => '8px', 'fontWeight' => 600, 'textAlign' => 'center']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'saas-plan-2',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '33.333%',
                                                'backgroundColor' => '#0f172a',
                                                'padding' => '2.5rem',
                                                'borderRadius' => '16px',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            ['id' => 'sp2-h', 'type' => 'content.heading', 'props' => ['text' => 'Pro Creator', 'level' => 3], 'styles' => ['desktop' => ['fontSize' => '1.25rem', 'fontWeight' => 700, 'color' => '#10b981']], 'children' => []],
                                            ['id' => 'sp2-p', 'type' => 'content.text', 'props' => ['text' => '$49 / month'], 'styles' => ['desktop' => ['fontSize' => '2rem', 'fontWeight' => 800, 'color' => '#ffffff']], 'children' => []],
                                            ['id' => 'sp2-desc', 'type' => 'content.text', 'props' => ['text' => 'Full access to all theme blueprints, unlimited pages, and platform blocks.'], 'styles' => ['desktop' => ['fontSize' => '0.875rem', 'color' => '#94a3b8']], 'children' => []],
                                            ['id' => 'sp2-btn', 'type' => 'content.button', 'props' => ['text' => 'Get Started with Pro', 'href' => '#pro'], 'styles' => ['desktop' => ['backgroundColor' => '#10b981', 'color' => '#ffffff', 'padding' => '10px 20px', 'borderRadius' => '8px', 'fontWeight' => 600, 'textAlign' => 'center']], 'children' => []],
                                        ],
                                    ],
                                    [
                                        'id' => 'saas-plan-3',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'width' => '33.333%',
                                                'backgroundColor' => '#f8fafc',
                                                'padding' => '2.5rem',
                                                'borderRadius' => '16px',
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            ['id' => 'sp3-h', 'type' => 'content.heading', 'props' => ['text' => 'Enterprise', 'level' => 3], 'styles' => ['desktop' => ['fontSize' => '1.25rem', 'fontWeight' => 700, 'color' => '#0f172a']], 'children' => []],
                                            ['id' => 'sp3-p', 'type' => 'content.text', 'props' => ['text' => '$199 / month'], 'styles' => ['desktop' => ['fontSize' => '2rem', 'fontWeight' => 800, 'color' => '#0f172a']], 'children' => []],
                                            ['id' => 'sp3-desc', 'type' => 'content.text', 'props' => ['text' => 'Custom integrations, dedicated support, and multi-team workspaces.'], 'styles' => ['desktop' => ['fontSize' => '0.875rem', 'color' => '#64748b']], 'children' => []],
                                            ['id' => 'sp3-btn', 'type' => 'content.button', 'props' => ['text' => 'Contact Sales', 'href' => '#enterprise'], 'styles' => ['desktop' => ['backgroundColor' => '#0f172a', 'color' => '#ffffff', 'padding' => '10px 20px', 'borderRadius' => '8px', 'fontWeight' => 600, 'textAlign' => 'center']], 'children' => []],
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
    public static function blankCanvasDocument(): array
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
                        'id' => 'blank-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => [
                            'desktop' => [
                                'minHeight' => '60vh',
                                'padding' => '6rem 2rem',
                                'backgroundColor' => '#ffffff',
                                'width' => '100%',
                            ],
                        ],
                        'children' => [
                            [
                                'id' => 'blank-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '900px', 'margin' => '0 auto']],
                                'children' => [
                                    [
                                        'id' => 'blank-column',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => [
                                            'desktop' => [
                                                'display' => 'flex',
                                                'flexDirection' => 'column',
                                                'alignItems' => 'center',
                                                'gap' => '1rem',
                                            ],
                                        ],
                                        'children' => [
                                            [
                                                'id' => 'blank-heading',
                                                'type' => 'content.heading',
                                                'props' => ['text' => 'Blank Canvas Layout', 'level' => 2],
                                                'styles' => ['desktop' => ['fontSize' => '2.25rem', 'fontWeight' => 700, 'color' => '#0f172a', 'textAlign' => 'center']],
                                                'children' => [],
                                            ],
                                            [
                                                'id' => 'blank-desc',
                                                'type' => 'content.text',
                                                'props' => ['text' => 'Add your components, columns, and content here to build your page.'],
                                                'styles' => ['desktop' => ['fontSize' => '1.125rem', 'color' => '#64748b', 'textAlign' => 'center']],
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
    public static function localServiceDocument(): array
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
                        'id' => 'local-service-hero-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => ['desktop' => ['backgroundColor' => '#f0fdfa', 'padding' => '6rem 1.5rem', 'width' => '100%']],
                        'children' => [
                            [
                                'id' => 'local-service-hero-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1120px', 'margin' => '0 auto', 'display' => 'flex', 'alignItems' => 'center', 'gap' => '3rem']],
                                'children' => [
                                    [
                                        'id' => 'local-service-copy-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '58%', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '1.25rem']],
                                        'children' => [
                                            ['id' => 'local-service-badge', 'type' => 'content.text', 'props' => ['text' => 'LOCAL SERVICE BLUEPRINT'], 'styles' => ['desktop' => ['color' => '#0f766e', 'fontSize' => '0.8125rem', 'fontWeight' => 900]], 'children' => []],
                                            ['id' => 'local-service-heading', 'type' => 'content.heading', 'props' => ['text' => 'Book more qualified jobs from your local website', 'level' => 1], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '3.25rem', 'fontWeight' => 900, 'lineHeight' => 1.05]], 'children' => []],
                                            ['id' => 'local-service-lede', 'type' => 'content.text', 'props' => ['text' => 'A responsive page structure for contractors, clinics, consultants, and service teams that need trust, clarity, and fast appointment requests.'], 'styles' => ['desktop' => ['color' => '#475569', 'fontSize' => '1.125rem', 'lineHeight' => 1.65]], 'children' => []],
                                            ['id' => 'local-service-hero-actions', 'type' => 'layout.flex', 'props' => [], 'styles' => ['desktop' => ['gap' => '0.85rem', 'flexWrap' => 'wrap']], 'children' => [
                                                ['id' => 'local-service-primary-btn', 'type' => 'content.button', 'props' => ['text' => 'Request a Quote', 'href' => '#quote'], 'styles' => ['desktop' => ['backgroundColor' => '#0f766e', 'borderRadius' => '10px', 'color' => '#ffffff', 'fontWeight' => 800, 'padding' => '0.875rem 1.25rem']], 'children' => []],
                                                ['id' => 'local-service-secondary-btn', 'type' => 'content.button', 'props' => ['text' => 'Call Today', 'href' => 'tel:+15551234567'], 'styles' => ['desktop' => ['backgroundColor' => '#ffffff', 'borderRadius' => '10px', 'color' => '#0f172a', 'fontWeight' => 800, 'padding' => '0.875rem 1.25rem']], 'children' => []],
                                            ]],
                                        ],
                                    ],
                                    [
                                        'id' => 'local-service-card-col',
                                        'type' => 'layout.column',
                                        'props' => [],
                                        'styles' => ['desktop' => ['width' => '42%', 'backgroundColor' => '#ffffff', 'borderRadius' => '18px', 'padding' => '2rem', 'boxShadow' => '0 18px 50px rgba(15,23,42,.18)']],
                                        'children' => [
                                            ['id' => 'local-service-card-h', 'type' => 'content.heading', 'props' => ['text' => 'Same-week availability', 'level' => 3], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1.5rem', 'fontWeight' => 800]], 'children' => []],
                                            ['id' => 'local-service-card-p', 'type' => 'content.text', 'props' => ['text' => 'Licensed local team, transparent estimates, and a simple booking flow ready to customize.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.95rem', 'lineHeight' => 1.6]], 'children' => []],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'local-service-services-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => ['desktop' => ['backgroundColor' => '#ffffff', 'padding' => '5rem 1.5rem', 'width' => '100%']],
                        'children' => [
                            [
                                'id' => 'local-service-services-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '1120px', 'margin' => '0 auto', 'display' => 'flex', 'gap' => '1.5rem']],
                                'children' => [
                                    ['id' => 'local-service-service-1', 'type' => 'layout.column', 'props' => [], 'styles' => ['desktop' => ['width' => '33.333%', 'backgroundColor' => '#f8fafc', 'borderRadius' => '14px', 'padding' => '1.5rem']], 'children' => [
                                        ['id' => 'lss1-h', 'type' => 'content.heading', 'props' => ['text' => 'Consultation', 'level' => 3], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1.2rem', 'fontWeight' => 800]], 'children' => []],
                                        ['id' => 'lss1-p', 'type' => 'content.text', 'props' => ['text' => 'Introduce the service and set expectations for your first visit or call.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.9rem']], 'children' => []],
                                    ]],
                                    ['id' => 'local-service-service-2', 'type' => 'layout.column', 'props' => [], 'styles' => ['desktop' => ['width' => '33.333%', 'backgroundColor' => '#f8fafc', 'borderRadius' => '14px', 'padding' => '1.5rem']], 'children' => [
                                        ['id' => 'lss2-h', 'type' => 'content.heading', 'props' => ['text' => 'On-site Work', 'level' => 3], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1.2rem', 'fontWeight' => 800]], 'children' => []],
                                        ['id' => 'lss2-p', 'type' => 'content.text', 'props' => ['text' => 'Highlight your core service, process, service radius, and guarantees.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.9rem']], 'children' => []],
                                    ]],
                                    ['id' => 'local-service-service-3', 'type' => 'layout.column', 'props' => [], 'styles' => ['desktop' => ['width' => '33.333%', 'backgroundColor' => '#f8fafc', 'borderRadius' => '14px', 'padding' => '1.5rem']], 'children' => [
                                        ['id' => 'lss3-h', 'type' => 'content.heading', 'props' => ['text' => 'Follow-up Care', 'level' => 3], 'styles' => ['desktop' => ['color' => '#0f172a', 'fontSize' => '1.2rem', 'fontWeight' => 800]], 'children' => []],
                                        ['id' => 'lss3-p', 'type' => 'content.text', 'props' => ['text' => 'Use this card for warranties, maintenance plans, or recurring support.'], 'styles' => ['desktop' => ['color' => '#64748b', 'fontSize' => '0.9rem']], 'children' => []],
                                    ]],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'local-service-cta-section',
                        'type' => 'layout.section',
                        'props' => [],
                        'styles' => ['desktop' => ['backgroundColor' => '#0f172a', 'padding' => '4rem 1.5rem', 'width' => '100%']],
                        'children' => [
                            [
                                'id' => 'local-service-cta-row',
                                'type' => 'layout.row',
                                'props' => [],
                                'styles' => ['desktop' => ['maxWidth' => '900px', 'margin' => '0 auto']],
                                'children' => [
                                    ['id' => 'local-service-cta-col', 'type' => 'layout.column', 'props' => [], 'styles' => ['desktop' => ['alignItems' => 'center', 'display' => 'flex', 'flexDirection' => 'column', 'gap' => '1rem']], 'children' => [
                                        ['id' => 'local-service-cta-h', 'type' => 'content.heading', 'props' => ['text' => 'Ready for a cleaner local lead flow?', 'level' => 2], 'styles' => ['desktop' => ['color' => '#ffffff', 'fontSize' => '2rem', 'fontWeight' => 900, 'textAlign' => 'center']], 'children' => []],
                                        ['id' => 'local-service-cta-p', 'type' => 'content.text', 'props' => ['text' => 'Replace this copy with your location, phone number, and strongest reason to book today.'], 'styles' => ['desktop' => ['color' => '#cbd5e1', 'fontSize' => '1rem', 'textAlign' => 'center']], 'children' => []],
                                        ['id' => 'local-service-cta-btn', 'type' => 'content.button', 'props' => ['text' => 'Start Booking', 'href' => '#quote'], 'styles' => ['desktop' => ['backgroundColor' => '#14b8a6', 'borderRadius' => '10px', 'color' => '#ffffff', 'fontWeight' => 800, 'padding' => '0.875rem 1.25rem']], 'children' => []],
                                    ]],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @param array<string, mixed> $document @return array<string, mixed> */
    private static function withResponsiveDefaults(array $document): array
    {
        if (isset($document['root']) && is_array($document['root'])) {
            $document['root'] = self::responsiveNode($document['root']);
        }

        return $document;
    }

    /** @param array<string, mixed> $node @return array<string, mixed> */
    private static function responsiveNode(array $node): array
    {
        $type = is_string($node['type'] ?? null) ? $node['type'] : '';
        $styles = is_array($node['styles'] ?? null) ? $node['styles'] : [];
        $desktop = is_array($styles['desktop'] ?? null) ? $styles['desktop'] : [];

        $tablet = [];
        $mobile = [];

        if (in_array($type, ['layout.section', 'layout.navbar'], true)) {
            $tablet['padding'] = $desktop['padding'] ?? '2.5rem 1.25rem';
            $mobile['padding'] = '1.5rem 1rem';
        }

        if ($type === 'layout.row' && (($desktop['display'] ?? null) === 'flex' || count($node['children'] ?? []) > 1)) {
            $tablet['gap'] = $desktop['gap'] ?? '1.5rem';
            $tablet['flexWrap'] = 'wrap';
            $mobile['display'] = 'flex';
            $mobile['flexDirection'] = 'column';
            $mobile['gap'] = '1.25rem';
            $mobile['alignItems'] = 'stretch';
            $mobile['justifyContent'] = 'flex-start';
            $mobile['width'] = '100%';
            $mobile['maxWidth'] = '100%';
            $mobile['margin'] = isset($desktop['margin']) ? '0 auto' : ($desktop['margin'] ?? '0');
        }

        if ($type === 'layout.column') {
            if (isset($desktop['width'])) {
                $tablet['width'] = '100%';
                $mobile['width'] = '100%';
            }

            $mobile['maxWidth'] = '100%';
            $mobile['minWidth'] = '0';
            $mobile['alignItems'] = $desktop['alignItems'] ?? 'stretch';
        }

        if ($type === 'layout.flex') {
            $mobile['flexWrap'] = 'wrap';
            $mobile['gap'] = $desktop['gap'] ?? '0.75rem';
            $mobile['justifyContent'] = $desktop['justifyContent'] ?? 'flex-start';
            $mobile['width'] = '100%';
        }

        if ($type === 'content.heading') {
            $mobile['maxWidth'] = '100%';
            $mobile['overflowWrap'] = 'anywhere';
            $mobile['wordBreak'] = 'break-word';
            $level = $node['props']['level'] ?? null;
            if ($level === 1 || ($desktop['fontSize'] ?? null) === '3.25rem' || ($desktop['fontSize'] ?? null) === '3rem') {
                $tablet['fontSize'] = '2.5rem';
                $mobile['fontSize'] = '2rem';
                $mobile['lineHeight'] = 1.15;
            } elseif ($level === 2) {
                $mobile['fontSize'] = '1.75rem';
                $mobile['lineHeight'] = 1.2;
            }
        }

        if ($type === 'content.text') {
            $mobile['maxWidth'] = '100%';
            $mobile['overflowWrap'] = 'anywhere';
            $mobile['wordBreak'] = 'break-word';

            if (($desktop['fontSize'] ?? null) === '1.125rem') {
                $mobile['fontSize'] = '1rem';
            }
        }

        if (in_array($type, ['content.button', 'content.link'], true)) {
            $mobile['maxWidth'] = '100%';
            $mobile['overflowWrap'] = 'anywhere';
            $mobile['wordBreak'] = 'break-word';
        }

        if ($tablet !== []) {
            $styles['tablet'] = array_merge(is_array($styles['tablet'] ?? null) ? $styles['tablet'] : [], $tablet);
        }

        if ($mobile !== []) {
            $styles['mobile'] = array_merge(is_array($styles['mobile'] ?? null) ? $styles['mobile'] : [], $mobile);
        }

        $node['styles'] = $styles;

        if (isset($node['children']) && is_array($node['children'])) {
            $node['children'] = array_map(
                static fn (array $child): array => self::responsiveNode($child),
                $node['children'],
            );
        }

        return $node;
    }
}
