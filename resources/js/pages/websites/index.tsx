import { ArrowUpRight, Boxes } from 'lucide-react';

import { AdminResourcePage, ResourceCard, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    return (
        <AdminResourcePage
            title="Websites"
            description="Manage the websites in your workspace and open their page content."
            action={{ label: 'New website', href: route('builder') }}
            empty="No websites yet."
            icon={Boxes}
        >
            <ResourceCard>
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                        {websites.length} website{websites.length === 1 ? '' : 's'} in this workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {websites.length === 0 ? (
                        <ResourceEmpty message="No websites yet." action={{ label: 'Create website', href: route('builder') }} />
                    ) : (
                        <div className="divide-border divide-y">
                            {websites.map((website) => (
                                <div key={website.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                                            <Boxes className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{website.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {website.slug} · {website.pagesCount} {website.pagesCount === 1 ? 'page' : 'pages'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={website.status} />
                                        <Link
                                            href={route('builder')}
                                            className="text-muted-foreground hover:text-foreground"
                                            aria-label={`Open ${website.name}`}
                                        >
                                            <ArrowUpRight className="size-4" />
                                        </Link>
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
