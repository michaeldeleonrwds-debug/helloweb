import { Link, router } from '@inertiajs/react';
import { ArrowUpRight, Clock, FileText, Globe, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';

interface PageSummary {
    id: number;
    title: string;
    slug: string;
    status: string;
    websiteName: string;
    websiteId?: number;
    updatedAt: string | null;
}

interface WebsiteOption {
    id: number;
    name: string;
    slug: string;
}

export default function Pages({ pages, websites = [] }: { pages: PageSummary[]; websites?: WebsiteOption[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [websiteFilter, setWebsiteFilter] = useState<string>('all');

    // Create Page Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pageTitle, setPageTitle] = useState('');
    const [pageSlug, setPageSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | undefined>(() => websites[0]?.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Extract unique website names for filter
    const websiteNames = useMemo(() => {
        const set = new Set<string>();
        pages.forEach((p) => {
            if (p.websiteName) set.add(p.websiteName);
        });
        return Array.from(set);
    }, [pages]);

    const filteredPages = useMemo(() => {
        return pages.filter((page) => {
            const matchesSearch =
                page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                page.websiteName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'published' && ['published', 'active', 'live'].includes(page.status.toLowerCase())) ||
                (statusFilter === 'draft' && ['draft', 'pending'].includes(page.status.toLowerCase()));
            const matchesWebsite = websiteFilter === 'all' || page.websiteName === websiteFilter;
            return matchesSearch && matchesStatus && matchesWebsite;
        });
    }, [pages, searchQuery, statusFilter, websiteFilter]);

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (val: string) => {
        setPageTitle(val);
        if (!slugManuallyEdited) {
            setPageSlug(slugify(val));
        }
    };

    const handleCreatePage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageTitle.trim()) {
            setErrorMsg('Page title is required.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg(null);

        router.post(
            route('pages.store'),
            {
                title: pageTitle.trim(),
                slug: (pageSlug.trim() || slugify(pageTitle)).trim(),
                website_id: selectedWebsiteId,
            },
            {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setPageTitle('');
                    setPageSlug('');
                    setSlugManuallyEdited(false);
                },
                onError: (errors) => {
                    setErrorMsg(Object.values(errors)[0] ?? 'Failed to create page.');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleDeletePage = (page: PageSummary) => {
        if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;
        router.delete(route('pages.destroy', page.id));
    };

    return (
        <AdminResourcePage
            title="Pages"
            description="Create and manage your website pages, route paths, and responsive content."
            action={{
                label: 'Create Page',
                onClick: () => {
                    setPageTitle('');
                    setPageSlug('');
                    setSlugManuallyEdited(false);
                    setErrorMsg(null);
                    setIsCreateModalOpen(true);
                },
            }}
            empty="No pages yet."
            icon={FileText}
        >
            <div className="space-y-6">
                {/* Search & Filter Controls */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-[20px] border border-border bg-card p-3.5 shadow-xs text-card-foreground">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, slug, or website..."
                            className="w-full rounded-full border border-border bg-muted/40 py-2 pl-9.5 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/10 transition"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 text-muted-foreground hover:text-foreground"
                                title="Clear search"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Website Selector Dropdown */}
                        {websiteNames.length > 1 && (
                            <select
                                value={websiteFilter}
                                onChange={(e) => setWebsiteFilter(e.target.value)}
                                className="h-8 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none focus:border-primary/50 transition cursor-pointer"
                            >
                                <option value="all">All Websites</option>
                                {websiteNames.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Status Pills */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === 'all'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                All ({pages.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('published')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === 'published'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                Published
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('draft')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === 'draft'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                Drafts
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pages Card Container */}
                <div className="rounded-[22px] border border-border bg-card p-6 shadow-xs text-card-foreground">
                    {filteredPages.length === 0 ? (
                        <ResourceEmpty
                            message={pages.length === 0 ? 'No pages created yet.' : 'No pages match your search.'}
                            action={{
                                label: 'Create New Page',
                                onClick: () => setIsCreateModalOpen(true),
                            }}
                            icon={FileText}
                        />
                    ) : (
                        <div className="divide-y divide-border/60">
                            {filteredPages.map((page) => (
                                <div
                                    key={page.id}
                                    className="group flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between px-2.5 -mx-2.5 rounded-xl hover:bg-muted/40 transition"
                                >
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                            <FileText className="size-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-extrabold text-sm text-foreground group-hover:text-primary transition">
                                                {page.title}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono text-[11px] bg-muted/70 text-foreground px-2 py-0.5 rounded border border-border font-medium">
                                                    /{page.slug}
                                                </span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1 text-[11px] font-medium text-foreground/80">
                                                    <Globe className="size-3 text-muted-foreground" />
                                                    {page.websiteName}
                                                </span>
                                                {page.updatedAt && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            <Clock className="size-3 text-muted-foreground" />
                                                            {new Date(page.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <StatusBadge status={page.status} />

                                        {page.status.toLowerCase() === 'published' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.post(route('pages.unpublish', page.id))}
                                                className="rounded-full border-border text-foreground hover:bg-muted font-semibold text-xs h-8 px-3 transition active:scale-98"
                                            >
                                                Unpublish
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => router.post(route('pages.publish', page.id))}
                                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3 gap-1 shadow-2xs transition active:scale-98"
                                            >
                                                <Globe className="size-3" />
                                                <span>Publish</span>
                                            </Button>
                                        )}

                                        <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98">
                                            <Link href={route('builder.pages.show', page.id)}>
                                                <Sparkles className="size-3.5" />
                                                <span>Edit</span>
                                                <ArrowUpRight className="size-3 stroke-[2.5]" />
                                            </Link>
                                        </Button>

                                        {pages.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePage(page)}
                                                className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                                                title={`Delete ${page.title}`}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE PAGE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Plus className="size-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Create New Page</h3>
                                    <p className="text-xs text-muted-foreground">Add a new page to your visual website.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePage} className="mt-5 space-y-4">
                            {errorMsg && (
                                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                                    {errorMsg}
                                </div>
                            )}

                            {websites.length > 1 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Website</label>
                                    <select
                                        value={selectedWebsiteId}
                                        onChange={(e) => setSelectedWebsiteId(Number(e.target.value))}
                                        className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                                    >
                                        {websites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name} ({site.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">Page Title</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g. About Us, Pricing, Services"
                                    value={pageTitle}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-foreground">Page Slug / URL</label>
                                    <span className="text-[10px] text-muted-foreground">Unique path</span>
                                </div>
                                <div className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition">
                                    <span className="text-xs text-muted-foreground select-none">/</span>
                                    <input
                                        type="text"
                                        placeholder="about-us"
                                        value={pageSlug}
                                        onChange={(e) => {
                                            setPageSlug(slugify(e.target.value));
                                            setSlugManuallyEdited(true);
                                        }}
                                        className="h-9 w-full bg-transparent px-1 font-mono text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-full border-border text-foreground hover:bg-muted font-semibold text-xs px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !pageTitle.trim()}
                                    size="sm"
                                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 shadow-xs transition"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create & Open Builder'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminResourcePage>
    );
}
