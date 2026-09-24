import { ArrowUpRight, Plus, Shapes, Sparkles } from 'lucide-react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface Template {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    status: string;
    updatedAt: string | null;
}

export default function Templates({ templates }: { templates: Template[] }) {
    return (
        <AdminResourcePage
            title="Templates"
            description="Explore and manage pre-built page structures and starter layouts available in your workspace."
            action={{ label: 'New Template', href: route('builder') }}
            empty="No templates available yet."
            icon={Shapes}
        >
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Template Library</CardTitle>
                        <CardDescription className="text-xs">
                            {templates.length} starter blueprint{templates.length === 1 ? '' : 's'} available to speed up your page design.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="font-semibold gap-1.5">
                        <Link href={route('builder')}>
                            <Plus className="size-3.5" />
                            Create Template
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {templates.length === 0 ? (
                        <ResourceEmpty
                            message="No templates available yet."
                            action={{ label: 'Open Builder', href: route('builder') }}
                            icon={Shapes}
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                {template.type}
                                            </span>
                                            <StatusBadge status={template.status} />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                                            {template.name}
                                        </h3>
                                        <p className="text-muted-foreground mt-1.5 text-xs line-clamp-2 leading-relaxed">
                                            {template.description || 'Custom layout blueprint designed for quick page instantiation.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3">
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {template.slug}
                                        </span>
                                        <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-semibold gap-1">
                                            <Link href={route('builder')}>
                                                <Sparkles className="size-3 text-purple-500" />
                                                Use Layout
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
        </AdminResourcePage>
    );
}
