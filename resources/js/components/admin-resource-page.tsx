import { Head, Link } from '@inertiajs/react';
import { Plus, type LucideIcon, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export function AdminResourcePage({
    title,
    description,
    action,
    empty,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    action?: { label: string; href: string };
    empty: string;
    icon: LucideIcon;
    children?: React.ReactNode;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="bg-background min-h-full">
                <div className="mx-auto max-w-[1440px] space-y-6 p-5 md:p-8">
                    {/* Header Banner */}
                    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 p-6 md:p-8 shadow-xs">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-2xs">
                                    <Icon className="size-3.5 text-primary" />
                                    <span>Workspace Resource</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {action ? (
                                    <Button asChild size="default" className="shadow-xs gap-1.5 font-semibold">
                                        <Link href={action.href}>
                                            <Plus className="size-4" />
                                            {action.label}
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    {/* Content Section */}
                    {children ?? (
                        <Card className="border-border/80 shadow-xs">
                            <CardContent className="text-muted-foreground py-20 text-center text-sm">{empty}</CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export function ResourceCard({ children }: { children: React.ReactNode }) {
    return <Card className="border-border/80 shadow-xs overflow-hidden">{children}</Card>;
}

export function ResourceEmpty({
    message,
    action,
    icon: Icon = Sparkles,
}: {
    message: string;
    action?: { label: string; href: string };
    icon?: LucideIcon;
}) {
    return (
        <div className="border-border/80 bg-muted/15 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground shadow-xs">
                <Icon className="size-6 text-primary/80" />
            </div>
            <p className="text-base font-semibold text-foreground">{message}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
                Get started by creating your first entry or opening the visual editor.
            </p>
            {action ? (
                <Button asChild size="sm" className="mt-5 shadow-xs font-semibold gap-1.5">
                    <Link href={action.href}>
                        <Plus className="size-3.5" />
                        {action.label}
                    </Link>
                </Button>
            ) : null}
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const isLive = ['active', 'published', 'live'].includes(status.toLowerCase());
    const isDraft = ['draft', 'pending'].includes(status.toLowerCase());

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium capitalize rounded-full ${
                isLive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : isDraft
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-border/80 bg-muted/40 text-muted-foreground'
            }`}
        >
            <span
                className={`size-1.5 rounded-full ${
                    isLive ? 'bg-emerald-500' : isDraft ? 'bg-amber-500' : 'bg-muted-foreground'
                }`}
            />
            {status}
        </Badge>
    );
}
