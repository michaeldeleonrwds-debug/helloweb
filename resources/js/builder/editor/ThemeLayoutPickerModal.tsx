import { ArrowUpRight, Check, Layout, LayoutTemplate, PanelBottom, PanelsTopLeft, Sparkles, X } from 'lucide-react';
import React, { useId } from 'react';
import type { BuilderPageDocument } from '../document';

export interface ThemeTemplateOption {
    id: number;
    name: string;
    slug: string;
    type: string;
    description?: string | null;
    is_platform?: boolean;
    document?: BuilderPageDocument | null;
}

interface ThemeLayoutPickerModalProps {
    open: boolean;
    onClose: () => void;
    activeTab: 'header' | 'footer' | 'blueprints';
    onTabChange: (tab: 'header' | 'footer' | 'blueprints') => void;
    headerTemplates: ThemeTemplateOption[];
    footerTemplates: ThemeTemplateOption[];
    pageTemplates: ThemeTemplateOption[];
    selectedHeaderId: number | null;
    selectedFooterId: number | null;
    onSelectHeader: (templateId: number | null) => void;
    onSelectFooter: (templateId: number | null) => void;
    onSelectBlueprint?: (template: ThemeTemplateOption) => void;
    isUpdating?: boolean;
}

export function ThemeLayoutPickerModal({
    open,
    onClose,
    activeTab,
    onTabChange,
    headerTemplates,
    footerTemplates,
    pageTemplates,
    selectedHeaderId,
    selectedFooterId,
    onSelectHeader,
    onSelectFooter,
    onSelectBlueprint,
    isUpdating = false,
}: ThemeLayoutPickerModalProps) {
    const titleId = useId();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h2 id={titleId} className="text-base font-bold tracking-tight text-foreground">
                                Theme Layout & Design Switcher
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Select active site-wide header, footer, or instantiate a page blueprint.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        aria-label="Close modal"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border/80 bg-muted/30 px-6">
                    <button
                        type="button"
                        onClick={() => onTabChange('header')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                            activeTab === 'header'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <PanelsTopLeft className="size-4" />
                        <span>Header Designs ({headerTemplates.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onTabChange('footer')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                            activeTab === 'footer'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <PanelBottom className="size-4" />
                        <span>Footer Designs ({footerTemplates.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onTabChange('blueprints')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                            activeTab === 'blueprints'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <LayoutTemplate className="size-4" />
                        <span>Page Blueprints ({pageTemplates.length})</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    {/* HEADERS TAB */}
                    {activeTab === 'header' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Choose a global header for your website:</span>
                                {isUpdating && <span className="text-primary font-semibold animate-pulse">Applying header...</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Option: None (Disable Header) */}
                                <div
                                    onClick={() => onSelectHeader(null)}
                                    className={`cursor-pointer rounded-xl border p-4 transition hover:border-primary/50 ${
                                        selectedHeaderId === null
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border/80 bg-card hover:bg-muted/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">No Global Header</span>
                                            {selectedHeaderId === null && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                    <Check className="size-3" /> Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-16 rounded-lg border border-dashed border-border/80 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
                                        Header disabled (blank top)
                                    </div>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        Ideal for squeeze pages, standalone landing pages, or pages with custom hero headers.
                                    </p>
                                </div>

                                {headerTemplates.map((template) => {
                                    const isSelected = selectedHeaderId === template.id;
                                    return (
                                        <div
                                            key={template.id}
                                            onClick={() => onSelectHeader(template.id)}
                                            className={`cursor-pointer rounded-xl border p-4 transition hover:border-primary/50 ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-border/80 bg-card hover:bg-muted/30'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground">{template.name}</span>
                                                    {template.is_platform && (
                                                        <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Platform
                                                        </span>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        <Check className="size-3" /> Active
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wireframe Mockup */}
                                            <HeaderWireframe slug={template.slug} />

                                            <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                                                {template.description || 'Responsive header design.'}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                                                <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {isSelected ? 'Currently Selected' : 'Click to Select'}
                                                </span>
                                                <a
                                                    href={route('builder.templates.show', template.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                                                >
                                                    <span>Customize</span>
                                                    <ArrowUpRight className="size-3" />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* FOOTERS TAB */}
                    {activeTab === 'footer' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Choose a global footer for your website:</span>
                                {isUpdating && <span className="text-primary font-semibold animate-pulse">Applying footer...</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Option: None (Disable Footer) */}
                                <div
                                    onClick={() => onSelectFooter(null)}
                                    className={`cursor-pointer rounded-xl border p-4 transition hover:border-primary/50 ${
                                        selectedFooterId === null
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border/80 bg-card hover:bg-muted/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">No Global Footer</span>
                                            {selectedFooterId === null && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                    <Check className="size-3" /> Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-16 rounded-lg border border-dashed border-border/80 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
                                        Footer disabled (blank bottom)
                                    </div>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        Useful for app screens, dashboards, or minimalist presentations.
                                    </p>
                                </div>

                                {footerTemplates.map((template) => {
                                    const isSelected = selectedFooterId === template.id;
                                    return (
                                        <div
                                            key={template.id}
                                            onClick={() => onSelectFooter(template.id)}
                                            className={`cursor-pointer rounded-xl border p-4 transition hover:border-primary/50 ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-border/80 bg-card hover:bg-muted/30'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-foreground">{template.name}</span>
                                                    {template.is_platform && (
                                                        <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Platform
                                                        </span>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        <Check className="size-3" /> Active
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wireframe Mockup */}
                                            <FooterWireframe slug={template.slug} />

                                            <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                                                {template.description || 'Responsive footer design.'}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                                                <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {isSelected ? 'Currently Selected' : 'Click to Select'}
                                                </span>
                                                <a
                                                    href={route('builder.templates.show', template.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                                                >
                                                    <span>Customize</span>
                                                    <ArrowUpRight className="size-3" />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* BLUEPRINTS TAB */}
                    {activeTab === 'blueprints' && (
                        <div className="space-y-4">
                            <div className="text-xs text-muted-foreground">
                                Page blueprints provide fully structured responsive layouts ready to populate:
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pageTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/50 hover:bg-muted/30 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-foreground">{template.name}</span>
                                                {template.is_platform && (
                                                    <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        Platform
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wireframe Mockup */}
                                            <BlueprintWireframe slug={template.slug} />

                                            <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                                                {template.description || 'Page blueprint structure.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                                            {onSelectBlueprint && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectBlueprint(template)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-semibold shadow-xs transition"
                                                >
                                                    <Layout className="size-3.5" />
                                                    <span>Apply to Page</span>
                                                </button>
                                            )}

                                            <a
                                                href={route('builder.templates.show', template.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition ml-auto"
                                            >
                                                <span>View Blueprint</span>
                                                <ArrowUpRight className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 border-t border-border/80 bg-muted/30 px-6 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-card hover:bg-muted px-4 py-2 text-xs font-semibold text-foreground transition"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// Visual Wireframes
function HeaderWireframe({ slug }: { slug: string }) {
    if (slug === 'dark-modern-glow-header') {
        return (
            <div className="h-16 rounded-lg bg-[#080b11] border border-cyan-500/30 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <span className="text-[10px] font-bold text-white tracking-wide">HelloWeb</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-6 rounded-full bg-slate-700" />
                    <div className="h-1.5 w-6 rounded-full bg-slate-700" />
                    <div className="h-1.5 w-6 rounded-full bg-slate-700" />
                </div>
                <div className="h-5 px-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center text-[9px] font-semibold text-cyan-300">
                    Launch
                </div>
            </div>
        );
    }

    if (slug === 'floating-pill-header') {
        return (
            <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-900 p-2 flex items-center justify-center">
                <div className="h-9 w-11/12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded-full bg-blue-600" />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200">HelloWeb</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-1.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <div className="h-1.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    </div>
                    <div className="h-4 px-1.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center">
                        Start
                    </div>
                </div>
            </div>
        );
    }

    if (slug === 'centered-minimal-header') {
        return (
            <div className="h-16 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 flex flex-col items-center justify-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider text-slate-900 dark:text-white uppercase">STUDIO</span>
                <div className="flex items-center gap-2.5">
                    <span className="text-[8px] text-slate-500">Works</span>
                    <span className="text-[8px] text-slate-500">Studio</span>
                    <span className="text-[8px] text-slate-500">Journal</span>
                    <span className="text-[8px] text-slate-500">Contact</span>
                </div>
            </div>
        );
    }

    if (slug === 'split-cta-header') {
        return (
            <div className="h-16 overflow-hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="h-4 bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                    <div className="h-1.5 w-36 rounded-full bg-sky-500/70" />
                </div>
                <div className="flex h-12 items-center justify-between px-3">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">HelloWeb</span>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="h-1.5 w-5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="h-1.5 w-5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                    <div className="h-5 rounded-full bg-slate-900 px-2 text-[8px] font-bold text-white flex items-center">Demo</div>
                </div>
            </div>
        );
    }

    // Default Main Navigation Header
    return (
        <div className="h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-md bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-900 dark:text-white">HelloWeb</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-1.5 w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-1.5 w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-5 px-2 rounded-md bg-emerald-600 text-white text-[9px] font-semibold flex items-center">
                Get Started
            </div>
        </div>
    );
}

function FooterWireframe({ slug }: { slug: string }) {
    if (slug === 'saas-newsletter-footer') {
        return (
            <div className="h-20 rounded-lg bg-[#0b1120] border border-blue-900/40 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-[9px] font-bold text-white">Subscribe to platform updates</span>
                    <div className="h-4 px-2 rounded bg-blue-600 text-[8px] text-white font-semibold flex items-center">
                        Join
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[7px] text-slate-400">
                    <div>Product</div>
                    <div>Platform</div>
                    <div>Resources</div>
                    <div>Legal</div>
                </div>
                <div className="text-[7px] text-slate-600">© HelloWeb</div>
            </div>
        );
    }

    if (slug === 'dark-mega-footer') {
        return (
            <div className="h-20 rounded-lg bg-[#07090e] border border-slate-800 p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-white">HelloWeb Enterprise</span>
                        <div className="size-1.5 rounded-full bg-emerald-400" />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[7px] text-slate-400">
                    <div>Solutions</div>
                    <div>Ecosystem</div>
                    <div>Security</div>
                    <div>Status</div>
                </div>
                <div className="text-[7px] text-slate-500 border-t border-slate-900 pt-1">
                    © Enterprise-grade builder
                </div>
            </div>
        );
    }

    if (slug === 'centered-brand-footer') {
        return (
            <div className="h-20 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-[10px] font-black text-slate-900 dark:text-white">HelloWeb</span>
                <span className="text-[7px] text-slate-500">Empowering founders to build without limits</span>
                <div className="flex items-center gap-2 text-[7px] text-slate-600 dark:text-slate-400">
                    <span>Features</span>
                    <span>Templates</span>
                    <span>Contact</span>
                </div>
                <span className="text-[6px] text-slate-400">© HelloWeb Inc.</span>
            </div>
        );
    }

    if (slug === 'minimal-footer') {
        return (
            <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
                <span className="text-[8px] text-slate-600 dark:text-slate-400">© 2026 All rights reserved</span>
                <div className="flex items-center gap-2 text-[8px] text-slate-600 dark:text-slate-400">
                    <span>Privacy</span>
                    <span>Terms</span>
                </div>
            </div>
        );
    }

    if (slug === 'editorial-footer') {
        return (
            <div className="h-20 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 flex flex-col justify-between">
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                        <div className="h-2 w-14 rounded-full bg-slate-900 dark:bg-white" />
                        <div className="h-1.5 w-16 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="h-1.5 w-12 rounded-full bg-teal-500/70" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-1.5 w-10 rounded-full bg-slate-400" />
                        <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="h-1.5 w-11 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                    <div className="rounded bg-white dark:bg-slate-800 p-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-slate-400" />
                        <div className="mt-2 h-3 w-14 rounded bg-slate-900 dark:bg-slate-700" />
                    </div>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <div className="h-1.5 w-28 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />
            </div>
        );
    }

    // Default Multi-Column Footer
    return (
        <div className="h-20 rounded-lg bg-[#0f172a] border border-slate-800 p-2.5 flex flex-col justify-between">
            <div className="grid grid-cols-4 gap-1 text-[8px]">
                <div className="text-white font-bold">HelloWeb</div>
                <div className="text-slate-400">Product</div>
                <div className="text-slate-400">Company</div>
                <div className="text-slate-400">Legal</div>
            </div>
            <div className="border-t border-slate-800 pt-1 text-[7px] text-slate-500 text-center">
                © HelloWeb Modern Framework Architecture
            </div>
        </div>
    );
}

function BlueprintWireframe({ slug }: { slug: string }) {
    if (slug === 'agency-portfolio-blueprint') {
        return (
            <div className="h-24 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex flex-col justify-between">
                <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="h-1.5 w-12 rounded-full bg-blue-500" />
                    <div className="h-2 w-28 rounded-full bg-slate-900 dark:bg-white" />
                    <div className="h-1.5 w-20 rounded-full bg-slate-400" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (slug === 'saas-product-blueprint') {
        return (
            <div className="h-24 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex flex-col justify-between">
                <div className="flex flex-col items-center gap-1">
                    <div className="h-1.5 w-14 rounded-full bg-emerald-500" />
                    <div className="h-2 w-32 rounded-full bg-slate-900 dark:bg-white" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div className="h-5 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-5 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-5 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 rounded bg-emerald-600/30" />
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (slug === 'blank-canvas-blueprint') {
        return (
            <div className="h-24 rounded-lg bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-2 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-medium">Blank Canvas Container</span>
            </div>
        );
    }

    if (slug === 'local-service-blueprint') {
        return (
            <div className="h-24 rounded-lg bg-teal-50 dark:bg-slate-900 border border-teal-100 dark:border-slate-800 p-2 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-16 rounded-full bg-teal-500" />
                        <div className="h-2 w-24 rounded-full bg-slate-900 dark:bg-white" />
                        <div className="h-1.5 w-20 rounded-full bg-slate-400" />
                        <div className="h-4 w-14 rounded bg-teal-600" />
                    </div>
                    <div className="rounded bg-white dark:bg-slate-800 p-2 shadow-xs">
                        <div className="h-2 w-16 rounded-full bg-slate-800 dark:bg-slate-200" />
                        <div className="mt-2 h-1.5 w-20 rounded-full bg-slate-300 dark:bg-slate-700" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <div className="h-5 rounded bg-white dark:bg-slate-800" />
                    <div className="h-5 rounded bg-white dark:bg-slate-800" />
                    <div className="h-5 rounded bg-white dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    // Default Landing Page
    return (
        <div className="h-24 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex flex-col justify-between">
            <div className="flex flex-col items-center gap-1">
                <div className="h-2 w-28 rounded-full bg-slate-900 dark:bg-white" />
                <div className="h-1.5 w-20 rounded-full bg-slate-400" />
                <div className="h-3 w-10 rounded-full bg-emerald-500" />
            </div>
            <div className="grid grid-cols-3 gap-1">
                <div className="h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                <div className="h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                <div className="h-5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            </div>
        </div>
    );
}
