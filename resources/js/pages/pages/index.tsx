import { Link } from '@inertiajs/react';
import { ArrowUpRight, FileText } from 'lucide-react';

import { AdminResourcePage, ResourceCard, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            description="Manage pages and open each page's document in the visual builder."
            action={{ label: 'Add new page', href: route('builder') }}
            empty="No pages yet."
            icon={FileText}
        >
            <ResourceCard>
                <CardHeader>
                    <CardTitle>All pages</CardTitle>
                    <CardDescription>Each page opens its own persisted PageDocument.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pages.length === 0 ? (
                        <ResourceEmpty message="No pages yet." action={{ label: 'Open builder', href: route('builder') }} />
                    ) : (
                        <div className="divide-border divide-y">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{page.title}</p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            /{page.slug} · {page.websiteName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={page.status} />
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={route('builder.pages.show', page.id)}>
                                                Edit with Builder
                                                <ArrowUpRight />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </ResourceCard>
        </AdminResourcePage>
    );
}
