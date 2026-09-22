import type { ComponentDefinition } from '../component/definition';
import type { ComponentType } from '../document';

interface ComponentPaletteProps {
    definitions: ComponentDefinition[];
    onInsert: (type: ComponentType) => void;
}

export function ComponentPalette({ definitions, onInsert }: ComponentPaletteProps) {
    const categories = Array.from(new Set(definitions.map((definition) => definition.category)));

    return (
        <aside className="space-y-4 border-r border-neutral-200 bg-white p-4" aria-label="Component insertion">
            <div>
                <h2 className="text-sm font-semibold text-neutral-900">Add component</h2>
                <p className="mt-1 text-xs text-neutral-500">Choose a component valid for the current insertion target.</p>
            </div>
            {categories.map((category) => (
                <section key={category}>
                    <h3 className="mb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase">{category}</h3>
                    <div className="space-y-1">
                        {definitions
                            .filter((definition) => definition.category === category)
                            .map((definition) => (
                                <button
                                    key={definition.type}
                                    type="button"
                                    className="block w-full rounded-md border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                                    onClick={() => onInsert(definition.type)}
                                >
                                    {definition.name}
                                </button>
                            ))}
                    </div>
                </section>
            ))}
            {definitions.length === 0 ? <p className="text-xs text-neutral-500">No components can be inserted here.</p> : null}
        </aside>
    );
}
