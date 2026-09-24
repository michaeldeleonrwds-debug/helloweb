import { ArrowUpRight, Layers, Plus, Sparkles } from 'lucide-react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface ReusableComponent {
    id: number;
    name: string;
    description: string | null;
    status: string;
    updatedAt: string | null;
}

export default function ReusableComponents({ components }: { components: ReusableComponent[] }) {
    return (
        <AdminResourcePage
            title="Reusable Blocks"
            description="Manage shared UI symbols, headers, and modular building blocks synchronized across pages."
            action={{ label: 'New Block', href: route('builder') }}
            empty="No reusable components yet."
            icon={Sparkles}
        >
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                    <div>
                        <CardTitle className="text-lg font-bold">Reusable Component Library</CardTitle>
                        <CardDescription className="text-xs">
                            {components.length} reference-linked block{components.length === 1 ? '' : 's'} available to your pages.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="font-semibold gap-1.5">
                        <Link href={route('builder')}>
                            <Plus className="size-3.5" />
                            Create Block
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {components.length === 0 ? (
                        <ResourceEmpty
                            message="No reusable components created yet."
                            action={{ label: 'Open Builder', href: route('builder') }}
                            icon={Sparkles}
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {components.map((component) => (
                                <div
                                    key={component.id}
                                    className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Layers className="size-4" />
                                            </div>
                                            <StatusBadge status={component.status} />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                                            {component.name}
                                        </h3>
                                        <p className="text-muted-foreground mt-1.5 text-xs line-clamp-2 leading-relaxed">
                                            {component.description || 'Shared modular block definition linked across multiple page layouts.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3">
                                        <span className="text-[11px] text-muted-foreground">
                                            {component.updatedAt ? new Date(component.updatedAt).toLocaleDateString() : 'Active'}
                                        </span>
                                        <Button asChild size="sm" variant="secondary" className="h-7 text-xs font-semibold gap-1">
                                            <Link href={route('builder')}>
                                                <Sparkles className="size-3 text-primary" />
                                                Edit in Builder
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
