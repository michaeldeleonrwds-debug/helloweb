import { ArrowUpRight, Clock, Layers, Plus, Search, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminResourcePage, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ImportModal } from '@/components/ImportModal';

interface ReusableComponent {
    id: number;
    name: string;
    description: string | null;
    status: string;
    updatedAt: string | null;
}

export default function ReusableComponents({ components }: { components: ReusableComponent[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const filteredComponents = useMemo(() => {
        return components.filter((comp) => {
            return (
                comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (comp.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [components, searchQuery]);

    const handleDelete = async (comp: ReusableComponent) => {
        if (!confirm(`Are you sure you want to delete "${comp.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(comp.id);
        try {
            const res = await fetch(route('builder.reusable.archive', comp.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

            if (res.ok) {
                router.reload({ only: ['components'] });
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete component.');
            }
        } catch {
            alert('Failed to delete component.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <AdminResourcePage
            title="Reusable Blocks"
            description="Manage shared UI symbols, modular building blocks, and global components synchronized across pages."
            action={{ label: 'New Block', href: route('builder') }}
            secondaryAction={{
                label: 'Import Component',
                icon: UploadCloud,
                onClick: () => setImportModalOpen(true),
            }}
            empty="No reusable components yet."
            icon={Sparkles}
        >
            <div className="space-y-6">
                {/* Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-border bg-card p-3.5 shadow-xs">
                    <div className="relative flex items-center flex-1 max-w-md">
                        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search blocks by name or description..."
                            className="w-full rounded-full border border-border bg-muted/50 py-2 pl-9.5 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/10 transition"
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 text-muted-foreground hover:text-foreground"
                                title="Clear search"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : null}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground px-2">
                        {filteredComponents.length} block{filteredComponents.length === 1 ? '' : 's'} available
                    </span>
                </div>

                {/* Blocks Grid */}
                {filteredComponents.length === 0 ? (
                    <ResourceEmpty
                        message={components.length === 0 ? 'No reusable blocks created yet.' : 'No blocks match your search.'}
                        action={{ label: 'Open Builder', href: route('builder') }}
                        icon={Sparkles}
                    />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredComponents.map((component) => (
                            <div
                                key={component.id}
                                className="group relative flex flex-col justify-between rounded-[22px] border border-border bg-card p-5.5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-3.5">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                            <Layers className="size-5" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={component.status} />
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(component)}
                                                disabled={deletingId === component.id}
                                                className="size-7.5 rounded-full flex items-center justify-center text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50"
                                                title={`Delete ${component.name}`}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition">
                                        {component.name}
                                    </h3>
                                    <p className="text-muted-foreground mt-1.5 text-xs line-clamp-2 leading-relaxed">
                                        {component.description || 'Shared modular building block linked across multiple pages in your project.'}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-border pt-3.5">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3 text-muted-foreground" />
                                        {component.updatedAt ? new Date(component.updatedAt).toLocaleDateString() : 'Active'}
                                    </span>
                                    <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-4 gap-1.5 shadow-2xs transition active:scale-98">
                                        <Link href={route('builder')}>
                                            <Sparkles className="size-3.5" />
                                            <span>Edit in Builder</span>
                                            <ArrowUpRight className="size-3 stroke-[2.5]" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                initialType="component"
            />
        </AdminResourcePage>
    );
}
