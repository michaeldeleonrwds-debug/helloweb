import { Columns, Grid, LayoutGrid, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';

import type { BuilderComponentNode, ComponentType } from '../document';

export type LayoutTemplateType = 'columns' | 'grid';

export interface LayoutTemplateItem {
    id: string;
    title: string;
    description: string;
    type: LayoutTemplateType;
    icon: React.ReactNode;
    preview: React.ReactNode;
    buildNode: (generateId: (type: string) => string) => BuilderComponentNode;
}

export const COLUMNS_TEMPLATES: LayoutTemplateItem[] = [
    {
        id: '2-col-equal',
        title: '2 Columns (50% / 50%)',
        description: 'Equal two-column layout for side-by-side content or media.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">1/2</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">1/2</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '50%'),
                createColumnNode(gen, '50%'),
            ],
        }),
    },
    {
        id: '2-col-left-heavy',
        title: '2 Columns (66% / 33%)',
        description: 'Left-heavy split ideal for main content and a sidebar.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="w-2/3 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">2/3</div>
                <div className="w-1/3 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary/70">1/3</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '66.66%'),
                createColumnNode(gen, '33.33%'),
            ],
        }),
    },
    {
        id: '2-col-right-heavy',
        title: '2 Columns (33% / 66%)',
        description: 'Right-heavy split ideal for left navigation or summary with main right panel.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="w-1/3 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary/70">1/3</div>
                <div className="w-2/3 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">2/3</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '33.33%'),
                createColumnNode(gen, '66.66%'),
            ],
        }),
    },
    {
        id: '3-col-equal',
        title: '3 Columns (33% / 33% / 33%)',
        description: 'Standard three-column layout for features, services, or pricing tiers.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">1/3</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">1/3</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">1/3</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '33.33%'),
                createColumnNode(gen, '33.33%'),
                createColumnNode(gen, '33.33%'),
            ],
        }),
    },
    {
        id: '3-col-center-focus',
        title: '3 Columns (25% / 50% / 25%)',
        description: 'Center-focused layout for prominent main content with dual flanking sidebars.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="w-1/4 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary/70">1/4</div>
                <div className="w-1/2 rounded bg-primary/25 border border-primary/35 flex items-center justify-center text-[10px] font-semibold text-primary">1/2 Focus</div>
                <div className="w-1/4 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary/70">1/4</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '25%'),
                createColumnNode(gen, '50%'),
                createColumnNode(gen, '25%'),
            ],
        }),
    },
    {
        id: '4-col-equal',
        title: '4 Columns (25% x 4)',
        description: 'Four equal columns for metrics, logos, team profiles, or micro-cards.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">25%</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">25%</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">25%</div>
                <div className="flex-1 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-semibold text-primary">25%</div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '20px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '25%'),
                createColumnNode(gen, '25%'),
                createColumnNode(gen, '25%'),
                createColumnNode(gen, '25%'),
            ],
        }),
    },
    {
        id: '5-col-equal',
        title: '5 Columns (20% x 5)',
        description: 'Five equal columns ideal for logo clouds, partner banners, or feature tags.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1 rounded-md bg-muted/60 p-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 rounded bg-primary/15 border border-primary/25 flex items-center justify-center text-[9px] font-semibold text-primary">20%</div>
                ))}
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '16px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '20%'),
                createColumnNode(gen, '20%'),
                createColumnNode(gen, '20%'),
                createColumnNode(gen, '20%'),
                createColumnNode(gen, '20%'),
            ],
        }),
    },
    {
        id: '6-col-equal',
        title: '6 Columns (16.6% x 6)',
        description: 'Six micro columns ideal for stats, icons, partner grids, or calendar strips.',
        type: 'columns',
        icon: <Columns className="size-4" />,
        preview: (
            <div className="flex h-12 w-full gap-1 rounded-md bg-muted/60 p-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-1 rounded bg-primary/15 border border-primary/25 flex items-center justify-center text-[8px] font-semibold text-primary">1/6</div>
                ))}
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '12px', flexWrap: 'nowrap' } },
            children: [
                createColumnNode(gen, '16.66%'),
                createColumnNode(gen, '16.66%'),
                createColumnNode(gen, '16.66%'),
                createColumnNode(gen, '16.66%'),
                createColumnNode(gen, '16.66%'),
                createColumnNode(gen, '16.66%'),
            ],
        }),
    },
];

