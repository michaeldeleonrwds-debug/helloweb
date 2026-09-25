import { ArrowUpRight, Boxes, Clock, FileText, Globe, Plus, Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface Website {
    id: number;
    name: string;
    slug: string;
    status: string;
    pagesCount: number;
    updatedAt: string | null;
}

export default function Websites({ websites }: { websites: Website[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    const filteredWebsites = useMemo(() => {
        return websites.filter((site) => {
            const matchesSearch =
                site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                site.slug.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'published' && ['published', 'active', 'live'].includes(site.status.toLowerCase())) ||
                (statusFilter === 'draft' && ['draft', 'pending'].includes(site.status.toLowerCase()));
            return matchesSearch && matchesStatus;
        });
    }, [websites, searchQuery, statusFilter]);

    return (
        <AdminResourcePage
            title="Websites"
            description="Manage all your websites, domains, and multi-page projects."
            action={{ label: 'Create Website', href: route('builder') }}
            empty="No websites yet."
            icon={Boxes}
        >
            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-border bg-card p-3.5 shadow-xs text-card-foreground">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by website name or path..."
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

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                statusFilter === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            All ({websites.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('published')}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
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
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                statusFilter === 'draft'
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            Drafts
                        </button>
                    </div>
                </div>

                {/* Websites Cards Grid */}
                {filteredWebsites.length === 0 ? (
                    <ResourceEmpty
                        message={websites.length === 0 ? 'No websites created yet.' : 'No websites match your filter.'}
                        action={{ label: 'Launch Builder', href: route('builder') }}
                        icon={Boxes}
                    />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredWebsites.map((website) => (
                            <div
                                key={website.id}
                                className="group relative flex flex-col justify-between rounded-[22px] border border-border bg-card p-5.5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md text-card-foreground"
                            >
                                <div>
                                    {/* Mini Browser Bar */}
                                    <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2.5 rounded-full bg-red-400/80" />
                                            <span className="size-2.5 rounded-full bg-amber-400/80" />
                                            <span className="size-2.5 rounded-full bg-emerald-400/80" />
                                        </div>
                                        <StatusBadge status={website.status} />
                                    </div>

                                    {/* Icon & Website Info */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                                <Globe className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate font-extrabold text-base text-foreground group-hover:text-primary transition">
                                                    {website.name}
                                                </h3>
                                                <span className="font-mono text-[11px] text-muted-foreground">
                                                    /{website.slug}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                <FileText className="size-3.5 text-muted-foreground" />
                                                <span>{website.pagesCount}</span> {website.pagesCount === 1 ? 'page' : 'pages'}
                                            </span>
                                            <span>·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3.5 text-muted-foreground" />
                                                <span>{website.updatedAt ? new Date(website.updatedAt).toLocaleDateString() : 'Active'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-3.5">
                                    <Button asChild variant="outline" size="sm" className="rounded-full border-border bg-card hover:bg-muted text-foreground font-semibold text-xs h-8 px-3.5 shadow-2xs">
                                        <Link href={route('pages.index')}>
                                            View Pages
                                        </Link>
                                    </Button>

                                    <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98">
                                        <Link href={route('builder')}>
                                            <Sparkles className="size-3.5" />
                                            <span>Open Builder</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminResourcePage>
    );
}
