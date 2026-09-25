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
    secondaryAction,
    empty,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    action?: { label: string; href?: string; onClick?: () => void };
    secondaryAction?: { label: string; href?: string; icon?: LucideIcon; onClick?: () => void };
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
            <div className="min-h-full bg-background text-foreground">
                <div className="mx-auto max-w-[1400px] space-y-6 p-6 md:p-9">
                    {/* Top Header Section */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            {secondaryAction ? (
                                secondaryAction.onClick ? (
                                    <Button type="button" onClick={secondaryAction.onClick} variant="outline" size="sm" className="rounded-full border-border bg-card px-4 py-2 font-semibold text-xs text-foreground shadow-2xs hover:bg-muted transition">
                                        {secondaryAction.icon && <secondaryAction.icon className="mr-1.5 size-3.5 text-muted-foreground" />}
                                        {secondaryAction.label}
                                    </Button>
                                ) : (
                                    <Button asChild variant="outline" size="sm" className="rounded-full border-border bg-card px-4 py-2 font-semibold text-xs text-foreground shadow-2xs hover:bg-muted transition">
                                        <Link href={secondaryAction.href ?? '#'}>
                                            {secondaryAction.icon && <secondaryAction.icon className="mr-1.5 size-3.5 text-muted-foreground" />}
                                            {secondaryAction.label}
                                        </Link>
                                    </Button>
                                )
                            ) : null}
                            {action ? (
                                action.onClick ? (
                                    <Button type="button" onClick={action.onClick} size="sm" className="rounded-full bg-primary px-5 py-2.5 font-bold text-xs text-primary-foreground shadow-sm hover:brightness-105 active:scale-98 transition">
                                        <Plus className="mr-1.5 size-4 stroke-[2.5]" />
                                        <span>{action.label}</span>
                                    </Button>
                                ) : (
                                    <Button asChild size="sm" className="rounded-full bg-primary px-5 py-2.5 font-bold text-xs text-primary-foreground shadow-sm hover:brightness-105 active:scale-98 transition">
                                        <Link href={action.href ?? '#'} className="flex items-center gap-1.5">
                                            <Plus className="size-4 stroke-[2.5]" />
                                            <span>{action.label}</span>
                                        </Link>
                                    </Button>
                                )
                            ) : null}
                        </div>
                    </div>

                    {/* Content Section */}
                    {children ?? (
                        <Card className="rounded-[20px] border border-border bg-card shadow-xs">
                            <CardContent className="text-muted-foreground py-20 text-center text-sm">{empty}</CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export function ResourceCard({ children }: { children: React.ReactNode }) {
    return <Card className="rounded-[20px] border border-border bg-card text-card-foreground shadow-xs overflow-hidden">{children}</Card>;
}

export function ResourceEmpty({
    message,
    action,
    icon: Icon = Sparkles,
}: {
    message: string;
    action?: { label: string; href?: string; onClick?: () => void };
    icon?: LucideIcon;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <div className="mb-4 flex size-13 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-2xs">
                <Icon className="size-6 text-primary" />
            </div>
            <p className="text-base font-bold text-foreground">{message}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
                Create a new item or launch the visual builder to start designing.
            </p>
            {action ? (
                action.onClick ? (
                    <Button type="button" onClick={action.onClick} size="sm" className="mt-5 rounded-full bg-primary px-5 py-2 font-bold text-xs text-primary-foreground shadow-xs hover:brightness-105 active:scale-98 transition">
                        <Plus className="mr-1.5 size-3.5 stroke-[2.5]" />
                        <span>{action.label}</span>
                    </Button>
                ) : (
                    <Button asChild size="sm" className="mt-5 rounded-full bg-primary px-5 py-2 font-bold text-xs text-primary-foreground shadow-xs hover:brightness-105 active:scale-98 transition">
                        <Link href={action.href ?? '#'} className="flex items-center gap-1.5">
                            <Plus className="size-3.5 stroke-[2.5]" />
                            <span>{action.label}</span>
                        </Link>
                    </Button>
                )
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
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize transition ${
                isLive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : isDraft
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-border bg-muted/60 text-muted-foreground'
            }`}
        >
            <span
                className={`size-1.5 rounded-full ${
                    isLive ? 'bg-emerald-500 animate-pulse' : isDraft ? 'bg-amber-500' : 'bg-muted-foreground'
                }`}
            />
            {status}
        </Badge>
    );
}
