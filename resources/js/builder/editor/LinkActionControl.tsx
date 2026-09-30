import { ExternalLink, FileText, Hash, Mail, Phone, MessageSquare } from 'lucide-react';
import React, { useMemo } from 'react';
import type { BuilderComponentNode, BuilderPageDocument } from '../document';

export interface AvailablePage {
    id: number;
    title: string;
    slug: string;
    status: string;
    url: string;
}

export type LinkActionType = 'url' | 'page' | 'scroll' | 'email' | 'phone' | 'sms';

export interface LinkActionValue {
    href?: string;
    target?: '_self' | '_blank';
    linkType?: LinkActionType;
    scrollTarget?: string;
}

interface LinkActionControlProps {
    label?: string;
    href?: string;
    target?: '_self' | '_blank';
    linkType?: string;
    scrollTarget?: string;
    availablePages?: AvailablePage[];
    document?: BuilderPageDocument;
    onChange: (patch: {
        href: string;
        target?: '_self' | '_blank';
        linkType?: LinkActionType;
        scrollTarget?: string;
    }) => void;
    compact?: boolean;
}

export function extractScrollTargets(document?: BuilderPageDocument): Array<{ id: string; label: string }> {
    if (!document?.root) return [];
    const targets: Array<{ id: string; label: string }> = [];

    const traverse = (node: BuilderComponentNode) => {
        if (node.id === 'root' || node.type === 'layout.root') {
            if (Array.isArray(node.children)) {
                node.children.forEach(traverse);
            }
            return;
        }

        const customId = typeof node.metadata?.customId === 'string' ? node.metadata.customId : '';
        const nodePropId = typeof node.props?.id === 'string' ? node.props.id : '';
        const elementId = customId || nodePropId || node.id;
        
        let label = `${node.type} (#${elementId})`;
        if (node.type === 'layout.section') {
            label = `Section: ${customId || node.id}`;
        } else if (node.type === 'content.heading') {
            const headingText = typeof node.props?.text === 'string' ? node.props.text.slice(0, 20) : '';
            label = headingText ? `Heading: "${headingText}" (#${elementId})` : `Heading (#${elementId})`;
        } else if (node.type === 'layout.navbar') {
            label = `Header / Navbar (#${elementId})`;
        }

        targets.push({ id: elementId, label });

        if (Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    };

    traverse(document.root);
    return targets;
}

export function detectLinkType(href: string, explicitType?: string): LinkActionType {
    if (explicitType && ['url', 'page', 'scroll', 'email', 'phone', 'sms'].includes(explicitType)) {
        return explicitType as LinkActionType;
    }
    if (!href || href === '#') return 'url';
    if (href.startsWith('mailto:')) return 'email';
    if (href.startsWith('tel:')) return 'phone';
    if (href.startsWith('sms:')) return 'sms';
    if (href.startsWith('#')) return 'scroll';
    if (href.startsWith('/') && !href.startsWith('//')) return 'page';
    return 'url';
}

export function LinkActionControl({
    label = 'Link Destination',
    href = '',
    target = '_self',
    linkType: explicitLinkType,
    scrollTarget: explicitScrollTarget,
    availablePages = [],
    document,
    onChange,
    compact = false,
}: LinkActionControlProps) {
    const currentType = detectLinkType(href, explicitLinkType);
    const scrollTargets = useMemo(() => extractScrollTargets(document), [document]);

    const handleTypeChange = (newType: LinkActionType) => {
        if (newType === currentType) return;

        if (newType === 'url') {
            onChange({
                linkType: 'url',
                href: href.startsWith('http') || href.startsWith('//') ? href : 'https://',
                target,
                scrollTarget: '',
            });
        } else if (newType === 'page') {
            const firstPage = availablePages[0];
            const newHref = firstPage ? firstPage.url : '/';
            onChange({
                linkType: 'page',
                href: newHref,
                target,
                scrollTarget: '',
            });
        } else if (newType === 'scroll') {
            const firstTarget = scrollTargets[0]?.id || '';
            onChange({
                linkType: 'scroll',
                href: firstTarget ? `#${firstTarget}` : '#',
                target: '_self',
                scrollTarget: firstTarget,
            });
        } else if (newType === 'email') {
            const emailPart = href.startsWith('mailto:') ? href.replace('mailto:', '') : '';
            onChange({
                linkType: 'email',
                href: `mailto:${emailPart}`,
                target: '_self',
                scrollTarget: '',
            });
        } else if (newType === 'phone') {
            const phonePart = href.startsWith('tel:') ? href.replace('tel:', '') : '';
            onChange({
                linkType: 'phone',
                href: `tel:${phonePart}`,
                target: '_self',
                scrollTarget: '',
            });
        } else if (newType === 'sms') {
            const smsPart = href.startsWith('sms:') ? href.replace('sms:', '') : '';
            onChange({
                linkType: 'sms',
                href: `sms:${smsPart}`,
                target: '_self',
                scrollTarget: '',
            });
        }
    };

    return (
        <div className="space-y-2">
            {!compact && (
                <div className="flex items-center justify-between">
                    <label className="text-foreground text-xs font-semibold">{label}</label>
                </div>
            )}

            {/* Type selector */}
            <div className="grid grid-cols-1 gap-1.5">
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">Link To:</span>
                    <select
                        value={currentType}
                        onChange={(e) => handleTypeChange(e.target.value as LinkActionType)}
                        className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                    >
                        <option value="url">Website URL</option>
                        <option value="page">Internal Page</option>
                        <option value="scroll">Scroll to Element</option>
                        <option value="email">Email Address</option>
                        <option value="phone">Call / Phone</option>
                        <option value="sms">SMS Text</option>
                    </select>
                </div>

                {/* Sub-inputs based on link type */}
                {currentType === 'url' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">URL:</span>
                        <input
                            type="text"
                            value={href}
                            onChange={(e) =>
                                onChange({
                                    linkType: 'url',
                                    href: e.target.value,
                                    target,
                                })
                            }
                            placeholder="https://example.com"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                        />
                    </div>
                )}

                {currentType === 'page' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">Page:</span>
                        {availablePages.length > 0 ? (
                            <select
                                value={href}
                                onChange={(e) =>
                                    onChange({
                                        linkType: 'page',
                                        href: e.target.value,
                                        target,
                                    })
                                }
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                            >
                                {availablePages.map((page) => (
                                    <option key={page.id} value={page.url}>
                                        {page.title} ({page.url})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={href}
                                onChange={(e) =>
                                    onChange({
                                        linkType: 'page',
                                        href: e.target.value,
                                        target,
                                    })
                                }
                                placeholder="/about-us"
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                            />
                        )}
                    </div>
                )}

                {currentType === 'scroll' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">Section:</span>
                        {scrollTargets.length > 0 ? (
                            <select
                                value={explicitScrollTarget || (href.startsWith('#') ? href.slice(1) : '')}
                                onChange={(e) => {
                                    const targetId = e.target.value;
                                    onChange({
                                        linkType: 'scroll',
                                        scrollTarget: targetId,
                                        href: `#${targetId}`,
                                        target: '_self',
                                    });
                                }}
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                            >
                                <option value="">Select Section / Element...</option>
                                {scrollTargets.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={href.startsWith('#') ? href.slice(1) : href}
                                onChange={(e) => {
                                    const clean = e.target.value.replace(/^#/, '');
                                    onChange({
                                        linkType: 'scroll',
                                        scrollTarget: clean,
                                        href: `#${clean}`,
                                        target: '_self',
                                    });
                                }}
                                placeholder="section-id"
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                            />
                        )}
                    </div>
                )}

                {currentType === 'email' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">Email:</span>
                        <input
                            type="email"
                            value={href.startsWith('mailto:') ? href.slice(7) : href}
                            onChange={(e) =>
                                onChange({
                                    linkType: 'email',
                                    href: `mailto:${e.target.value.trim()}`,
                                    target: '_self',
                                })
                            }
                            placeholder="name@example.com"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                        />
                    </div>
                )}

                {currentType === 'phone' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">Phone:</span>
                        <input
                            type="tel"
                            value={href.startsWith('tel:') ? href.slice(4) : href}
                            onChange={(e) =>
                                onChange({
                                    linkType: 'phone',
                                    href: `tel:${e.target.value.trim()}`,
                                    target: '_self',
                                })
                            }
                            placeholder="+1 (555) 000-0000"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                        />
                    </div>
                )}

                {currentType === 'sms' && (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">SMS:</span>
                        <input
                            type="tel"
                            value={href.startsWith('sms:') ? href.slice(4) : href}
                            onChange={(e) =>
                                onChange({
                                    linkType: 'sms',
                                    href: `sms:${e.target.value.trim()}`,
                                    target: '_self',
                                })
                            }
                            placeholder="+1 (555) 000-0000"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none focus:ring-1"
                        />
                    </div>
                )}
            </div>

            {/* Open in new tab toggle */}
            {(currentType === 'url' || currentType === 'page') && (
                <div className="flex items-center justify-between pt-1">
                    <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={target === '_blank'}
                            onChange={(e) =>
                                onChange({
                                    href,
                                    target: e.target.checked ? '_blank' : '_self',
                                    linkType: currentType,
                                    scrollTarget: explicitScrollTarget,
                                })
                            }
                            className="accent-primary size-3.5 rounded"
                        />
                        <span>Open in new tab</span>
                    </label>
                    <ExternalLink className="size-3 text-muted-foreground/60" />
                </div>
            )}
        </div>
    );
}
