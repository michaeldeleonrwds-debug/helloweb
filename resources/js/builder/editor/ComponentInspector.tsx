import { ChevronDown, Copy, MoreHorizontal, Trash2 } from 'lucide-react';

import type { ComponentDefinition } from '../component/definition';
import { HELLOWEB_DESIGN_TOKENS } from '../design-tokens';
import type { BuilderBreakpoint, BuilderComponentNode, BuilderRecord, JsonValue } from '../document';
import {
    getStyleDefinitions,
    inheritedStyleValue,
    type LengthValue,
    type StyleDefinition,
    type StylePropertyKey,
    type StyleValue,
} from '../style/style';
import { CssValueEditor } from './CssValueEditor';

interface ComponentInspectorProps {
    node: BuilderComponentNode | null;
    definition: ComponentDefinition | null;
    onChange: (patch: Partial<BuilderRecord>) => void;
    breakpoint: BuilderBreakpoint;
    onBreakpointChange: (breakpoint: BuilderBreakpoint) => void;
    onStyleChange: (key: StylePropertyKey, value: StyleValue) => void;
    onStyleClear: (key: StylePropertyKey) => void;
    onDuplicate: () => void;
    onRemove: () => void;
    onAddChild?: (type: `${string}.${string}`) => void;
}

export function ComponentInspector({
    node,
    definition,
    onChange,
    breakpoint,
    onBreakpointChange,
    onStyleChange,
    onStyleClear,
    onDuplicate,
    onRemove,
    onAddChild,
}: ComponentInspectorProps) {
    if (!node || !definition) {
        return (
            <aside
                className="border-border bg-card text-card-foreground absolute inset-y-14 right-0 z-10 flex w-[328px] shrink-0 items-center justify-center border-l p-6 shadow-xl lg:static lg:inset-y-auto lg:right-auto lg:z-auto lg:shadow-none"
                aria-label="Design inspector"
            >
                <div className="max-w-48 text-center">
                    <div className="bg-muted text-muted-foreground mx-auto mb-3 flex size-10 items-center justify-center rounded-xl">
                        <MoreHorizontal className="size-4" />
                    </div>
                    <p className="text-sm font-medium">Nothing selected</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">Select an element on the canvas or in Layers to edit it.</p>
                </div>
            </aside>
        );
    }

    const styles = getStyleDefinitions(definition);
    const schema = definition.propSchema ?? {};
    const supportsWidthMode = ['layout.row', 'layout.column', 'layout.container'].includes(node.type);
    const maxWidth = inheritedStyleValue(node, definition, breakpoint, 'maxWidth').value;
    const isFullWidth = maxWidth === '100%';
    const groups = [
        { id: 'content', label: 'Content', properties: [] as StyleDefinition[] },
        { id: 'layout', label: 'Layout', properties: styles.filter((property) => ['layout', 'flex', 'position'].includes(property.group)) },
        { id: 'typography', label: 'Typography', properties: styles.filter((property) => property.group === 'text') },
        { id: 'appearance', label: 'Appearance', properties: styles.filter((property) => ['background', 'border'].includes(property.group)) },
    ].filter((group) => (group.id === 'content' ? Object.keys(schema).length > 0 : group.properties.length > 0));

    return (
        <aside
            className="border-border bg-card text-card-foreground absolute inset-y-14 right-0 z-10 flex w-[328px] shrink-0 flex-col border-l shadow-xl lg:static lg:inset-y-auto lg:right-auto lg:z-auto lg:shadow-none"
            aria-label="Design inspector"
        >
            <div className="border-border flex items-start justify-between border-b px-4 py-4">
                <div className="min-w-0">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Design</p>
                    <h2 className="mt-1 truncate text-sm font-semibold">{definition.name}</h2>
                    <p className="text-muted-foreground mt-1 truncate font-mono text-[10px]">{node.id}</p>
                </div>
                {supportsWidthMode ? (
                    <div className="border-border flex items-center justify-between border-b px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold">Width mode</p>
                            <p className="text-muted-foreground mt-0.5 text-[10px]">{isFullWidth ? 'Full viewport width' : '900px content width'}</p>
                        </div>
                        <button
                            type="button"
                            className="border-border hover:bg-muted rounded-md border px-2 py-1 text-xs font-medium transition"
                            onClick={() => {
                                onStyleChange('maxWidth', isFullWidth ? '900px' : '100%');
                                onStyleChange('margin', isFullWidth ? '0 auto' : '0px');
                            }}
                        >
                            {isFullWidth ? 'Constrain' : 'Full width'}
                        </button>
                    </div>
                ) : null}
                <button
                    type="button"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
                    aria-label="More element actions"
                >
                    <MoreHorizontal className="size-4" />
                </button>
            </div>
            {node.type === 'layout.section' && onAddChild ? (
                <div className="border-border flex items-center gap-2 border-b px-4 py-3">
                    <span className="text-muted-foreground mr-auto text-[10px] font-semibold tracking-[0.14em] uppercase">Section</span>
                    <button
                        type="button"
                        className="border-border hover:bg-muted rounded-md border px-2 py-1 text-xs font-medium transition"
                        onClick={() => onAddChild('layout.row')}
                    >
                        + Row
                    </button>
                    <button type="button" className="border-border hover:bg-muted rounded-md border px-2 py-1 text-xs font-medium transition">
                        Settings
                    </button>
                </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="border-border border-b px-4 py-3">
                    <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase">Responsive</p>
                    <div className="bg-muted grid grid-cols-3 rounded-md p-0.5" role="tablist" aria-label="Responsive breakpoint">
                        {(['desktop', 'tablet', 'mobile'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                role="tab"
                                aria-selected={breakpoint === option}
                                className={`rounded px-2 py-1.5 text-[11px] font-medium capitalize transition ${breakpoint === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => onBreakpointChange(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                {groups.map((group) => (
                    <details key={group.id} open className="group border-border border-b last:border-0">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold">
                            <span>{group.label}</span>
                            <ChevronDown className="text-muted-foreground size-3.5 transition group-open:rotate-180" />
                        </summary>
                        <div className="space-y-3 px-4 pb-4">
                            {group.id === 'content' ? (
                                <PropControls schema={schema} values={node.props} onChange={onChange} />
                            ) : (
                                group.properties.map((property) => (
                                    <StyleControl
                                        key={property.key}
                                        property={property}
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onStyleChange}
                                        onClear={onStyleClear}
                                    />
                                ))
                            )}
                        </div>
                    </details>
                ))}
                <div className="border-border flex gap-2 border-t px-4 py-4">
                    <button
                        type="button"
                        className="border-border hover:bg-muted inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition"
                        onClick={onDuplicate}
                    >
                        <Copy className="size-3.5" />
                        Duplicate
                    </button>
                    <button
                        type="button"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition"
                        onClick={onRemove}
                    >
                        <Trash2 className="size-3.5" />
                        Remove
                    </button>
                </div>
            </div>
        </aside>
    );
}

function PropControls({
    schema,
    values,
    onChange,
}: {
    schema: NonNullable<ComponentDefinition['propSchema']>;
    values: BuilderRecord;
    onChange: (patch: Partial<BuilderRecord>) => void;
}) {
    return (
        <>
            {Object.entries(schema).map(([name, property]) => {
                const value = values[name];
                const label = typeof property.label === 'string' ? property.label : name;
                const options = Array.isArray(property.values) ? property.values : [];
                if (property.type === 'enum' && options.length > 0)
                    return (
                        <label key={name} className="block text-xs font-medium">
                            {label}
                            <select
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                                value={String(value ?? '')}
                                onChange={(event) => onChange({ [name]: parseValue(event.target.value, options) })}
                            >
                                {options.map((option) => (
                                    <option key={String(option)} value={String(option)}>
                                        {String(option)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    );
                return (
                    <label key={name} className="block text-xs font-medium">
                        {label}
                        <input
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                            type={property.type === 'integer' || property.type === 'number' ? 'number' : 'text'}
                            value={String(value ?? '')}
                            min={typeof property.min === 'number' ? property.min : undefined}
                            max={typeof property.max === 'number' ? property.max : undefined}
                            onChange={(event) =>
                                onChange({
                                    [name]:
                                        property.type === 'integer' || property.type === 'number' ? Number(event.target.value) : event.target.value,
                                })
                            }
                        />
                    </label>
                );
            })}
        </>
    );
}

function StyleControl({
    property,
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    property: StyleDefinition;
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const current = inheritedStyleValue(node, definition, breakpoint, property.key);
    const options = property.options ?? [];
    return (
        <label className="block text-xs font-medium">
            {property.label}
            {property.type === 'enum' && options.length > 0 ? (
                <select
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                    value={String(current.value ?? '')}
                    onChange={(event) => onChange(property.key, event.target.value)}
                >
                    <option value="">Select...</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : property.type === 'length' ? (
                <CssValueEditor
                    property={property.key}
                    value={current.value as string | number | LengthValue | undefined}
                    onChange={(value) => onChange(property.key, value as StyleValue)}
                />
            ) : property.type === 'color' ? (
                <div className="mt-1.5 flex gap-1.5">
                    <input
                        aria-label={`${property.label} color`}
                        className="border-input bg-background h-8 w-10 cursor-pointer rounded-md border p-1"
                        type="color"
                        value={normalizeColor(current.value)}
                        onChange={(event) => onChange(property.key, event.target.value)}
                    />
                    <select
                        aria-label={`${property.label} token`}
                        className="border-input bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-xs"
                        value=""
                        onChange={(event) => event.target.value && onChange(property.key, event.target.value)}
                    >
                        <option value="">Token...</option>
                        <option value={HELLOWEB_DESIGN_TOKENS.colors.primary}>Primary</option>
                        <option value={HELLOWEB_DESIGN_TOKENS.colors.accent}>Accent</option>
                        <option value={HELLOWEB_DESIGN_TOKENS.colors.background}>Background</option>
                        <option value="transparent">Transparent</option>
                    </select>
                </div>
            ) : (
                <input
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                    type={property.type === 'number' ? 'number' : 'text'}
                    value={String(current.value ?? '')}
                    placeholder={undefined}
                    onChange={(event) => onChange(property.key, property.type === 'number' ? Number(event.target.value) : event.target.value)}
                />
            )}
            {current.inherited ? <span className="text-muted-foreground mt-1 block text-[10px] font-normal">Inherited from desktop</span> : null}
            {node.styles[breakpoint]?.[property.key] !== undefined ? (
                <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground mt-1 text-[10px] font-normal underline underline-offset-2"
                    onClick={() => onClear(property.key)}
                >
                    Clear override
                </button>
            ) : null}
        </label>
    );
}

function parseValue(value: string, values: JsonValue[]): JsonValue {
    return values.find((option) => String(option) === value) ?? value;
}

function normalizeColor(value: StyleValue | undefined): string {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
}
