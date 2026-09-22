import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Boxes, FileClock, FileText, Image, Plus, Shapes, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface DashboardProps {
    stats: { websites: number; pages: number; templates: number; media: number; reusableComponents: number };
    websites: WebsiteSummary[];
    pages: PageSummary[];
    revisions: RevisionSummary[];
}

interface WebsiteSummary {
    id: number;
    name: string;
    slug: string;
    status: string;
    pagesCount: number;
    updatedAt: string | null;
}
interface PageSummary {
    id: number;
    title: string;
    slug: string;
    status: string;
    websiteName: string;
    updatedAt: string | null;
}
interface RevisionSummary {
    id: number;
    pageId: number;
    pageTitle: string;
    number: number;
    type: string;
    createdAt: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ stats, websites, pages, revisions }: DashboardProps) {
    const hasWorkspace = websites.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="bg-background min-h-full">
                <div className="mx-auto max-w-[1440px] space-y-8 p-5 md:p-8">
                    <section className="border-border flex flex-col justify-between gap-5 border-b pb-7 md:flex-row md:items-end">
                        <div>
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">Workspace</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you.</h1>
                            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                                Manage your sites, pages, design resources, and reusable building blocks from one place.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/builder">
                                <Plus />
                                {hasWorkspace ? 'Open builder' : 'Create your first site'}
                            </Link>
                        </Button>
                    </section>

                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace summary">
                        <MetricCard label="Websites" value={stats.websites} icon={<Boxes />} href="#websites" />
                        <MetricCard label="Pages" value={stats.pages} icon={<FileText />} href="#pages" />
                        <MetricCard label="Templates" value={stats.templates} icon={<Shapes />} href="#templates" />
                        <MetricCard label="Media assets" value={stats.media} icon={<Image />} href="#media" />
                    </section>

                    <section id="websites" className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                        <Card>
                            <CardHeader className="flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg">Websites</CardTitle>
                                    <CardDescription>Your projects and their current page count.</CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/builder">
                                        Open builder <ArrowUpRight />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {websites.length === 0 ? (
                                    <EmptyState
                                        icon={<Boxes />}
                                        title="No websites yet"
                                        description="Start with a persisted website and open its first page in the builder."
                                        action={
                                            <Button asChild size="sm">
                                                <Link href="/builder">Create website</Link>
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="divide-border divide-y">
                                        {websites.map((website) => (
                                            <div key={website.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                                                        <Boxes className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{website.name}</p>
                                                        <p className="text-muted-foreground truncate text-xs">
                                                            {website.slug} · {website.pagesCount} {website.pagesCount === 1 ? 'page' : 'pages'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{website.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card id="pages">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent pages</CardTitle>
                                <CardDescription>Continue editing where you left off.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pages.length === 0 ? (
                                    <EmptyState
                                        icon={<FileText />}
                                        title="No pages yet"
                                        description="Your persisted pages will appear here."
                                        action={
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/builder">Open builder</Link>
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {pages.slice(0, 5).map((page) => (
                                            <Link
                                                key={page.id}
                                                href={`/builder/pages/${page.id}`}
                                                className="hover:border-border hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 transition"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FileText className="text-muted-foreground size-4 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{page.title}</p>
                                                        <p className="text-muted-foreground truncate text-xs">
                                                            {page.websiteName} · /{page.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="text-muted-foreground size-4 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <ResourceCard
                            id="templates"
                            icon={<Shapes />}
                            title="Templates"
                            description="Reusable page structures for faster starts."
                            count={stats.templates}
                            empty="No templates available yet."
                        />
                        <ResourceCard
                            id="media"
                            icon={<Image />}
                            title="Media library"
                            description="Owned assets ready for future media controls."
                            count={stats.media}
                            empty="No media assets yet."
                        />
                        <ResourceCard
                            id="reusable-components"
                            icon={<Sparkles />}
                            title="Reusable components"
                            description="Reference-based building blocks shared across pages."
                            count={stats.reusableComponents}
                            empty="No reusable components yet."
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileClock className="text-muted-foreground size-4" />
                                    Recent revisions
                                </CardTitle>
                                <CardDescription>Immutable page checkpoints.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {revisions.length === 0 ? (
                                    <EmptyState
                                        icon={<FileClock />}
                                        title="No revisions yet"
                                        description="Create a checkpoint from a page in the builder."
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {revisions.map((revision) => (
                                            <div
                                                key={revision.id}
                                                className="border-border/70 flex items-center justify-between rounded-lg border px-3 py-2"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{revision.pageTitle}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Revision {revision.number} · {revision.type}
                                                    </p>
                                                </div>
                                                <Link
                                                    className="text-muted-foreground hover:text-foreground text-xs font-medium"
                                                    href={`/builder/pages/${revision.pageId}`}
                                                >
                                                    Open
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function MetricCard({ label, value, icon, href }: { label: string; value: number; icon: ReactNode; href: string }) {
    return (
        <a
            href={href}
            className="group border-border bg-card text-card-foreground hover:border-ring/50 rounded-lg border p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm"
        >
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{icon}</span>
                <ArrowUpRight className="text-muted-foreground size-4 opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </a>
    );
}

function ResourceCard({
    id,
    icon,
    title,
    description,
    count,
    empty,
}: {
    id: string;
    icon: ReactNode;
    title: string;
    description: string;
    count: number;
    empty: string;
}) {
    return (
        <Card id={id}>
            <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">{icon}</div>
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {count === 0 ? (
                    <p className="text-muted-foreground text-xs">{empty}</p>
                ) : (
                    <p className="text-sm font-medium">
                        {count} {count === 1 ? 'resource' : 'resources'} available
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
    return (
        <div className="border-border bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed px-5 py-9 text-center">
            <div className="bg-muted text-muted-foreground mb-3 flex size-10 items-center justify-center rounded-xl">{icon}</div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
