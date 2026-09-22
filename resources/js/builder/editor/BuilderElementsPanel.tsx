import { Blocks, GripVertical, Image, LayoutTemplate, Search, Shapes, Type } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import type { ComponentDefinition } from '../component/definition';
import type { ComponentType } from '../document';
import type { MediaAsset } from '../persistence';
import type { ReusableComponentDefinition } from '../reusable';

interface BuilderElementsPanelProps {
    definitions: ComponentDefinition[];
    templates: { id: number; name: string; description?: string | null }[];
    reusableDefinitions: ReusableComponentDefinition[];
    mediaAssets: MediaAsset[];
    onInsert: (type: ComponentType) => void;
    onStartDrag: (type: ComponentType) => void;
    onInsertTemplate: (id: number) => void;
    onInsertReusable: (id: number) => void;
}

type PanelTab = 'elements' | 'templates' | 'components' | 'media';

export function BuilderElementsPanel({
    definitions,
    templates,
    reusableDefinitions,
    mediaAssets,
    onInsert,
    onStartDrag,
    onInsertTemplate,
    onInsertReusable,
}: BuilderElementsPanelProps) {
    const [tab, setTab] = useState<PanelTab>('elements');
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return definitions.filter(
            (definition) =>
                !normalized || `${definition.name} ${definition.description ?? ''} ${definition.category}`.toLowerCase().includes(normalized),
        );
    }, [definitions, query]);
    const categories = Array.from(new Set(filtered.map((definition) => definition.category)));

    return (
        <aside className="border-border bg-card text-card-foreground flex h-1/2 min-h-0 w-[276px] shrink-0 flex-col border-r" aria-label="Builder elements">
            <div className="border-border border-b px-4 pt-4 pb-3">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Build</p>
                        <h2 className="mt-1 text-sm font-semibold">Elements</h2>
                    </div>
                    <Shapes className="text-muted-foreground size-4" />
                </div>
                <label className="relative block">
                    <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-3.5" />
                    <span className="sr-only">Search elements</span>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search elements..."
                        className="border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border pr-3 pl-8 text-xs transition outline-none focus:ring-2"
                    />
                </label>
            </div>
            <div className="border-border flex border-b px-2 pt-2">
                {(
                    [
                        ['elements', 'Elements'],
                        ['templates', 'Templates'],
                        ['components', 'Components'],
                        ['media', 'Media'],
                    ] as const
                ).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        className={`flex-1 border-b-2 px-1 pb-2 text-[11px] font-medium transition ${tab === id ? 'border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
                        onClick={() => setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {tab === 'elements' ? <ElementList definitions={filtered} categories={categories} onInsert={onInsert} onStartDrag={onStartDrag} /> : null}
                {tab === 'templates' ? <DefinitionList empty="No templates available." items={templates} onSelect={onInsertTemplate} /> : null}
                {tab === 'components' ? (
                    <DefinitionList empty="No reusable components yet." items={reusableDefinitions} onSelect={onInsertReusable} />
                ) : null}
                {tab === 'media' ? <MediaList assets={mediaAssets} /> : null}
            </div>
        </aside>
    );
}

function ElementList({
    definitions,
    categories,
    onInsert,
    onStartDrag,
}: {
    definitions: ComponentDefinition[];
    categories: string[];
    onInsert: (type: ComponentType) => void;
    onStartDrag: (type: ComponentType) => void;
}) {
    if (definitions.length === 0) return <EmptyPanel icon={<Search className="size-4" />} text="No matching elements." />;
    return (
        <div className="space-y-5">
            {categories.map((category) => (
                <section key={category}>
                    <h3 className="text-muted-foreground mb-2 px-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                        {categoryLabel(category)}
                    </h3>
                    <div className="space-y-1.5">
                        {definitions
                            .filter((definition) => definition.category === category)
                            .map((definition) => (
                                <button
                                    key={definition.type}
                                    type="button"
                                    className="group hover:border-border hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition"
                                    draggable
                                    onDragStart={() => onStartDrag(definition.type)}
                                    onClick={() => onInsert(definition.type)}
                                >
                                    <span className="bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground flex size-7 items-center justify-center rounded-md">
                                        {iconFor(definition.type)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-xs font-medium">{definition.name}</span>
                                        <span className="text-muted-foreground block truncate text-[10px]">
                                            {definition.description ?? 'Add to your page'}
                                        </span>
                                    </span>
                                    <GripVertical className="text-muted-foreground/50 size-3.5" />
                                </button>
                            ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function DefinitionList({
    items,
    empty,
    onSelect,
}: {
    items: { id: number; name: string; description?: string | null }[];
    empty: string;
    onSelect: (id: number) => void;
}) {
    if (items.length === 0) return <EmptyPanel icon={<LayoutTemplate className="size-4" />} text={empty} />;
    return (
        <div className="space-y-1.5">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className="group hover:border-border hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition"
                    onClick={() => onSelect(item.id)}
                >
                    <span className="bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground flex size-7 items-center justify-center rounded-md">
                        <LayoutTemplate className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{item.name}</span>
                        <span className="text-muted-foreground block truncate text-[10px]">{item.description ?? 'Insert into the current page'}</span>
                    </span>
                    <span className="text-muted-foreground text-[10px] font-medium">Add</span>
                </button>
            ))}
        </div>
    );
}

function MediaList({ assets }: { assets: MediaAsset[] }) {
    if (assets.length === 0) return <EmptyPanel icon={<Image className="size-4" />} text="No media assets yet." />;
    return (
        <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
                <div key={asset.id} className="border-border bg-muted/30 overflow-hidden rounded-lg border">
                    <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center">
                        <Image className="size-5" />
                    </div>
                    <div className="truncate px-2 py-1.5 text-[10px]" title={asset.originalFilename}>
                        {asset.originalFilename}
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyPanel({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="border-border text-muted-foreground flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 text-center text-xs">
            {icon}
            <span>{text}</span>
        </div>
    );
}
function categoryLabel(category: string): string {
    return category.replace(/[-_.]/g, ' ');
}
function iconFor(type: string): ReactNode {
    return type.startsWith('layout.') ? (
        <LayoutTemplate className="size-3.5" />
    ) : type.includes('heading') ? (
        <Type className="size-3.5" />
    ) : (
        <Blocks className="size-3.5" />
    );
}
