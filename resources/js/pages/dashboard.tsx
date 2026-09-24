import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Boxes,
    Clock,
    FileClock,
    FileText,
    Globe,
    Image,
    Layers,
    Plus,
    Radio,
    Shapes,
    Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/admin-resource-page';
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
            <Head title="Studio Dashboard" />
            <div className="bg-background min-h-full">
                <div className="mx-auto max-w-[1440px] space-y-8 p-5 md:p-8">
                    {/* Hero Welcome Banner */}
                    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-10 shadow-xs">
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-2xs">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span>HelloWeb Studio Active</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                    Build without limits.
                                </h1>
                                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed md:text-base">
                                    Design responsive pages visually, compose reusable layout structures, and publish pixel-perfect websites.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button asChild size="lg" className="shadow-sm font-semibold gap-2">
                                    <Link href="/builder">
                                        <Sparkles className="size-4" />
                                        {hasWorkspace ? 'Launch Visual Builder' : 'Create First Website'}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="font-semibold gap-1.5 bg-card/60 backdrop-blur-xs">
                                    <Link href={route('templates.index')}>
                                        <Shapes className="size-4 text-muted-foreground" />
                                        Explore Templates
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* KPI Metrics Grid */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Studio overview">
                        <ModernMetricCard
                            label="Websites"
                            value={stats.websites}
                            subtitle={`${websites.filter((w) => w.status === 'active' || w.status === 'published').length} active`}
                            icon={<Boxes className="size-5 text-blue-500" />}
                            iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            href="#websites"
                        />
                        <ModernMetricCard
                            label="Total Pages"
                            value={stats.pages}
                            subtitle="Persisted layouts"
                            icon={<FileText className="size-5 text-emerald-500" />}
                            iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            href="#pages"
                        />
                        <ModernMetricCard
                            label="Templates"
                            value={stats.templates}
                            subtitle="Starter blueprints"
                            icon={<Shapes className="size-5 text-purple-500" />}
                            iconBg="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            href={route('templates.index')}
                        />
                        <ModernMetricCard
                            label="Media Assets"
                            value={stats.media}
                            subtitle="Images & graphics"
                            icon={<Image className="size-5 text-amber-500" />}
                            iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            href={route('media.index')}
                        />
                    </section>

                    {/* Websites Showcase & Recent Pages Grid */}
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
                        {/* Websites Section */}
                        <Card id="websites" className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                                <div>
                                    <CardTitle className="text-lg font-bold">Active Projects</CardTitle>
                                    <CardDescription className="text-xs">Your websites in this workspace</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                                    <Link href={route('websites.index')}>
                                        View All
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-5">
                                {websites.length === 0 ? (
                                    <StudioEmptyState
                                        icon={<Boxes className="size-6 text-primary" />}
                                        title="No websites created yet"
                                        description="Start your first website project and customize its design in the visual builder."
                                        action={
                                            <Button asChild size="sm" className="font-semibold gap-1.5">
                                                <Link href="/builder">
                                                    <Plus className="size-4" />
                                                    Create Website
                                                </Link>
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {websites.map((website) => (
                                            <div
                                                key={website.id}
                                                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                            >
                                                {/* Mini Browser Bar */}
                                                <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="size-2 rounded-full bg-red-400/80" />
                                                        <span className="size-2 rounded-full bg-amber-400/80" />
                                                        <span className="size-2 rounded-full bg-emerald-400/80" />
                                                    </div>
                                                    <StatusBadge status={website.status} />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="size-4 text-primary shrink-0" />
                                                        <h3 className="truncate font-semibold text-sm text-foreground">{website.name}</h3>
                                                    </div>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        /{website.slug} · {website.pagesCount} {website.pagesCount === 1 ? 'page' : 'pages'}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {website.updatedAt ? new Date(website.updatedAt).toLocaleDateString() : 'Recently'}
                                                    </span>
                                                    <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-semibold gap-1">
                                                        <Link href="/builder">
                                                            Open Builder
                                                            <ArrowUpRight className="size-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Pages Section */}
                        <Card id="pages" className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                                <div>
                                    <CardTitle className="text-lg font-bold">Recent Pages</CardTitle>
                                    <CardDescription className="text-xs">Quick jump into page editor</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                                    <Link href={route('pages.index')}>
                                        All Pages
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                {pages.length === 0 ? (
                                    <StudioEmptyState
                                        icon={<FileText className="size-6 text-primary" />}
                                        title="No pages yet"
                                        description="Pages will show here as you construct your site in the builder."
                                        action={
                                            <Button asChild size="sm" variant="outline" className="font-semibold">
                                                <Link href="/builder">Open Builder</Link>
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {pages.slice(0, 5).map((page) => (
                                            <div
                                                key={page.id}
                                                className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40 text-muted-foreground group-hover:text-primary transition">
                                                        <FileText className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition">
                                                            {page.title}
                                                        </p>
                                                        <p className="text-muted-foreground truncate text-[11px]">
                                                            /{page.slug} · {page.websiteName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                                                    <Link href={`/builder/pages/${page.id}`}>
                                                        Edit
                                                        <ArrowUpRight className="size-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Row: Templates & Reusable & Revisions */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Templates Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                        <Shapes className="size-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">Template Library</CardTitle>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">{stats.templates} saved</span>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Reusable full-page blueprints ready to clone and customize in seconds.
                                </p>
                                <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5">
                                    <Link href={route('templates.index')}>
                                        Browse Library
                                        <ArrowUpRight className="size-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reusable Components Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Layers className="size-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">Reusable Blocks</CardTitle>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">{stats.reusableComponents} blocks</span>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Global headers, footers, and cards linked across pages.
                                </p>
                                <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5">
                                    <Link href={route('reusable-components.index')}>
                                        Manage Blocks
                                        <ArrowUpRight className="size-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Revisions */}
                        <Card className="border-border/80 shadow-xs md:col-span-2 lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <FileClock className="size-3.5" />
                                    </div>
                                    <CardTitle className="text-sm font-bold">History & Revisions</CardTitle>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">{revisions.length} total</span>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {revisions.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-2 text-center">No checkpoints recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {revisions.slice(0, 3).map((revision) => (
                                            <div
                                                key={revision.id}
                                                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs"
                                            >
                                                <div className="truncate min-w-0 pr-2">
                                                    <p className="truncate font-medium text-foreground">{revision.pageTitle}</p>
                                                    <p className="text-[10px] text-muted-foreground">Rev #{revision.number} · {revision.type}</p>
                                                </div>
                                                <Link
                                                    href={`/builder/pages/${revision.pageId}`}
                                                    className="shrink-0 text-primary hover:underline text-[11px] font-semibold"
                                                >
                                                    Restore
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ModernMetricCard({
    label,
    value,
    subtitle,
    icon,
    iconBg,
    href,
}: {
    label: string;
    value: number;
    subtitle: string;
    icon: ReactNode;
    iconBg: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
            <div className="flex items-center justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
                    {icon}
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div className="mt-4">
                <p className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground">{value}</p>
                <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                    <span className="text-[11px] text-muted-foreground/80">{subtitle}</span>
                </div>
            </div>
        </a>
    );
}

function StudioEmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-xs">
                {icon}
            </div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
