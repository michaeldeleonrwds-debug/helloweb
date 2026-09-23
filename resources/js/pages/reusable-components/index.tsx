import { Sparkles } from 'lucide-react';

import { AdminResourcePage, ResourceCard, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            title="Reusable Components"
            description="Manage reference-based building blocks shared across page documents."
            action={{ label: 'Create component', href: route('builder') }}
            empty="No reusable components yet."
            icon={Sparkles}
        >
            <ResourceCard>
                <CardHeader>
                    <CardTitle>Component library</CardTitle>
                    <CardDescription>Reusable definitions available to the builder.</CardDescription>
                </CardHeader>
                <CardContent>
                    {components.length === 0 ? (
                        <ResourceEmpty message="No reusable components yet." action={{ label: 'Open builder', href: route('builder') }} />
                    ) : (
                        <div className="divide-border divide-y">
                            {components.map((component) => (
                                <div key={component.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{component.name}</p>
                                        <p className="text-muted-foreground mt-1 truncate text-xs">
                                            {component.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <StatusBadge status={component.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </ResourceCard>
        </AdminResourcePage>
    );
}
