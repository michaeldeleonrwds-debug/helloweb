import { ArrowUpRight, Boxes, Clock, Globe, Plus, Sparkles } from 'lucide-react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            description="Manage your projects, configure domains, and edit page layouts in the visual builder."
            action={{ label: 'New Website', href: route('builder') }}
            empty="No websites yet."
            icon={Boxes}
        >
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Your Projects</CardTitle>
                        <CardDescription className="text-xs">
                            {websites.length} website{websites.length === 1 ? '' : 's'} configured in this workspace.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="font-semibold gap-1.5">
                        <Link href={route('builder')}>
                            <Plus className="size-3.5" />
                            Create Site
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {websites.length === 0 ? (
                        <ResourceEmpty
                            message="No websites created yet."
                            action={{ label: 'Launch Builder', href: route('builder') }}
                            icon={Boxes}
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {websites.map((website) => (
                                <div
                                    key={website.id}
                                    className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                                >
                                    {/* Mini Browser Bar */}
                                    <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-red-400/80" />
                                            <span className="size-2 rounded-full bg-amber-400/80" />
                                            <span className="size-2 rounded-full bg-emerald-400/80" />
                                        </div>
                                        <StatusBadge status={website.status} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Globe className="size-4" />
                                            </div>
                                            <h3 className="truncate font-bold text-base text-foreground group-hover:text-primary transition">
                                                {website.name}
                                            </h3>
                                        </div>
                                        <p className="text-muted-foreground truncate text-xs pl-0.5">
                                            /{website.slug} · <span className="font-semibold text-foreground">{website.pagesCount}</span> {website.pagesCount === 1 ? 'page' : 'pages'}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3">
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {website.updatedAt ? new Date(website.updatedAt).toLocaleDateString() : 'Active'}
                                        </span>
                                        <Button asChild size="sm" variant="default" className="shadow-xs font-semibold gap-1.5 h-8 text-xs">
                                            <Link href={route('builder')}>
                                                <Sparkles className="size-3" />
                                                Open Builder
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
