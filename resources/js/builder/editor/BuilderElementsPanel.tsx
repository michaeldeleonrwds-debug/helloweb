import {
    Plus,
    Search,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ComponentDefinition } from '../component/definition';
import type { ComponentType } from '../document';
import type { MediaAsset } from '../persistence';
import type { ReusableComponentDefinition } from '../reusable';
import { getCategoryBadge, getComponentVisual } from './component-icons';

export interface BuilderElementsPanelProps {
    definitions: ComponentDefinition[];
    onInsert: (type: ComponentType) => void;
    onStartDrag: (type: ComponentType) => void;
    templates?: { id: number; name: string; description?: string | null }[];
    reusableDefinitions?: ReusableComponentDefinition[];
    mediaAssets?: MediaAsset[];
    onInsertTemplate?: (id: number) => void;
    onInsertReusable?: (id: number) => void;
    showHeader?: boolean;
    className?: string;
}

export function BuilderElementsPanel({
    definitions,
    onInsert,
    onStartDrag,
    showHeader = false,
    className = '',
}: BuilderElementsPanelProps) {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Extract available categories
    const categories = useMemo(() => {
        const unique = Array.from(new Set(definitions.map((def) => def.category)));
        // Order logically: layout first, then content, media, code, marketing, others
        const priority = ['layout', 'content', 'media', 'code', 'marketing'];
        return unique.sort((a, b) => {
            const indexA = priority.indexOf(a);
            const indexB = priority.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [definitions]);

    // Filter elements
    const filteredDefinitions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return definitions.filter((definition) => {
            const matchesCategory = selectedCategory === 'all' || definition.category === selectedCategory;
            if (!matchesCategory) return false;

            if (!normalized) return true;
            const searchTarget = `${definition.name} ${definition.description ?? ''} ${definition.category} ${definition.type}`.toLowerCase();
            return searchTarget.includes(normalized);
        });
    }, [definitions, query, selectedCategory]);

    // Active categories in filtered list
    const activeCategories = useMemo(() => {
        const set = new Set(filteredDefinitions.map((def) => def.category));
        return categories.filter((cat) => set.has(cat));
    }, [filteredDefinitions, categories]);

    return (
        <div className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-card text-card-foreground ${className}`} aria-label="Builder elements">
            {showHeader ? (
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3.5">
                    <span className="text-xs font-semibold tracking-tight text-foreground">Elements</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {definitions.length}
                    </span>
                </div>
            ) : null}

            {/* Google M3 Search & Category Filter Section */}
            <div className="shrink-0 space-y-2 border-b border-border p-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search elements..."
                        className="h-8 w-full rounded-full border border-input bg-muted/50 pr-8 pl-8 text-xs text-foreground placeholder:text-muted-foreground transition outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute top-2 right-2.5 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Clear search"
                        >
                            <X className="size-3" />
                        </button>
                    ) : null}
                </div>

                {/* Category Filter Chips */}
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                            selectedCategory === 'all'
                                ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        All ({definitions.length})
                    </button>
                    {categories.map((cat) => {
                        const count = definitions.filter((def) => def.category === cat).length;
                        const badge = getCategoryBadge(cat);
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {badge.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Elements Grid List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                {filteredDefinitions.length === 0 ? (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 text-center text-xs text-muted-foreground">
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Search className="size-4" />
                        </div>
                        <p className="font-medium text-foreground">No elements found</p>
                        <p className="text-[11px] text-muted-foreground">No elements match &quot;{query}&quot;</p>
                        {query || selectedCategory !== 'all' ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setSelectedCategory('all');
                                }}
                                className="mt-1 text-[11px] font-medium text-primary hover:underline"
                            >
                                Reset filters
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeCategories.map((category) => {
                            const categoryElements = filteredDefinitions.filter((def) => def.category === category);
                            const badge = getCategoryBadge(category);
                            return (
                                <section key={category} className="space-y-2">
                                    <div className="flex items-center gap-2 px-0.5">
                                        <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            {badge.label}
                                        </h3>
                                        <div className="h-px flex-1 bg-border/60" />
                                        <span className="text-[10px] font-normal text-muted-foreground/70">
                                            {categoryElements.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryElements.map((definition) => {
                                            const visual = getComponentVisual(definition.type);
                                            return (
                                                <button
                                                    key={definition.type}
                                                    type="button"
                                                    draggable
                                                    onDragStart={() => onStartDrag(definition.type)}
                                                    onClick={() => onInsert(definition.type)}
                                                    className="group relative flex cursor-grab flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 text-center shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs active:scale-[0.98] active:cursor-grabbing"
                                                    title={definition.description ?? `Click to insert ${definition.name} or drag to position`}
                                                >
                                                    {/* Hover plus hint */}
                                                    <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Plus className="size-2.5" />
                                                    </span>

                                                    {/* Icon container */}
                                                    <span
                                                        className={`flex size-8 items-center justify-center rounded-lg ${visual.bgColor} ${visual.textColor} transition-transform duration-150 group-hover:scale-110`}
                                                    >
                                                        {visual.icon('size-4')}
                                                    </span>

                                                    {/* Label */}
                                                    <span className="max-w-full truncate text-xs font-medium text-foreground">
                                                        {definition.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuilderElementsPanel;
