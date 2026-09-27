import {
    ArrowUpRight,
    Check,
    Eye,
    Layout,
    PanelBottom,
    PanelTop,
    Pencil,
    Plus,
    Search,
    Shapes,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImportModal } from '@/components/ImportModal';
import { Link, router, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

interface Template {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    is_platform?: boolean;
    is_owner?: boolean;
    status: string;
    updatedAt: string | null;
}

export default function Templates({ templates }: { templates: Template[] }) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = Boolean(auth?.user?.is_superadmin);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // New Template form state
    const [newType, setNewType] = useState<'header' | 'footer' | 'page'>('header');
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const counts = useMemo(() => {
        let headers = 0;
        let footers = 0;
        let pages = 0;
        templates.forEach((t) => {
            const ty = (t.type || '').toLowerCase();
            if (ty === 'header') headers++;
            else if (ty === 'footer') footers++;
            else pages++;
        });
        return { headers, footers, pages, all: templates.length };
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const matchesSearch =
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (template.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            const normalizedType = (template.type || 'page').toLowerCase();
            const matchesType =
                typeFilter === 'all' ||
                (typeFilter === 'header' && normalizedType === 'header') ||
                (typeFilter === 'footer' && normalizedType === 'footer') ||
                (typeFilter === 'page' && (normalizedType === 'page' || normalizedType === 'section'));

            return matchesSearch && matchesType;
        });
    }, [templates, searchQuery, typeFilter]);

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            setCreateError('Please enter a template name.');
            return;
        }

        setIsCreating(true);
        setCreateError(null);

        try {
            const res = await fetch(route('builder.templates.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    name: newName.trim(),
                    type: newType,
                    description: newDescription.trim() || null,
                }),
            });

            const data = await res.json();
            if (res.ok && data.builderUrl) {
                window.location.href = data.builderUrl;
            } else {
                setCreateError(data.message || 'Failed to create template.');
                setIsCreating(false);
            }
        } catch {
            setCreateError('An unexpected error occurred while creating the template.');
            setIsCreating(false);
        }
    };

    const handleDeleteTemplate = async (template: Template) => {
        if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(template.id);
        try {
            const res = await fetch(route('builder.templates.archive', template.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

            if (res.ok) {
                router.reload({ only: ['templates'] });
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete template.');
            }
        } catch {
            alert('Failed to delete template.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <AdminResourcePage
            title="Site Templates"
            description="Manage site-wide theme templates including Global Headers, Global Footers, and Page Blueprints."
            action={{
                label: 'New Template',
                onClick: () => {
                    setNewName('');
                    setNewDescription('');
                    setNewType('header');
                    setCreateError(null);
                    setNewModalOpen(true);
                },
            }}
            secondaryAction={
                isSuperAdmin
                    ? {
                          label: 'Import Template',
                          icon: UploadCloud,
                          onClick: () => setImportModalOpen(true),
                      }
                    : undefined
            }
            empty="No site templates found."
            icon={Shapes}
        >
            <div className="space-y-6">
                {/* Search & Template Type Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-border bg-card p-3.5 shadow-xs text-card-foreground">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates by name or keyword..."
                            className="w-full rounded-full border border-border bg-muted/40 py-2 pl-9.5 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/10 transition"
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 text-muted-foreground hover:text-foreground"
                                title="Clear search"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : null}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setTypeFilter('all')}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                typeFilter === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <span>All Templates</span>
                            <span className="text-[10px] opacity-75">({counts.all})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter('header')}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                typeFilter === 'header'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <PanelTop className="size-3.5" />
                            <span>Global Headers</span>
                            <span className="text-[10px] opacity-75">({counts.headers})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter('footer')}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                typeFilter === 'footer'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <PanelBottom className="size-3.5" />
                            <span>Global Footers</span>
                            <span className="text-[10px] opacity-75">({counts.footers})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeFilter('page')}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                typeFilter === 'page'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Layout className="size-3.5" />
                            <span>Page Blueprints</span>
                            <span className="text-[10px] opacity-75">({counts.pages})</span>
                        </button>
                    </div>
                </div>

                {/* Templates Gallery Grid */}
                {filteredTemplates.length === 0 ? (
                    <ResourceEmpty
                        message={templates.length === 0 ? 'No site templates available yet.' : 'No templates match your search.'}
                        action={{
                            label: 'New Template',
                            onClick: () => {
                                setNewName('');
                                setNewDescription('');
                                setNewType('header');
                                setCreateError(null);
                                setNewModalOpen(true);
                            },
                        }}
                        icon={Shapes}
                    />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => {
                            const isHeader = template.type === 'header';
                            const isFooter = template.type === 'footer';

                            return (
                                <div
                                    key={template.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md text-card-foreground"
                                >
                                    {/* Visual Preview Wireframe Area */}
                                    <div className="relative h-44 w-full bg-gradient-to-br from-muted/50 via-muted to-primary/5 p-4 border-b border-border/60 flex flex-col justify-between overflow-hidden">
                                        {/* Mock Browser Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <span className="size-2 rounded-full bg-red-400/80" />
                                                <span className="size-2 rounded-full bg-amber-400/80" />
                                                <span className="size-2 rounded-full bg-emerald-400/80" />
                                            </div>
                                            <span className="rounded-full bg-card/90 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
                                                /{template.slug}
                                            </span>
                                        </div>

                                        {/* Distinct Wireframe Mockup by Template Type */}
                                        {isHeader ? (
                                            /* Header Wireframe: Sleek top navigation bar */
                                            <div className="my-auto mx-auto w-full px-4 space-y-3">
                                                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-card p-3 shadow-2xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-12 rounded bg-primary/40 font-bold" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-8 rounded bg-muted-foreground/30" />
                                                        <div className="h-2 w-8 rounded bg-muted-foreground/30" />
                                                        <div className="h-2 w-8 rounded bg-muted-foreground/30" />
                                                    </div>
                                                    <div className="h-5 w-14 rounded-full bg-primary/30" />
                                                </div>
                                                <div className="h-2 w-1/2 mx-auto rounded bg-muted-foreground/15" />
                                            </div>
                                        ) : isFooter ? (
                                            /* Footer Wireframe: 4 columns and bottom bar */
                                            <div className="my-auto mx-auto w-full px-4 space-y-2.5">
                                                <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-slate-900/90 dark:bg-slate-950 p-3 text-slate-100 shadow-2xs">
                                                    <div className="space-y-1">
                                                        <div className="h-2.5 w-10 rounded bg-white/40" />
                                                        <div className="h-1.5 w-full rounded bg-white/20" />
                                                        <div className="h-1.5 w-3/4 rounded bg-white/15" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="h-2 w-8 rounded bg-white/30" />
                                                        <div className="h-1.5 w-6 rounded bg-white/20" />
                                                        <div className="h-1.5 w-7 rounded bg-white/20" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="h-2 w-8 rounded bg-white/30" />
                                                        <div className="h-1.5 w-6 rounded bg-white/20" />
                                                        <div className="h-1.5 w-7 rounded bg-white/20" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="h-2 w-8 rounded bg-white/30" />
                                                        <div className="h-1.5 w-5 rounded bg-white/20" />
                                                        <div className="h-1.5 w-6 rounded bg-white/20" />
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-24 mx-auto rounded bg-muted-foreground/20" />
                                            </div>
                                        ) : (
                                            /* Page Blueprint: Full page content wireframe */
                                            <div className="my-auto mx-auto w-4/5 space-y-2 opacity-75 group-hover:opacity-100 transition-opacity">
                                                <div className="h-4 w-3/5 rounded bg-primary/20" />
                                                <div className="h-2 w-full rounded bg-muted-foreground/30" />
                                                <div className="h-2 w-4/5 rounded bg-muted-foreground/20" />
                                                <div className="flex gap-2 pt-1">
                                                    <div className="h-5 w-16 rounded-full bg-primary/30" />
                                                    <div className="h-5 w-12 rounded-full bg-muted-foreground/20" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Template Type Pill Tag */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs ${
                                                        isHeader
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : isFooter
                                                            ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                                                            : 'bg-primary/10 text-primary border-primary/20'
                                                    }`}
                                                >
                                                    {isHeader ? (
                                                        <PanelTop className="size-3" />
                                                    ) : isFooter ? (
                                                        <PanelBottom className="size-3" />
                                                    ) : (
                                                        <Layout className="size-3" />
                                                    )}
                                                    {isHeader ? 'Global Header' : isFooter ? 'Global Footer' : 'Page Blueprint'}
                                                </span>
                                                {template.is_platform ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        Platform
                                                    </span>
                                                ) : null}
                                            </div>
                                            <StatusBadge status={template.status} />
                                        </div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1.5">
                                            <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition">
                                                {template.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {template.description ||
                                                    (isHeader
                                                        ? 'Site-wide header with brand navigation and call-to-action buttons.'
                                                        : isFooter
                                                        ? 'Site-wide footer with column navigation, company bio, and copyright.'
                                                        : 'Pre-built responsive page blueprint layout with structured sections.')}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between border-t border-border/60 pt-3.5">
                                            {!template.is_platform || isSuperAdmin ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTemplate(template)}
                                                    disabled={deletingId === template.id}
                                                    className="size-8 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50"
                                                    title={`Delete ${template.name}`}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            ) : (
                                                <div className="size-8" />
                                            )}

                                            <Button
                                                asChild
                                                size="sm"
                                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98"
                                            >
                                                <Link href={route('builder.templates.show', template.id)}>
                                                    <Pencil className="size-3 stroke-[2.5]" />
                                                    <span>Customize in Builder</span>
                                                    <ArrowUpRight className="size-3 stroke-[2.5]" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* New Theme Template Modal */}
            <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader className="space-y-1.5">
                        <DialogTitle className="text-lg font-bold text-foreground">Create Theme Template</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a site-wide template to design in the visual builder.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateTemplate} className="space-y-4 pt-2">
                        {/* Template Type Choice Cards */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Template Type</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewType('header');
                                        if (!newName || newName.includes('Footer') || newName.includes('Page')) {
                                            setNewName('Custom Header');
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition ${
                                        newType === 'header'
                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <PanelTop className="size-5" />
                                    <span className="text-[11px] font-semibold leading-tight">Global Header</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewType('footer');
                                        if (!newName || newName.includes('Header') || newName.includes('Page')) {
                                            setNewName('Custom Footer');
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition ${
                                        newType === 'footer'
                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <PanelBottom className="size-5" />
                                    <span className="text-[11px] font-semibold leading-tight">Global Footer</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewType('page');
                                        if (!newName || newName.includes('Header') || newName.includes('Footer')) {
                                            setNewName('Custom Page Blueprint');
                                        }
                                    }}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition ${
                                        newType === 'page'
                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Layout className="size-5" />
                                    <span className="text-[11px] font-semibold leading-tight">Page Blueprint</span>
                                </button>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="template_name" className="text-xs font-semibold text-foreground">
                                Template Name
                            </Label>
                            <Input
                                id="template_name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={
                                    newType === 'header'
                                        ? 'e.g. Primary Header'
                                        : newType === 'footer'
                                        ? 'e.g. Dark Minimal Footer'
                                        : 'e.g. Landing Page Blueprint'
                                }
                                className="h-9.5 rounded-xl text-xs"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="template_description" className="text-xs font-semibold text-foreground">
                                Description (Optional)
                            </Label>
                            <Input
                                id="template_description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Brief note about when to use this template"
                                className="h-9.5 rounded-xl text-xs"
                            />
                        </div>

                        {createError ? (
                            <p className="text-xs font-medium text-destructive">{createError}</p>
                        ) : null}

                        <DialogFooter className="pt-2 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewModalOpen(false)}
                                className="rounded-full text-xs h-9 px-4"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-5 shadow-xs transition"
                            >
                                {isCreating ? 'Creating...' : 'Create & Open Builder'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Modal — Kept only on Templates */}
            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                initialType="template"
            />
        </AdminResourcePage>
    );
}
