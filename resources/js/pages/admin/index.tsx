import { Head, router, usePage } from '@inertiajs/react';
import {
    Boxes,
    Check,
    Clock,
    Code2,
    ExternalLink,
    Filter,
    Globe,
    Layers,
    Layout,
    Plus,
    Search,
    Shapes,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Trash2,
    UploadCloud,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ImportModal } from '@/components/ImportModal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

interface TemplateItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    is_platform: boolean;
    user_id: number;
    creator_name: string;
    status: string;
    updatedAt: string | null;
}

interface ComponentItem {
    id: number;
    name: string;
    description: string | null;
    is_platform: boolean;
    user_id: number;
    creator_name: string;
    status: string;
    updatedAt: string | null;
}

interface AdminIndexProps {
    templates: TemplateItem[];
    components: ComponentItem[];
    stats: {
        totalTemplates: number;
        platformTemplates: number;
        totalComponents: number;
        platformComponents: number;
        totalWebsites: number;
        totalUsers: number;
        activeHeaders: number;
        activeFooters: number;
        activePages: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Platform Admin', href: route('admin.platform.index') },
];

export default function AdminPlatformIndex({ templates, components, stats }: AdminIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState<'templates' | 'components'>('templates');
    const [templateFilter, setTemplateFilter] = useState<'all' | 'header' | 'footer' | 'page'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importType, setImportType] = useState<'component' | 'template'>('template');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const filteredTemplates = useMemo(() => {
        return templates.filter((tpl) => {
            const matchesCategory = templateFilter === 'all' || tpl.type === templateFilter;
            const matchesQuery =
                tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tpl.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                tpl.slug.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesQuery;
        });
    }, [templates, templateFilter, searchQuery]);

