import { ArrowUpRight, Eye, Layout, Plus, Search, Shapes, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ImportModal } from '@/components/ImportModal';

interface Template {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    status: string;
    updatedAt: string | null;
}

export default function Templates({ templates }: { templates: Template[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const categories = useMemo(() => {
        const set = new Set<string>();
        templates.forEach((t) => {
            if (t.type) set.add(t.type);
        });
        return Array.from(set);
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const matchesSearch =
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (template.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || template.type.toLowerCase() === categoryFilter.toLowerCase();
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchQuery, categoryFilter]);

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
            title="Templates"
            description="Explore our curated collection of responsive page blueprints and pre-built design layouts."
            action={{ label: 'New Template', href: route('builder') }}
            secondaryAction={{
                label: 'Import Template',
                icon: UploadCloud,
                onClick: () => setImportModalOpen(true),
            }}
            empty="No templates available yet."
            icon={Shapes}
        >
            <div className="space-y-6">
                {/* Search & Category Filter Bar */}
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

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setCategoryFilter('all')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                categoryFilter === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            All ({templates.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategoryFilter(cat)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                                    categoryFilter === cat
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Gallery Grid */}
                {filteredTemplates.length === 0 ? (
                    <ResourceEmpty
                        message={templates.length === 0 ? 'No templates available yet.' : 'No templates match your search.'}
                        action={{ label: 'Open Builder', href: route('builder') }}
                        icon={Shapes}
                    />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md text-card-foreground"
                            >
                                {/* Visual Preview Mockup Area */}
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

                                    {/* Abstract Section Preview Wireframe */}
                                    <div className="my-auto mx-auto w-4/5 space-y-2 opacity-75 group-hover:opacity-100 transition-opacity">
                                        <div className="h-4 w-3/5 rounded bg-primary/20" />
                                        <div className="h-2 w-full rounded bg-muted-foreground/30" />
                                        <div className="h-2 w-4/5 rounded bg-muted-foreground/20" />
                                        <div className="flex gap-2 pt-1">
                                            <div className="h-5 w-16 rounded-full bg-primary/30" />
                                            <div className="h-5 w-12 rounded-full bg-muted-foreground/20" />
                                        </div>
                                    </div>

                                    {/* Category Pill Tag */}
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-card/90 border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-2xs">
                                            <Layout className="size-3" />
                                            {template.type}
                                        </span>
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
                                            {template.description || 'Pre-built responsive page layout with structured sections and typography.'}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between border-t border-border/60 pt-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <Button asChild variant="outline" size="sm" className="rounded-full border-border bg-card hover:bg-muted text-foreground font-semibold text-xs h-8 px-3 shadow-2xs">
                                                <Link href={route('builder')}>
                                                    <Eye className="mr-1.5 size-3 text-muted-foreground" />
                                                    Preview
                                                </Link>
                                            </Button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTemplate(template)}
                                                disabled={deletingId === template.id}
                                                className="size-8 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50"
                                                title={`Delete ${template.name}`}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>

                                        <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98">
                                            <Link href={route('builder')}>
                                                <Sparkles className="size-3.5" />
                                                <span>Use Layout</span>
                                                <ArrowUpRight className="size-3 stroke-[2.5]" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                initialType="template"
            />
        </AdminResourcePage>
    );
}
