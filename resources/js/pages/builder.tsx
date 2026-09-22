import { Head } from '@inertiajs/react';

import type { BuilderPageDocument } from '@/builder/document';
import { BuilderEditor } from '@/builder/editor/BuilderEditor';
import type { MediaAsset } from '@/builder/persistence';
import type { ReusableComponentDefinition } from '@/builder/reusable';
import { usePage } from '@inertiajs/react';

interface BuilderPageProps extends Record<string, unknown> {
    page: { id: number; title: string; websiteName: string; version: number };
    document: BuilderPageDocument;
    reusableComponents: ReusableComponentDefinition[];
    templates: { id: number; name: string; description?: string | null }[];
    mediaAssets: MediaAsset[];
}

export default function Builder() {
    const { page, document, reusableComponents, templates, mediaAssets } = usePage<BuilderPageProps>().props;

    return (
        <>
            <Head title={page.title} />
            <div className="bg-background min-h-screen">
                <BuilderEditor
                    document={document}
                    pageId={page.id}
                    initialVersion={page.version}
                    reusableDefinitions={reusableComponents}
                    templates={templates}
                    mediaAssets={mediaAssets}
                    websiteName={page.websiteName}
                    pageName={page.title}
                />
            </div>
        </>
    );
}
