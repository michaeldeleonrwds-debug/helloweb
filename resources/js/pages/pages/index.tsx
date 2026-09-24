import { Link } from '@inertiajs/react';
import { ArrowUpRight, Clock, FileText, Globe, Plus, Sparkles } from 'lucide-react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PageSummary {
    id: number;
    title: string;
    slug: string;
    status: string;
    websiteName: string;
    updatedAt: string | null;
}

export default function Pages({ pages }: { pages: PageSummary[] }) {
    return (
        <AdminResourcePage
            title="Pages"
            description="Manage individual website pages, configure routes, and edit content in the visual builder."
            action={{ label: 'Add New Page', href: route('builder') }}
            empty="No pages yet."
            icon={FileText}
        >
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold">All Pages</CardTitle>
                        <CardDescription className="text-xs">
                            {pages.length} persisted page document{pages.length === 1 ? '' : 's'} across your workspace.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="font-semibold gap-1.5">
                        <Link href={route('builder')}>
                            <Plus className="size-3.5" />
                            Create Page
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {pages.length === 0 ? (
                        <ResourceEmpty
                            message="No pages created yet."
                            action={{ label: 'Open Builder', href: route('builder') }}
                            icon={FileText}
                        />
                    ) : (
                        <div className="divide-y divide-border/60">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="group flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition hover:bg-muted/20 px-3 -mx-3 rounded-lg"
                                >
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                                            <FileText className="size-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-sm text-foreground group-hover:text-primary transition">
                                                {page.title}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                                                    /{page.slug}
                                                </span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    <Globe className="size-3 text-muted-foreground/70" />
                                                    {page.websiteName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-center">
                                        <StatusBadge status={page.status} />
                                        <Button asChild variant="outline" size="sm" className="shadow-xs font-semibold gap-1.5 h-8 text-xs hover:border-primary/40">
                                            <Link href={route('builder.pages.show', page.id)}>
                                                <Sparkles className="size-3 text-primary" />
                                                Edit Page
                                                <ArrowUpRight className="size-3 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminResourcePage>
    );
}
