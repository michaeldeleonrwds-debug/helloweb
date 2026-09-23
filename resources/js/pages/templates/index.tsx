import { Shapes } from 'lucide-react';

import { AdminResourcePage, ResourceCard, ResourceEmpty, StatusBadge } from '@/components/admin-resource-page';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            description="Browse the persisted page structures available to your builder."
            action={{ label: 'Create template', href: route('builder') }}
            empty="No templates available yet."
            icon={Shapes}
        >
            <ResourceCard>
                <CardHeader>
                    <CardTitle>Template library</CardTitle>
                    <CardDescription>Reusable layouts saved for this workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    {templates.length === 0 ? (
                        <ResourceEmpty message="No templates available yet." action={{ label: 'Open builder', href: route('builder') }} />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {templates.map((template) => (
                                <div key={template.id} className="border-border rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">{template.name}</p>
                                            <p className="text-muted-foreground mt-1 text-xs">{template.description || 'No description provided.'}</p>
                                        </div>
                                        <StatusBadge status={template.status} />
                                    </div>
                                    <p className="text-muted-foreground mt-5 text-xs">
                                        {template.type} · {template.slug}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </ResourceCard>
        </AdminResourcePage>
    );
}