    const filteredComponents = useMemo(() => {
        return components.filter((comp) => {
            return (
                comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (comp.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [components, searchQuery]);

    const handleToggleTemplatePlatform = async (template: TemplateItem) => {
        setTogglingId(template.id);
        try {
            const res = await fetch(route('admin.templates.toggle-platform', template.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });
            if (res.ok) {
                router.reload({ only: ['templates', 'stats'] });
            }
        } finally {
            setTogglingId(null);
        }
    };

    const handleToggleComponentPlatform = async (component: ComponentItem) => {
        setTogglingId(component.id);
        try {
            const res = await fetch(route('admin.reusable.toggle-platform', component.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });
            if (res.ok) {
                router.reload({ only: ['components', 'stats'] });
            }
        } finally {
            setTogglingId(null);
        }
    };

    const handleArchiveTemplate = async (template: TemplateItem) => {
        if (!confirm(`Are you sure you want to archive "${template.name}"?`)) return;
        try {
            const res = await fetch(route('builder.templates.archive', template.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });
            if (res.ok) {
                router.reload({ only: ['templates', 'stats'] });
            }
        } catch {
            alert('Failed to archive template.');
        }
    };

    const handleArchiveComponent = async (component: ComponentItem) => {
        if (!confirm(`Are you sure you want to archive "${component.name}"?`)) return;
        try {
            const res = await fetch(route('builder.reusable.archive', component.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });
            if (res.ok) {
                router.reload({ only: ['components', 'stats'] });
            }
        } catch {
            alert('Failed to archive component.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Platform Administration" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-[24px] border border-border bg-card p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <ShieldCheck className="size-3.5" />
                                    <span>Platform Owner Mode</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    HelloWeb Core Engine
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                Main Admin Panel
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                                Manage the central platform catalog of theme templates, reusable blocks, and design components pulled into client websites.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button
                                type="button"
                                onClick={() => {
                                    setImportType('template');
                                    setImportModalOpen(true);
                                }}
                                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-105 active:scale-98 transition flex items-center gap-1.5"
                            >
                                <UploadCloud className="size-3.5" />
                                <span>Upload Template (ZIP)</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setImportType('component');
                                    setImportModalOpen(true);
                                }}
                                variant="outline"
                                className="rounded-full border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition flex items-center gap-1.5"
                            >
                                <UploadCloud className="size-3.5 text-muted-foreground" />
                                <span>Upload Component (ZIP)</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-[20px] border border-border bg-card p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Platform Templates
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                <Shapes className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">{stats.platformTemplates}</span>
                            <span className="text-xs text-muted-foreground">of {stats.totalTemplates} total</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {stats.activeHeaders} Headers · {stats.activeFooters} Footers · {stats.activePages} Blueprints
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-border bg-card p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Reusable Blocks
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                <Sparkles className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">{stats.platformComponents}</span>
                            <span className="text-xs text-muted-foreground">of {stats.totalComponents} total</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Synchronized to all builder libraries
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-border bg-card p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Client Websites
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                <Globe className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">{stats.totalWebsites}</span>
                            <span className="text-xs text-muted-foreground">active sites</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Pulling platform theme parts
                        </p>
                    </div>

                    <div className="rounded-[20px] border border-border bg-card p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Platform Users
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                                <Users className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground">{stats.totalUsers}</span>
                            <span className="text-xs text-muted-foreground">registered</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Using superadmin catalog
                        </p>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('templates')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                                activeTab === 'templates'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Shapes className="size-4" />
                            <span>Platform Templates ({templates.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('components')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                                activeTab === 'components'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Sparkles className="size-4" />
                            <span>Reusable Blocks ({components.length})</span>
                        </button>
                    </div>

                    {/* Search & Sub-Filter */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {activeTab === 'templates' ? (
                            <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
                                {(
                                    [
                                        { id: 'all', label: 'All' },
                                        { id: 'header', label: 'Headers' },
                                        { id: 'footer', label: 'Footers' },
                                        { id: 'page', label: 'Pages' },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setTemplateFilter(tab.id)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            templateFilter === tab.id
                                                ? 'bg-card text-foreground shadow-2xs font-semibold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        <div className="relative flex items-center">
                            <Search className="absolute left-3 size-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search platform catalog..."
                                className="w-56 rounded-full border border-border bg-muted/40 py-1.5 pl-8 pr-7 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card transition"
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3" />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Content: Templates Tab */}
                {activeTab === 'templates' ? (
                    filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-card/50 p-12 text-center">
                            <Shapes className="size-10 text-muted-foreground/60 mb-3" />
                            <h3 className="text-sm font-bold text-foreground">No templates match criteria</h3>
                            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                Try changing your search query or upload a new template package above.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition hover:border-border/80 hover:shadow-md"
                                >
                                    <div>
                                        {/* Wireframe Preview Box */}
                                        <div className="relative h-36 border-b border-border/60 bg-muted/20 p-4 flex items-center justify-center overflow-hidden">
                                            {template.type === 'header' ? (
                                                <div className="w-full max-w-[260px] rounded-lg border border-border bg-card p-2.5 shadow-2xs space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="size-3.5 rounded bg-emerald-600" />
                                                            <div className="h-2 w-12 rounded bg-foreground/70" />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-1.5 w-6 rounded bg-muted-foreground/40" />
                                                            <div className="h-1.5 w-6 rounded bg-muted-foreground/40" />
                                                            <div className="h-1.5 w-6 rounded bg-muted-foreground/40" />
                                                        </div>
                                                        <div className="h-3 w-8 rounded-full bg-emerald-600/20" />
                                                    </div>
                                                </div>
                                            ) : template.type === 'footer' ? (
                                                <div className="w-full max-w-[260px] rounded-lg border border-border bg-card p-3 shadow-2xs space-y-2">
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-7 rounded bg-foreground/60" />
                                                            <div className="h-1.5 w-9 rounded bg-muted-foreground/30" />
                                                            <div className="h-1.5 w-8 rounded bg-muted-foreground/30" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-6 rounded bg-foreground/60" />
                                                            <div className="h-1.5 w-8 rounded bg-muted-foreground/30" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-6 rounded bg-foreground/60" />
                                                            <div className="h-1.5 w-7 rounded bg-muted-foreground/30" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-6 rounded bg-foreground/60" />
                                                            <div className="h-1.5 w-8 rounded bg-muted-foreground/30" />
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-border/60" />
                                                    <div className="flex justify-between items-center">
                                                        <div className="h-1.5 w-14 rounded bg-muted-foreground/20" />
                                                        <div className="h-1.5 w-10 rounded bg-muted-foreground/20" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full max-w-[260px] rounded-lg border border-border bg-card p-3 shadow-2xs space-y-2">
                                                    <div className="h-3 w-28 rounded bg-foreground/70 mx-auto" />
                                                    <div className="h-2 w-36 rounded bg-muted-foreground/40 mx-auto" />
                                                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                                                        <div className="h-8 rounded bg-muted/40 border border-border/40" />
                                                        <div className="h-8 rounded bg-muted/40 border border-border/40" />
                                                        <div className="h-8 rounded bg-muted/40 border border-border/40" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        template.type === 'header'
                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                            : template.type === 'footer'
                                                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                    }`}
                                                >
                                                    {template.type === 'header'
                                                        ? 'Global Header'
                                                        : template.type === 'footer'
                                                        ? 'Global Footer'
                                                        : 'Page Blueprint'}
                                                </span>
                                            </div>

                                            {/* Platform Status Chip */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleTemplatePlatform(template)}
                                                disabled={togglingId === template.id}
                                                className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                                    template.is_platform
                                                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                                title="Click to toggle platform visibility"
                                            >
                                                <Check className="size-3" />
                                                <span>{template.is_platform ? 'Platform' : 'User Only'}</span>
                                            </button>
                                        </div>

                                        {/* Card Info */}
                                        <div className="p-4 space-y-2">
                                            <h3 className="text-sm font-bold text-foreground line-clamp-1">
                                                {template.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {template.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="border-t border-border/60 bg-muted/10 p-3 flex items-center justify-between gap-2">
                                        <div className="text-[11px] text-muted-foreground truncate">
                                            By {template.creator_name}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <a
                                                href={route('builder.templates.show', template.id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                                            >
                                                <span>Customize</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleArchiveTemplate(template)}
                                                className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                                                title="Archive Template"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : null}

                {/* Content: Components Tab */}
                {activeTab === 'components' ? (
                    filteredComponents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-card/50 p-12 text-center">
                            <Sparkles className="size-10 text-muted-foreground/60 mb-3" />
                            <h3 className="text-sm font-bold text-foreground">No reusable blocks found</h3>
                            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                Try changing your search query or upload a new component package above.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredComponents.map((component) => (
                                <div
                                    key={component.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card shadow-xs transition hover:border-border/80 hover:shadow-md"
                                >
                                    <div>
                                        {/* Block Header Wireframe */}
                                        <div className="relative h-28 border-b border-border/60 bg-muted/20 p-4 flex items-center justify-center">
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                    <Sparkles className="size-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-2.5 w-24 rounded bg-foreground/60" />
                                                    <div className="h-2 w-32 rounded bg-muted-foreground/30" />
                                                </div>
                                            </div>

                                            {/* Platform Status Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleComponentPlatform(component)}
                                                disabled={togglingId === component.id}
                                                className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                                    component.is_platform
                                                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                                title="Click to toggle platform visibility"
                                            >
                                                <Check className="size-3" />
                                                <span>{component.is_platform ? 'Platform' : 'User Only'}</span>
                                            </button>
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <h3 className="text-sm font-bold text-foreground line-clamp-1">
                                                {component.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {component.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="border-t border-border/60 bg-muted/10 p-3 flex items-center justify-between gap-2">
                                        <div className="text-[11px] text-muted-foreground truncate">
                                            By {component.creator_name}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleArchiveComponent(component)}
                                                className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                                                title="Archive Component"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : null}
            </div>

            {/* Upload Modal (Superadmin only) */}
            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                initialType={importType}
                onSuccess={() => {
                    router.reload({ only: ['templates', 'components', 'stats'] });
                }}
            />
        </AppLayout>
    );
}