export const GRID_TEMPLATES: LayoutTemplateItem[] = [
    {
        id: 'grid-2x2',
        title: '2x2 Equal Grid (4 Cards)',
        description: 'Balanced 2-column by 2-row grid of feature cards.',
        type: 'grid',
        icon: <LayoutGrid className="size-4" />,
        preview: (
            <div className="grid grid-cols-2 grid-rows-2 h-16 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: {
                desktop: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    width: '100%',
                    maxWidth: '1140px',
                    margin: '0 auto',
                    gap: '24px',
                },
            },
            children: [
                createCardNode(gen, 'Feature 01', 'High-impact design tools built for modern teams.'),
                createCardNode(gen, 'Feature 02', 'Responsive by default across all devices and screen sizes.'),
                createCardNode(gen, 'Feature 03', 'Optimized performance with zero unnecessary boilerplate.'),
                createCardNode(gen, 'Feature 04', 'Continuous autosave and instant revision restoration.'),
            ],
        }),
    },
    {
        id: 'grid-3-col',
        title: '3-Column Card Grid (3 Cards)',
        description: 'Three feature cards in a clean responsive row.',
        type: 'grid',
        icon: <LayoutGrid className="size-4" />,
        preview: (
            <div className="grid grid-cols-3 h-14 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: {
                desktop: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    width: '100%',
                    maxWidth: '1140px',
                    margin: '0 auto',
                    gap: '24px',
                },
            },
            children: [
                createCardNode(gen, 'Speed', 'Lightning-fast load times with optimized rendering.'),
                createCardNode(gen, 'Security', 'Enterprise-grade protection and role-based policies.'),
                createCardNode(gen, 'Scale', 'Built to handle millions of visitors without breaking.'),
            ],
        }),
    },
    {
        id: 'grid-4-col',
        title: '4-Column Metric Grid (4 Cards)',
        description: 'Four cards in a row for metrics, stats, or services.',
        type: 'grid',
        icon: <LayoutGrid className="size-4" />,
        preview: (
            <div className="grid grid-cols-4 h-14 w-full gap-1 rounded-md bg-muted/60 p-1.5">
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
                <div className="rounded bg-primary/20 border border-primary/30" />
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: {
                desktop: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    width: '100%',
                    maxWidth: '1140px',
                    margin: '0 auto',
                    gap: '20px',
                },
            },
            children: [
                createCardNode(gen, '99.9%', 'Uptime guaranteed across global edge regions.'),
                createCardNode(gen, '10x', 'Faster build times with direct visual editing.'),
                createCardNode(gen, '24/7', 'Dedicated engineering and support coverage.'),
                createCardNode(gen, '0ms', 'Instant preview updates with zero compilation lag.'),
            ],
        }),
    },
    {
        id: 'grid-bento-hero',
        title: 'Bento Grid: 1 Large Hero + 2 Stacked',
        description: 'Modern bento-style design with 1 prominent left card and 2 stacked right cards.',
        type: 'grid',
        icon: <Grid className="size-4" />,
        preview: (
            <div className="flex h-16 w-full gap-1.5 rounded-md bg-muted/60 p-1.5">
                <div className="w-3/5 rounded bg-primary/25 border border-primary/35 flex items-center justify-center text-[10px] font-bold text-primary">Hero</div>
                <div className="w-2/5 flex flex-col gap-1">
                    <div className="flex-1 rounded bg-primary/15 border border-primary/25" />
                    <div className="flex-1 rounded bg-primary/15 border border-primary/25" />
                </div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px', flexWrap: 'nowrap' } },
            children: [
                {
                    id: gen('layout.column'),
                    type: 'layout.column',
                    props: {},
                    styles: { desktop: { width: '60%', display: 'flex', flexDirection: 'column' } },
                    children: [
                        createCardNode(gen, 'Next-Generation Engine', 'Engineered from first principles with full reactivity, deterministic state transitions, and responsive styling built right into the document model.', '320px'),
                    ],
                },
                {
                    id: gen('layout.column'),
                    type: 'layout.column',
                    props: {},
                    styles: { desktop: { width: '40%', display: 'flex', flexDirection: 'column', gap: '20px' } },
                    children: [
                        createCardNode(gen, 'Clean Code Output', 'Zero clutter. Generates semantic HTML and clean Tailwind classes.'),
                        createCardNode(gen, 'Direct Publishing', 'Push updates live in a single click with instant rollback safety.'),
                    ],
                },
            ],
        }),
    },
    {
        id: 'grid-bento-top-wide',
        title: 'Bento Grid: Wide Top Banner + 3 Bottom Cards',
        description: 'Wide statement banner on top followed by a 3-column feature row below.',
        type: 'grid',
        icon: <Grid className="size-4" />,
        preview: (
            <div className="flex flex-col h-16 w-full gap-1 rounded-md bg-muted/60 p-1.5">
                <div className="h-6 w-full rounded bg-primary/25 border border-primary/35 flex items-center justify-center text-[9px] font-bold text-primary">Wide Banner</div>
                <div className="flex flex-1 gap-1">
                    <div className="flex-1 rounded bg-primary/15 border border-primary/25" />
                    <div className="flex-1 rounded bg-primary/15 border border-primary/25" />
                    <div className="flex-1 rounded bg-primary/15 border border-primary/25" />
                </div>
            </div>
        ),
        buildNode: (gen) => ({
            id: gen('layout.row'),
            type: 'layout.row',
            props: {},
            styles: { desktop: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1140px', margin: '0 auto', gap: '24px' } },
            children: [
                createCardNode(gen, 'Transform your workflow with intelligent visual building', 'Combine the speed of visual authoring with the reliability of typed schemas and durable revision control.', '140px'),
                {
                    id: gen('layout.row'),
                    type: 'layout.row',
                    props: {},
                    styles: { desktop: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', width: '100%', gap: '20px' } },
                    children: [
                        createCardNode(gen, 'Visual Canvas', 'Direct manipulation with drag, drop, and live resize.'),
                        createCardNode(gen, 'Design Inspector', 'Precision typography, box-model, and effect controls.'),
                        createCardNode(gen, 'One-Click Publish', 'Push revisions to your custom domain seamlessly.'),
                    ],
                },
            ],
        }),
    },
];

function createColumnNode(gen: (type: string) => string, width: string): BuilderComponentNode {
    const colId = gen('layout.column');
    return {
        id: colId,
        type: 'layout.column',
        props: {},
        styles: {
            desktop: {
                width,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px',
                minHeight: '120px',
                backgroundColor: 'transparent',
                borderWidth: '1px',
                borderStyle: 'dashed',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
            },
        },
        children: [],
    };
}

function createCardNode(gen: (type: string) => string, title: string, text: string, minHeight = 'auto'): BuilderComponentNode {
    const cardId = gen('marketing.card');
    return {
        id: cardId,
        type: 'marketing.card',
        props: {},
        styles: {
            desktop: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                minHeight,
                backgroundColor: '#ffffff',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            },
        },
        children: [
            {
                id: gen('content.heading'),
                type: 'content.heading',
                props: { text: title, level: 3 },
                styles: { desktop: { fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 } },
                children: [],
            },
            {
                id: gen('content.text'),
                type: 'content.text',
                props: { text },
                styles: { desktop: { fontSize: '0.925rem', color: '#64748b', lineHeight: 1.6 } },
                children: [],
            },
        ],
    };
}

