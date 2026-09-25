import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Boxes,
    CheckCircle2,
    Clock,
    FileClock,
    FileText,
    Globe,
    Image,
    Layers,
    Play,
    Plus,
    Radio,
    Shapes,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
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
    const spotlightWebsite = websites[0] ?? null;

    // Calculate publishing percentage from real page data
    const { publishedCount, publishedPercent } = useMemo(() => {
        if (!pages || pages.length === 0) return { publishedCount: 0, publishedPercent: 100 };
        const published = pages.filter((p) => ['published', 'active', 'live'].includes(p.status.toLowerCase())).length;
        const percent = Math.round((published / pages.length) * 100);
        return { publishedCount: published, publishedPercent: percent };
    }, [pages]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - HelloWeb Studio" />
            <div className="min-h-full bg-background">
                <div className="mx-auto max-w-[1400px] space-y-7 p-6 md:p-9">
                    {/* Top Header Section (Reference Inspired: Clean Title + Actions) */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                                Build, manage, and publish your websites with ease.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button asChild size="sm" className="rounded-full bg-primary px-5 py-2.5 font-bold text-xs text-primary-foreground shadow-sm hover:brightness-105 active:scale-98 transition">
                                <Link href="/builder" className="flex items-center gap-1.5">
                                    <Plus className="size-4 stroke-[2.5]" />
                                    <span>Launch Builder</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-full border-neutral-200/80 bg-white px-5 py-2.5 font-semibold text-xs text-foreground shadow-2xs hover:bg-neutral-50 transition">
                                <Link href={route('templates.index')}>
                                    Explore Templates
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* 4-Card KPI Row (Reference Inspired) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
                        {/* KPI 1: Highlight Card (Deep Forest Green) */}
                        <div className="relative flex flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-[#134E35] via-[#154D34] to-[#0A2E1F] p-5 text-white shadow-xs transition hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-emerald-100/90 tracking-wide">
                                    Total Websites
                                </span>
                                <Link
                                    href={route('websites.index')}
                                    title="View all websites"
                                    className="flex size-7.5 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition hover:bg-white hover:text-[#134E35]"
                                >
                                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                                </Link>
                            </div>

                            <div className="my-3">
                                <div className="text-3.5xl md:text-4xl font-extrabold tracking-tight text-white">
                                    {stats.websites}
                                </div>
                            </div>

                            <div className="pt-1">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 backdrop-blur-xs">
                                    <TrendingUp className="size-3 text-emerald-300" />
                                    <span>Active Workspace</span>
                                </span>
                            </div>
                        </div>

                        {/* KPI 2: Total Pages */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                                    Total Pages
                                </span>
                                <Link
                                    href={route('pages.index')}
                                    title="View all pages"
                                    className="flex size-7.5 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50 text-neutral-600 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                >
                                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                                </Link>
                            </div>

                            <div className="my-3">
                                <div className="text-3.5xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                    {stats.pages}
                                </div>
                            </div>

                            <div className="pt-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                    <span>{publishedCount} Published</span>
                                </span>
                            </div>
                        </div>

                        {/* KPI 3: Templates */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                                    Templates
                                </span>
                                <Link
                                    href={route('templates.index')}
                                    title="Explore templates"
                                    className="flex size-7.5 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50 text-neutral-600 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                >
                                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                                </Link>
                            </div>

                            <div className="my-3">
                                <div className="text-3.5xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                    {stats.templates}
                                </div>
                            </div>

                            <div className="pt-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                                    <span>Ready to instantiate</span>
                                </span>
                            </div>
                        </div>

                        {/* KPI 4: Media Assets */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                                    Media Assets
                                </span>
                                <Link
                                    href={route('media.index')}
                                    title="View media assets"
                                    className="flex size-7.5 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50 text-neutral-600 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                >
                                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                                </Link>
                            </div>

                            <div className="my-3">
                                <div className="text-3.5xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                    {stats.media}
                                </div>
                            </div>

                            <div className="pt-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                                    <span>Cloud optimized</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Analytics, Spotlight, Active Projects (Reference Row 2 Inspired) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                        {/* Widget 1: Project Analytics / Visual Activity Bars (Reference Inspired) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs lg:col-span-5">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Website Analytics</h3>
                                        <p className="text-[11px] text-muted-foreground">Weekly page updates & traffic</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/70">
                                        Active
                                    </span>
                                </div>

                                {/* Visual Bars (Sunday to Saturday matching reference image) */}
                                <div className="my-4 flex items-end justify-between gap-2 h-36 px-2 pt-5">
                                    {/* Sunday */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-20 rounded-full bg-emerald-700/60" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">S</span>
                                    </div>
                                    {/* Monday */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-28 rounded-full bg-[#134E35]" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">M</span>
                                    </div>
                                    {/* Tuesday: Highlighted with pill badge (like 74% in reference) */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="relative flex flex-col items-center w-full">
                                            <span className="absolute -top-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 shadow-2xs">
                                                88%
                                            </span>
                                            <div className="w-full max-w-[28px] h-24 rounded-full bg-emerald-400" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-muted-foreground">T</span>
                                    </div>
                                    {/* Wednesday */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-32 rounded-full bg-[#0D3826]" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">W</span>
                                    </div>
                                    {/* Thursday (Patterned/Striped) */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-24 rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">T</span>
                                    </div>
                                    {/* Friday */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-20 rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">F</span>
                                    </div>
                                    {/* Saturday */}
                                    <div className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full max-w-[28px] h-16 rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">S</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground text-[11px]">Last sync: Today</span>
                                <span className="font-semibold text-primary text-[11px] flex items-center gap-1">
                                    <CheckCircle2 className="size-3 text-emerald-600" /> All systems nominal
                                </span>
                            </div>
                        </div>

                        {/* Widget 2: Spotlight Website (Reference "Reminders" Inspired) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs lg:col-span-3">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Spotlight Project
                                    </span>
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <div className="mt-2 space-y-1.5">
                                    <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                                        {spotlightWebsite ? spotlightWebsite.name : 'HelloWeb Studio'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {spotlightWebsite ? `/${spotlightWebsite.slug} · ${spotlightWebsite.pagesCount} pages` : 'Ready to start your first project'}
                                    </p>
                                </div>

                                <div className="mt-4 rounded-xl bg-neutral-50 p-3 border border-neutral-100 space-y-1">
                                    <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="size-3 text-neutral-400" />
                                        <span>Last modified</span>
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                        {spotlightWebsite?.updatedAt ? new Date(spotlightWebsite.updatedAt).toLocaleDateString() : 'Just now'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <Button asChild className="w-full rounded-full bg-primary py-2.5 font-bold text-xs text-primary-foreground shadow-xs hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2">
                                    <Link href="/builder">
                                        <Sparkles className="size-3.5" />
                                        <span>Launch in Studio</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Widget 3: Active Projects List (Reference "Project" list Inspired) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs lg:col-span-4">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-foreground">Projects</h3>
                                    <Link
                                        href={route('websites.index')}
                                        className="rounded-full border border-neutral-200/80 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                                    >
                                        + New
                                    </Link>
                                </div>

                                <div className="divide-y divide-neutral-100">
                                    {websites.length === 0 ? (
                                        <p className="py-8 text-center text-xs text-muted-foreground">No websites created yet.</p>
                                    ) : (
                                        websites.slice(0, 4).map((site) => (
                                            <div key={site.id} className="flex items-center justify-between py-2.5 group">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                                                        <Globe className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition">
                                                            {site.name}
                                                        </h4>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {site.pagesCount} {site.pagesCount === 1 ? 'page' : 'pages'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={site.status} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-3">
                                <Link
                                    href={route('websites.index')}
                                    className="flex items-center justify-center gap-1 text-xs font-bold text-primary hover:underline"
                                >
                                    <span>View all websites</span>
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Recent Pages, Progress Ring, Studio Session (Reference Row 3 Inspired) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                        {/* Widget 4: Recent Pages (Reference "Team Collaboration" Inspired) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs lg:col-span-5">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-foreground">Recent Pages</h3>
                                    <Link
                                        href={route('pages.index')}
                                        className="rounded-full border border-neutral-200/80 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition"
                                    >
                                        All Pages
                                    </Link>
                                </div>

                                <div className="divide-y divide-neutral-100">
                                    {pages.length === 0 ? (
                                        <p className="py-8 text-center text-xs text-muted-foreground">No pages created yet.</p>
                                    ) : (
                                        pages.slice(0, 4).map((page) => (
                                            <div key={page.id} className="flex items-center justify-between py-2.5 group">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-primary/10 group-hover:text-primary transition">
                                                        <FileText className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition">
                                                            {page.title}
                                                        </h4>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            /{page.slug} · {page.websiteName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <StatusBadge status={page.status} />
                                                    <Link
                                                        href={route('builder.pages.show', page.id)}
                                                        title="Edit page in visual builder"
                                                        className="size-6 rounded-full border border-neutral-200/70 bg-neutral-50 flex items-center justify-center text-neutral-500 hover:bg-primary hover:text-white hover:border-primary transition"
                                                    >
                                                        <ArrowUpRight className="size-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-3">
                                <Link
                                    href={route('pages.index')}
                                    className="flex items-center justify-center gap-1 text-xs font-bold text-primary hover:underline"
                                >
                                    <span>Manage all {pages.length} pages</span>
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Widget 5: Publishing Health & Progress Arc (Reference "Project Progress" Inspired) */}
                        <div className="flex flex-col justify-between rounded-[22px] border border-neutral-200/70 bg-white p-5 shadow-xs lg:col-span-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-foreground">Project Progress</h3>
                                    <span className="text-[11px] font-semibold text-muted-foreground">Publication</span>
                                </div>

                                {/* Progress Arc Diagram (Styled SVG arc like in reference) */}
                                <div className="flex flex-col items-center justify-center my-3">
                                    <div className="relative size-36 flex items-center justify-center">
                                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                className="text-neutral-100"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * publishedPercent) / 100}
                                                strokeLinecap="round"
                                                className="text-[#134E35]"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-2xl font-extrabold text-foreground">
                                                {publishedPercent}%
                                            </span>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                Published
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend (Reference Inspired) */}
                                <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-neutral-600 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-[#134E35]" />
                                        <span>Published</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-emerald-400" />
                                        <span>Drafts</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-neutral-300" />
                                        <span>Pending</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-3 text-center">
                                <p className="text-[11px] text-muted-foreground">
                                    {publishedCount} of {pages.length} pages currently live
                                </p>
                            </div>
                        </div>

                        {/* Widget 6: Visual Studio Session (Reference "Time Tracker" Inspired) */}
                        <div className="relative flex flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-[#134E35] via-[#154D34] to-[#0A2E1F] p-5 text-white shadow-xs lg:col-span-3">
                            {/* Decorative curved organic lines */}
                            <div className="absolute -top-12 -right-12 size-40 rounded-full border border-white/10" />
                            <div className="absolute -top-6 -right-6 size-28 rounded-full border border-white/15" />

                            <div className="relative z-10">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                                    Studio Engine
                                </span>

                                <div className="my-5 flex flex-col items-center justify-center text-center">
                                    <div className="font-mono text-3xl font-extrabold tracking-tight text-white">
                                        v2.4.0
                                    </div>
                                    <span className="mt-1 text-[11px] font-semibold text-emerald-200/80">
                                        Canvas Ready
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10 pt-2">
                                <Link
                                    href="/builder"
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/95 hover:bg-white py-2.5 px-4 text-xs font-bold text-[#134E35] shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Play className="size-3.5 fill-current" />
                                    <span>Enter Canvas</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
