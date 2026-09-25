import { Link } from '@inertiajs/react';
import { ArrowUpRight, Clock, FileText, Globe, Plus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';

interface PageSummary {
    id: number;
    title: string;
    slug: string;
    status: string;
    websiteName: string;
    updatedAt: string | null;
}

export default function Pages({ pages }: { pages: PageSummary[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [websiteFilter, setWebsiteFilter] = useState<string>('all');

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

    return (
        <AdminResourcePage
            title="Pages"
            description="Create and manage your website pages, route paths, and responsive content."
            action={{ label: 'Create Page', href: route('builder') }}
            empty="No pages yet."
            icon={FileText}
        >
            <div className="space-y-6">
                {/* Search & Filter Controls (Reference Inspired) */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-[20px] border border-neutral-200/70 bg-white p-3.5 shadow-xs">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, slug, or website..."
                            className="w-full rounded-full border border-neutral-200/80 bg-neutral-50/70 py-2 pl-9.5 pr-4 text-xs font-medium text-foreground placeholder:text-neutral-400 outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Website Selector Dropdown */}
                        {websiteNames.length > 1 && (
                            <select
                                value={websiteFilter}
                                onChange={(e) => setWebsiteFilter(e.target.value)}
                                className="h-8 rounded-full border border-neutral-200/80 bg-white px-3 text-xs font-semibold text-neutral-700 outline-none focus:border-primary/50 transition cursor-pointer"
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
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                All ({pages.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('published')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === 'published'
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                Published
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('draft')}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                    statusFilter === 'draft'
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                Drafts
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pages Card Container */}
                <div className="rounded-[22px] border border-neutral-200/70 bg-white p-6 shadow-xs">
                    {filteredPages.length === 0 ? (
                        <ResourceEmpty
                            message={pages.length === 0 ? 'No pages created yet.' : 'No pages match your search.'}
                            action={{ label: 'Open Builder', href: route('builder') }}
                            icon={FileText}
                        />
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {filteredPages.map((page) => (
                                <div
                                    key={page.id}
                                    className="group flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between px-2.5 -mx-2.5 rounded-xl hover:bg-neutral-50/70 transition"
                                >
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                            <FileText className="size-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-extrabold text-sm text-foreground group-hover:text-primary transition">
                                                {page.title}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60 font-medium">
                                                    /{page.slug}
                                                </span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-600">
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

                                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                                        <StatusBadge status={page.status} />

                                        <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98">
                                            <Link href={route('builder.pages.show', page.id)}>
                                                <Sparkles className="size-3.5" />
                                                <span>Edit Page</span>
                                                <ArrowUpRight className="size-3 stroke-[2.5]" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminResourcePage>
    );
}