interface LayoutTemplatesModalProps {
    open: boolean;
    initialType?: LayoutTemplateType;
    onClose: () => void;
    onSelectTemplate: (template: LayoutTemplateItem) => void;
}

export function LayoutTemplatesModal({
    open,
    initialType = 'columns',
    onClose,
    onSelectTemplate,
}: LayoutTemplatesModalProps) {
    const [activeTab, setActiveTab] = useState<LayoutTemplateType>(initialType);

    if (!open) return null;

    const templates = activeTab === 'columns' ? COLUMNS_TEMPLATES : GRID_TEMPLATES;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="size-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Choose a Layout Template</h2>
                            <p className="text-[11px] text-muted-foreground">Select a pre-structured columns or grid template to insert into your page.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex shrink-0 gap-1 border-b border-border bg-muted/30 px-5 pt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('columns')}
                        className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition ${
                            activeTab === 'columns'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Columns className="size-3.5" />
                        Columns ({COLUMNS_TEMPLATES.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('grid')}
                        className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition ${
                            activeTab === 'grid'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Grid className="size-3.5" />
                        Grid & Bento ({GRID_TEMPLATES.length})
                    </button>
                </div>

                {/* Template Cards Grid */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => {
                                    onSelectTemplate(template);
                                    onClose();
                                }}
                                className="group flex flex-col rounded-xl border border-border/80 bg-card p-3.5 text-left transition hover:border-primary hover:bg-primary/5 hover:shadow-md"
                            >
                                <div className="mb-3 w-full transition-transform group-hover:scale-[1.01]">
                                    {template.preview}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-primary">{template.icon}</span>
                                    <h3 className="text-xs font-semibold text-foreground group-hover:text-primary">
                                        {template.title}
                                    </h3>
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {template.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex h-12 shrink-0 items-center justify-between border-t border-border bg-muted/20 px-5 text-[11px] text-muted-foreground">
                    <span>Templates are automatically mobile-responsive.</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-card px-3 py-1 font-medium text-foreground transition hover:bg-muted"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LayoutTemplatesModal;
