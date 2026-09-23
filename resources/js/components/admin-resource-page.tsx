import { Head, Link } from '@inertiajs/react';
import { Plus, type LucideIcon } from 'lucide-react';

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
    const breadcrumbs: BreadcrumbItem[] = [{ title, href: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="bg-background min-h-full">
                <div className="mx-auto max-w-[1440px] space-y-8 p-5 md:p-8">
                    <section className="border-border flex flex-col justify-between gap-5 border-b pb-7 md:flex-row md:items-end">
                        <div>
                            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                                <Icon className="size-4" />
                                Workspace
                            </div>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground mt-2 max-w-xl text-sm">{description}</p>
                        </div>
                        {action ? (
                            <Button asChild>
                                <Link href={action.href}>
                                    <Plus />
                                    {action.label}
                                </Link>
                            </Button>
                        ) : null}
                    </section>
                    {children ?? (
                        <Card>
                            <CardContent className="text-muted-foreground py-16 text-center text-sm">{empty}</CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export function ResourceCard({ children }: { children: React.ReactNode }) {
    return <Card>{children}</Card>;
}

export function ResourceEmpty({ message, action }: { message: string; action?: { label: string; href: string } }) {
    return (
        <div className="border-border bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed px-5 py-14 text-center">
            <p className="text-sm font-medium">{message}</p>
            {action ? (
                <Button asChild size="sm" className="mt-4">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            ) : null}
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    return <Badge variant="outline">{status}</Badge>;
}
