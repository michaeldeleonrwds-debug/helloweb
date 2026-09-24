import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowRight,
    ChevronDown,
    Copy,
    Eye,
    EyeOff,
    Link as LinkIcon,
    Link2,
    MousePointer2,
    Plus,
    RotateCcw,
    Trash2,
    Type,
    Underline,
    Unlink2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { ComponentDefinition } from '../component/definition';
import { HELLOWEB_DESIGN_TOKENS } from '../design-tokens';
import type { BuilderBreakpoint, BuilderComponentNode, BuilderRecord, JsonValue } from '../document';
import { HELLOWEB_FONT_LIBRARY, HELLOWEB_FONT_WEIGHT_OPTIONS } from '../fonts/font-library';
import {
    getStyleDefinitions,
    inheritedStyleValue,
    type LengthValue,
    type StyleDefinition,
    type StylePropertyKey,
    type StyleValue,
} from '../style/style';
import { CodeEditor } from './CodeEditor';
import { CssValueEditor } from './CssValueEditor';

interface ComponentInspectorProps {
    node: BuilderComponentNode | null;
    definition: ComponentDefinition | null;
    onChange: (patch: Partial<BuilderRecord>) => void;
    breakpoint: BuilderBreakpoint;
    onStyleChange: (keyOrPatch: StylePropertyKey | Record<string, StyleValue | undefined>, value?: StyleValue) => void;
    onStyleClear: (key: StylePropertyKey | StylePropertyKey[]) => void;
    onMetadataChange: (patch: Record<string, JsonValue | undefined>) => void;
    onDuplicate: () => void;
    onRemove: () => void;
    onAddChild?: (type: `${string}.${string}`) => void;
    onOpenMediaManager?: (target?: 'image' | 'background') => void;
}

const HANDLED_LAYOUT_KEYS = new Set<string>([
    'display',
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
    'overflow',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'flexWrap',
    'gap',
    'gridTemplateColumns',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'zIndex',
]);

const HANDLED_STYLE_KEYS = new Set<string>([
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textAlign',
    'color',
    'textTransform',
    'textDecoration',
    'borderWidth',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'borderColor',
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
    'boxShadow',
    'dropShadowX',
    'dropShadowY',
    'dropShadowBlur',
    'dropShadowSpread',
    'dropShadowColor',
    'innerShadowX',
    'innerShadowY',
    'innerShadowBlur',
    'innerShadowSpread',
    'innerShadowColor',
    'layerBlur',
    'backgroundBlur',
    'glassRefraction',
    'glassDepth',
    'glassDispersion',
    'glassFrost',
    'glassSplay',
    'glassLightDegree',
    'glassOpacity',
    'filter',
    'backdropFilter',
    'backgroundColor',
    'backgroundType',
    'backgroundGradient',
    'backgroundImage',
    'backgroundVideo',
    'backgroundSize',
    'backgroundPosition',
    'backgroundRepeat',
    'backgroundAttachment',
    'backgroundOrigin',
    'backgroundClip',
    'backgroundBlendMode',
]);

export function ComponentInspector({
    node,
    definition,
    onChange,
    breakpoint,
    onStyleChange,
    onStyleClear,
    onMetadataChange,
    onDuplicate,
    onRemove,
    onAddChild,
    onOpenMediaManager,
}: ComponentInspectorProps) {
    const [inspectorTab, setInspectorTab] = useState<'content' | 'layout' | 'style' | 'more'>('layout');

    if (!node || !definition) {
        return (
            <aside
                className="border-border bg-card text-card-foreground absolute inset-y-14 right-0 z-10 flex w-[340px] shrink-0 items-center justify-center overflow-hidden border-l p-6 shadow-xl lg:static lg:inset-y-auto lg:right-auto lg:z-auto lg:shadow-none"
                aria-label="Design inspector"
            >
                <div className="max-w-56 text-center">
                    <div className="bg-muted text-primary border-primary/20 mx-auto mb-3 flex size-9 items-center justify-center rounded-lg border">
                        <MousePointer2 className="size-4" />
                    </div>
                    <p className="text-[13px] font-semibold">Select an element</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                        Choose an element on the canvas or from Layers to open its design controls.
                    </p>
                </div>
            </aside>
        );
    }

    const styles = getStyleDefinitions(definition);
    const schema = definition.propSchema ?? {};
    const supportsWidthMode = ['layout.row', 'layout.column', 'layout.container'].includes(node.type);
    const usesFullWidthProp = node.type === 'layout.row';
    const supportsAdvancedBackground = definition.styleCapabilities?.includes('backgroundType') === true;
    const maxWidth = inheritedStyleValue(node, definition, breakpoint, 'maxWidth').value;
    const isFullWidth = usesFullWidthProp ? node.props.fullWidth === true : maxWidth === '100%';

    return (
        <aside
            className="border-border bg-card text-card-foreground absolute inset-y-14 right-0 z-10 flex w-[340px] shrink-0 flex-col overflow-hidden border-l shadow-xl lg:static lg:inset-y-auto lg:right-auto lg:z-auto lg:shadow-none"
            aria-label="Design inspector"
        >
            <div className="border-border bg-card flex h-14 items-center justify-between border-b px-4">
                <div className="min-w-0 flex items-center gap-2.5">
                    <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                        {definition.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-foreground truncate text-sm font-semibold tracking-tight">{definition.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition"
                        aria-label="Duplicate element"
                        title="Duplicate"
                        onClick={onDuplicate}
                    >
                        <Copy className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex size-7 items-center justify-center rounded-md transition"
                        aria-label="Delete element"
                        title="Delete"
                        onClick={onRemove}
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </div>
            {supportsWidthMode ? (
                <div className="border-border bg-muted/40 flex items-center justify-between border-b px-4 py-2.5">
                    <div>
                        <p className="text-foreground text-xs font-medium">Width mode</p>
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                            {isFullWidth ? 'Full viewport width' : `${usesFullWidthProp ? '1140px' : '900px'} content width`}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="border-border bg-card hover:bg-muted text-foreground rounded-full border px-3 py-1 text-xs font-medium shadow-xs transition"
                        onClick={() => {
                            if (usesFullWidthProp) {
                                onChange({ fullWidth: !isFullWidth });
                                return;
                            }
                            onStyleChange('maxWidth', isFullWidth ? '900px' : '100%');
                            onStyleChange('margin', isFullWidth ? '0 auto' : '0px');
                        }}
                    >
                        {isFullWidth ? 'Constrain' : 'Full width'}
                    </button>
                </div>
            ) : null}
            {node.type === 'layout.section' && onAddChild ? (
                <div className="border-border bg-muted/20 flex items-center gap-2 border-b px-4 py-2.5">
                    <span className="text-muted-foreground mr-auto text-[10px] font-semibold tracking-[0.14em] uppercase">Section</span>
                    <button
                        type="button"
                        className="border-border bg-card hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium shadow-xs transition"
                        onClick={() => onAddChild('layout.row')}
                    >
                        + Row
                    </button>
                </div>
            ) : null}
            <div className="border-border bg-card flex gap-1 border-b px-3 pt-1">
                {(['content', 'layout', 'style', 'more'] as const)
                    .filter((tab) => tab !== 'content' || Object.keys(schema).length > 0)
                    .map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`flex-1 border-b-2 pt-1 pb-2 text-xs font-medium capitalize transition ${inspectorTab === tab ? 'border-primary text-primary font-semibold' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
                            onClick={() => setInspectorTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {inspectorTab === 'content' && (
                    <div className="space-y-3 p-3">
                        <PropControls
                            nodeType={node.type}
                            schema={schema}
                            values={node.props}
                            onChange={onChange}
                            imageNode={node.type === 'media.image'}
                            onOpenMediaManager={onOpenMediaManager}
                        />
                    </div>
                )}

                {inspectorTab === 'layout' && (
                    <div className="space-y-3 p-3">
                        {styles.some((property) => property.key === 'display') ? (
                            <ResponsiveVisibilityControl
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                            />
                        ) : null}

                        <DimensionsControl
                            node={node}
                            definition={definition}
                            breakpoint={breakpoint}
                            onChange={onStyleChange}
                            onClear={onStyleClear}
                        />

                        <FlexLayoutControl
                            node={node}
                            definition={definition}
                            breakpoint={breakpoint}
                            onChange={onStyleChange}
                            onClear={onStyleClear}
                        />

                        {definition.styleCapabilities?.includes('margin') || definition.styleCapabilities?.includes('padding') ? (
                            <BoxModelControl
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                                margin={definition.styleCapabilities?.includes('margin') === true}
                                padding={definition.styleCapabilities?.includes('padding') === true}
                            />
                        ) : null}

                        <PositionControl
                            node={node}
                            definition={definition}
                            breakpoint={breakpoint}
                            onChange={onStyleChange}
                            onClear={onStyleClear}
                        />

                        {styles
                            .filter(
                                (property) =>
                                    ['layout', 'flex', 'position'].includes(property.group) &&
                                    !HANDLED_LAYOUT_KEYS.has(property.key),
                            )
                            .map((property) => (
                                <div key={property.key} className="border-border/80 bg-card rounded-lg border p-3">
                                    <StyleControl
                                        property={property}
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onStyleChange}
                                        onClear={onStyleClear}
                                    />
                                </div>
                            ))}
                    </div>
                )}

                {inspectorTab === 'style' && (
                    <div className="space-y-3 p-3">
                        <TypographyGroupControl
                            node={node}
                            definition={definition}
                            breakpoint={breakpoint}
                            onChange={onStyleChange}
                            onClear={onStyleClear}
                        />

                        {!supportsAdvancedBackground && definition.styleCapabilities?.includes('backgroundColor') ? (
                            <BackgroundColorControl
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                            />
                        ) : null}

                        {supportsAdvancedBackground ? (
                            <SectionBackgroundControls
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                                onOpenMediaManager={onOpenMediaManager}
                            />
                        ) : null}

                        {definition.styleCapabilities?.includes('borderWidth') ||
                        definition.styleCapabilities?.includes('borderRadius') ? (
                            <BorderGeometryControl
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                                stroke={definition.styleCapabilities?.includes('borderWidth') === true}
                                radius={definition.styleCapabilities?.includes('borderRadius') === true}
                            />
                        ) : null}

                        {definition.styleCapabilities?.includes('boxShadow') ? (
                            <EffectsControl
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onStyleChange}
                                onClear={onStyleClear}
                            />
                        ) : null}

                        {styles
                            .filter(
                                (property) =>
                                    ['background', 'border', 'effects', 'text'].includes(property.group) &&
                                    !HANDLED_STYLE_KEYS.has(property.key),
                            )
                            .map((property) => (
                                <div key={property.key} className="border-border/80 bg-card rounded-lg border p-3">
                                    <StyleControl
                                        property={property}
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onStyleChange}
                                        onClear={onStyleClear}
                                    />
                                </div>
                            ))}
                    </div>
                )}

                {inspectorTab === 'more' ? (
                    <div className="space-y-3 p-3">
                        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
                            <label className="block text-xs font-semibold">
                                CSS classes
                                <input
                                    className="border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 font-mono text-xs outline-none focus:ring-2"
                                    value={typeof node.metadata?.className === 'string' ? node.metadata.className : ''}
                                    placeholder="hero-title text-accent"
                                    onChange={(event) =>
                                        onMetadataChange({ className: event.target.value.trim() === '' ? undefined : event.target.value })
                                    }
                                />
                            </label>
                            <div className="space-y-1.5">
                                <span className="block text-xs font-semibold">Custom CSS</span>
                                <CodeEditor
                                    language="css"
                                    title="Element CSS"
                                    minHeight="160px"
                                    maxHeight="320px"
                                    placeholder={'letter-spacing: 0.05em;\n&:hover {\n  opacity: 0.85;\n}'}
                                    value={typeof node.metadata?.customCss === 'string' ? node.metadata.customCss : ''}
                                    onChange={(next) =>
                                        onMetadataChange({ customCss: next.trim() === '' ? undefined : next })
                                    }
                                />
                            </div>
                            <p className="text-muted-foreground text-[10px] leading-4">
                                Applies to this element only. Wrap nested rules with &apos;&amp;&apos;; add !important to override Style tab values (they are applied as inline styles).
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="border-border hover:bg-muted bg-card inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition shadow-xs"
                                onClick={onDuplicate}
                            >
                                <Copy className="size-3.5" /> Duplicate
                            </button>
                            <button
                                type="button"
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 bg-card inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition shadow-xs"
                                onClick={onRemove}
                            >
                                <Trash2 className="size-3.5" /> Delete
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}

function SectionBackgroundControls({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
    onOpenMediaManager,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
    onOpenMediaManager?: (target?: 'image' | 'background') => void;
}) {
    const type = String(inheritedStyleValue(node, definition, breakpoint, 'backgroundType').value ?? 'solid');
    const gradient = inheritedStyleValue(node, definition, breakpoint, 'backgroundGradient').value;
    const image = inheritedStyleValue(node, definition, breakpoint, 'backgroundImage').value;
    const video = inheritedStyleValue(node, definition, breakpoint, 'backgroundVideo').value;
    const size = inheritedStyleValue(node, definition, breakpoint, 'backgroundSize').value;
    const position = inheritedStyleValue(node, definition, breakpoint, 'backgroundPosition').value;
    const repeat = inheritedStyleValue(node, definition, breakpoint, 'backgroundRepeat').value;
    const attachment = inheritedStyleValue(node, definition, breakpoint, 'backgroundAttachment').value;
    const inputClass =
        'border-input bg-background focus:border-ring focus:ring-ring/20 mt-1.5 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2';

    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium">
                Background type
                <select className={inputClass} value={type} onChange={(event) => onChange('backgroundType', event.target.value)}>
                    <option value="solid">Solid color</option>
                    <option value="gradient">Gradient</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </label>
            <StyleControl
                property={{ key: 'backgroundColor', label: 'Fallback color', group: 'background', type: 'color', responsive: true }}
                node={node}
                definition={definition}
                breakpoint={breakpoint}
                onChange={onChange}
                onClear={onClear}
            />
            {type === 'gradient' ? (
                <label className="block text-xs font-medium">
                    Gradient
                    <input
                        className={inputClass}
                        value={String(gradient ?? 'linear-gradient(135deg, #111827, #10b981)')}
                        onChange={(event) => onChange('backgroundGradient', event.target.value)}
                    />
                </label>
            ) : null}
            {type === 'image' ? (
                <>
                    {onOpenMediaManager ? (
                        <button
                            type="button"
                            className="border-border hover:bg-muted w-full rounded-md border px-3 py-2 text-xs font-medium"
                            onClick={() => onOpenMediaManager('background')}
                        >
                            Choose from media
                        </button>
                    ) : null}
                    <BackgroundUrlField label="Image URL" value={image} property="backgroundImage" inputClass={inputClass} onChange={onChange} />
                </>
            ) : null}
            {type === 'video' ? (
                <BackgroundUrlField label="Video URL" value={video} property="backgroundVideo" inputClass={inputClass} onChange={onChange} />
            ) : null}
            {type !== 'solid' ? (
                <>
                    <label className="block text-xs font-medium">
                        Size
                        <select
                            className={inputClass}
                            value={String(size ?? 'cover')}
                            onChange={(event) => onChange('backgroundSize', event.target.value)}
                        >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                            <option value="100% 100%">Stretch</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium">
                        Position
                        <input
                            className={inputClass}
                            value={String(position ?? 'center')}
                            onChange={(event) => onChange('backgroundPosition', event.target.value)}
                        />
                    </label>
                    <label className="block text-xs font-medium">
                        Repeat
                        <select
                            className={inputClass}
                            value={String(repeat ?? 'no-repeat')}
                            onChange={(event) => onChange('backgroundRepeat', event.target.value)}
                        >
                            <option value="no-repeat">No repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                            <option value="space">Space</option>
                            <option value="round">Round</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium">
                        Attachment
                        <select
                            className={inputClass}
                            value={String(attachment ?? 'scroll')}
                            onChange={(event) => onChange('backgroundAttachment', event.target.value)}
                        >
                            <option value="scroll">Scroll</option>
                            <option value="fixed">Fixed</option>
                            <option value="local">Local</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium">
                        Origin
                        <select
                            className={inputClass}
                            value={String(inheritedStyleValue(node, definition, breakpoint, 'backgroundOrigin').value ?? 'padding-box')}
                            onChange={(event) => onChange('backgroundOrigin', event.target.value)}
                        >
                            <option value="border-box">Border box</option>
                            <option value="padding-box">Padding box</option>
                            <option value="content-box">Content box</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium">
                        Clip
                        <select
                            className={inputClass}
                            value={String(inheritedStyleValue(node, definition, breakpoint, 'backgroundClip').value ?? 'border-box')}
                            onChange={(event) => onChange('backgroundClip', event.target.value)}
                        >
                            <option value="border-box">Border box</option>
                            <option value="padding-box">Padding box</option>
                            <option value="content-box">Content box</option>
                            <option value="text">Text</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium">
                        Blend mode
                        <select
                            className={inputClass}
                            value={String(inheritedStyleValue(node, definition, breakpoint, 'backgroundBlendMode').value ?? 'normal')}
                            onChange={(event) => onChange('backgroundBlendMode', event.target.value)}
                        >
                            {[
                                'normal',
                                'multiply',
                                'screen',
                                'overlay',
                                'darken',
                                'lighten',
                                'color-dodge',
                                'color-burn',
                                'hard-light',
                                'soft-light',
                                'difference',
                                'exclusion',
                                'hue',
                                'saturation',
                                'color',
                                'luminosity',
                            ].map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode.replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                    </label>
                </>
            ) : null}
        </div>
    );
}

type EffectSection = {
    id: string;
    title: string;
    keys: StylePropertyKey[];
    defaults: Partial<Record<StylePropertyKey, StyleValue>>;
    colorKey?: StylePropertyKey;
    fields: { key: StylePropertyKey; label: string; min: number; max: number }[];
};

const DROP_SHADOW_SECTION: EffectSection = {
    id: 'dropShadow',
    title: 'Drop shadow',
    keys: ['dropShadowX', 'dropShadowY', 'dropShadowBlur', 'dropShadowSpread', 'dropShadowColor'],
    defaults: { dropShadowX: 0, dropShadowY: 8, dropShadowBlur: 24, dropShadowSpread: 0 } as Partial<Record<StylePropertyKey, StyleValue>>,
    colorKey: 'dropShadowColor' as StylePropertyKey,
    fields: [
        { key: 'dropShadowX', label: 'X', min: -100, max: 100 },
        { key: 'dropShadowY', label: 'Y', min: -100, max: 100 },
        { key: 'dropShadowBlur', label: 'Blur', min: 0, max: 200 },
        { key: 'dropShadowSpread', label: 'Spread', min: -50, max: 50 },
    ],
};
const INNER_SHADOW_SECTION: EffectSection = {
    id: 'innerShadow',
    title: 'Inner shadow',
    keys: ['innerShadowX', 'innerShadowY', 'innerShadowBlur', 'innerShadowSpread', 'innerShadowColor'],
    defaults: { innerShadowX: 0, innerShadowY: 1, innerShadowBlur: 4, innerShadowSpread: 0 } as Partial<Record<StylePropertyKey, StyleValue>>,
    colorKey: 'innerShadowColor' as StylePropertyKey,
    fields: [
        { key: 'innerShadowX', label: 'X', min: -100, max: 100 },
        { key: 'innerShadowY', label: 'Y', min: -100, max: 100 },
        { key: 'innerShadowBlur', label: 'Blur', min: 0, max: 200 },
        { key: 'innerShadowSpread', label: 'Spread', min: -50, max: 50 },
    ],
};
const LAYER_BLUR_SECTION: EffectSection = {
    id: 'layerBlur',
    title: 'Layer blur',
    keys: ['layerBlur'],
    defaults: { layerBlur: 4 } as Partial<Record<StylePropertyKey, StyleValue>>,
    colorKey: undefined,
    fields: [{ key: 'layerBlur', label: 'Blur', min: 0, max: 100 }],
};
const BACKGROUND_BLUR_SECTION: EffectSection = {
    id: 'backgroundBlur',
    title: 'Background blur',
    keys: ['backgroundBlur'],
    defaults: { backgroundBlur: 8 } as Partial<Record<StylePropertyKey, StyleValue>>,
    colorKey: undefined,
    fields: [{ key: 'backgroundBlur', label: 'Blur', min: 0, max: 100 }],
};
const GLASS_SECTION: EffectSection = {
    id: 'glass',
    title: 'Glass',
    keys: ['glassRefraction', 'glassDepth', 'glassDispersion', 'glassFrost', 'glassSplay', 'glassLightDegree', 'glassOpacity'],
    defaults: {
        glassRefraction: 30,
        glassDepth: 24,
        glassDispersion: 12,
        glassFrost: 40,
        glassSplay: 35,
        glassLightDegree: 135,
        glassOpacity: 16,
    } as Partial<Record<StylePropertyKey, StyleValue>>,
    colorKey: undefined,
    fields: [
        { key: 'glassRefraction', label: 'Refraction', min: 0, max: 100 },
        { key: 'glassDepth', label: 'Depth', min: 0, max: 100 },
        { key: 'glassDispersion', label: 'Dispersion', min: 0, max: 100 },
        { key: 'glassFrost', label: 'Frost', min: 0, max: 100 },
        { key: 'glassSplay', label: 'Splay', min: 0, max: 100 },
        { key: 'glassLightDegree', label: 'Light', min: 0, max: 360 },
        { key: 'glassOpacity', label: 'Opac', min: 0, max: 100 },
    ],
};

const EFFECT_SECTIONS = [DROP_SHADOW_SECTION, INNER_SHADOW_SECTION, LAYER_BLUR_SECTION, BACKGROUND_BLUR_SECTION, GLASS_SECTION];

const ALL_EFFECT_KEYS: StylePropertyKey[] = EFFECT_SECTIONS.flatMap((section) => section.keys);

function EffectsControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (keyOrPatch: StylePropertyKey | Record<string, StyleValue | undefined>, value?: StyleValue) => void;
    onClear: (key: StylePropertyKey | StylePropertyKey[]) => void;
}) {
    const read = (key: StylePropertyKey) => inheritedStyleValue(node, definition, breakpoint, key);

    const hasAnyEffect =
        ALL_EFFECT_KEYS.some((key) => read(key).value !== undefined) ||
        read('boxShadow').value !== undefined ||
        read('filter').value !== undefined ||
        read('backdropFilter').value !== undefined;

    const presets: {
        label: string;
        keys: StylePropertyKey[];
        values: Partial<Record<StylePropertyKey, StyleValue>>;
    }[] = [
        {
            label: 'Soft',
            keys: ['dropShadowX', 'dropShadowY', 'dropShadowBlur', 'dropShadowSpread', 'dropShadowColor'],
            values: {
                dropShadowX: 0,
                dropShadowY: 8,
                dropShadowBlur: 24,
                dropShadowSpread: 0,
                dropShadowColor: 'rgba(0,0,0,0.12)',
            },
        },
        {
            label: 'Lifted',
            keys: ['dropShadowX', 'dropShadowY', 'dropShadowBlur', 'dropShadowSpread', 'dropShadowColor'],
            values: {
                dropShadowX: 0,
                dropShadowY: 20,
                dropShadowBlur: 50,
                dropShadowSpread: -5,
                dropShadowColor: 'rgba(15,23,42,0.25)',
            },
        },
        {
            label: 'Glass',
            keys: [
                'glassRefraction',
                'glassDepth',
                'glassDispersion',
                'glassFrost',
                'glassSplay',
                'glassLightDegree',
                'glassOpacity',
                'backgroundBlur',
            ],
            values: {
                glassRefraction: 30,
                glassDepth: 24,
                glassDispersion: 12,
                glassFrost: 40,
                glassSplay: 35,
                glassLightDegree: 135,
                glassOpacity: 16,
                backgroundBlur: 16,
            },
        },
        {
            label: 'Blur',
            keys: ['layerBlur'],
            values: {
                layerBlur: 4,
            },
        },
    ];

    const isPresetActive = (preset: (typeof presets)[number]) => {
        return Object.entries(preset.values).every(([key, expectedVal]) => {
            const current = read(key as StylePropertyKey).value;
            return current !== undefined && String(current) === String(expectedVal);
        });
    };

    const clearAllEffects = () => {
        onClear([...ALL_EFFECT_KEYS, 'boxShadow', 'filter', 'backdropFilter', 'mixBlendMode', 'opacity']);
    };

    const handlePresetClick = (preset: (typeof presets)[number]) => {
        if (isPresetActive(preset)) {
            // Already active: toggle OFF (unselect!)
            onClear(preset.keys);
        } else {
            // Apply all preset values in ONE atomic call!
            onChange(preset.values);
        }
    };

    const toggleSection = (section: (typeof EFFECT_SECTIONS)[number]) => {
        const active = section.keys.some((key) => read(key).value !== undefined);
        if (active) {
            // Uncheck: clear all keys in section in ONE atomic call!
            onClear(section.keys);
            return;
        }
        // Check: set all default values in ONE atomic call!
        const patch: Record<string, StyleValue> = { ...section.defaults };
        if (section.colorKey) {
            const fallback = section.id === 'dropShadow' ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.35)';
            patch[section.colorKey] = (read(section.colorKey).value as StyleValue | undefined) ?? fallback;
        }
        onChange(patch);
    };

    return (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">Effects</span>
                    {hasAnyEffect ? (
                        <span className="size-1.5 rounded-full bg-primary" title="Effects active" />
                    ) : null}
                </div>
                {hasAnyEffect ? (
                    <button
                        type="button"
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition underline"
                        onClick={clearAllEffects}
                    >
                        Clear all
                    </button>
                ) : null}
            </div>

            {/* Quick Presets with None button */}
            <div className="grid grid-cols-5 gap-1">
                <button
                    type="button"
                    className={`rounded-lg border px-1.5 py-1 text-center text-[11px] font-medium transition ${
                        !hasAnyEffect
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={clearAllEffects}
                    title="No effects"
                >
                    None
                </button>
                {presets.map((preset) => {
                    const active = isPresetActive(preset);
                    return (
                        <button
                            key={preset.label}
                            type="button"
                            className={`rounded-lg border px-1.5 py-1 text-center text-[11px] font-medium transition ${
                                active
                                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                                    : 'border-border/80 text-foreground hover:bg-muted'
                            }`}
                            onClick={() => handlePresetClick(preset)}
                            title={active ? `Click to unselect ${preset.label}` : `Apply ${preset.label}`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Effect Sections */}
            <div className="space-y-2">
                {EFFECT_SECTIONS.map((section) => {
                    const active = section.keys.some((key) => read(key).value !== undefined);
                    return (
                        <div
                            key={section.id}
                            className={`rounded-lg border transition ${
                                active ? 'border-primary/40 bg-muted/20 p-2.5 space-y-2' : 'border-border/60 p-2'
                            }`}
                        >
                            <label className="flex cursor-pointer items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                                    <input
                                        type="checkbox"
                                        className="size-3.5 rounded border-input accent-primary"
                                        checked={active}
                                        onChange={() => toggleSection(section)}
                                    />
                                    {section.title}
                                </span>
                                {active ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onClear(section.keys);
                                        }}
                                        className="text-[10px] text-muted-foreground hover:text-foreground underline"
                                    >
                                        Remove
                                    </button>
                                ) : null}
                            </label>

                            {active ? (
                                <div className="space-y-2 pt-1">
                                    {section.fields.map((field) => {
                                        const raw = read(field.key).value;
                                        const fallback = section.defaults[field.key] ?? field.min;
                                        const value =
                                            typeof raw === 'number'
                                                ? raw
                                                : Number.isFinite(Number(raw)) && raw !== undefined
                                                  ? Number(raw)
                                                  : Number(fallback);
                                        return (
                                            <EffectSlider
                                                key={field.key}
                                                label={field.label}
                                                min={field.min}
                                                max={field.max}
                                                value={value}
                                                onChange={(next) => onChange(field.key, next)}
                                            />
                                        );
                                    })}
                                    {section.colorKey ? (
                                        <ColorValueControl
                                            label="Color"
                                            compact
                                            value={read(section.colorKey).value}
                                            onChange={(value) => onChange(section.colorKey as StylePropertyKey, value)}
                                        />
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EffectSlider({
    label,
    min,
    max,
    value,
    onChange,
}: {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16 shrink-0 text-[10px]">{label}</span>
            <input
                type="range"
                className="accent-primary h-1 min-w-0 flex-1"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
            />
            <input
                type="number"
                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-6 w-12 shrink-0 rounded border px-1 text-[10px] outline-none focus:ring-1"
                min={min}
                max={max}
                value={value}
                onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) onChange(next);
                }}
            />
        </div>
    );
}

function BackgroundUrlField({
    label,
    value,
    property,
    inputClass,
    onChange,
}: {
    label: string;
    value: StyleValue | undefined;
    property: StylePropertyKey;
    inputClass: string;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
}) {
    return (
        <label className="block text-xs font-medium">
            {label}
            <input
                className={inputClass}
                value={String(value ?? '')}
                placeholder="https://..."
                onChange={(event) => onChange(property, event.target.value)}
            />
        </label>
    );
}

function FontFamilyControl({ value, onChange }: { value: StyleValue | undefined; onChange: (value: StyleValue) => void }) {
    const current = String(value ?? 'Inter');
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [recent, setRecent] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(window.localStorage.getItem('helloweb.builder.recentFonts') ?? '[]') as string[];
        } catch {
            return [];
        }
    });
    const normalized = query.trim().toLowerCase();
    const filtered = HELLOWEB_FONT_LIBRARY.filter((font) => !normalized || font.family.toLowerCase().includes(normalized));
    const recentFonts = recent.map((family) => HELLOWEB_FONT_LIBRARY.find((font) => font.family === family)).filter(Boolean);

    const selectFont = (family: string) => {
        const nextRecent = [family, ...recent.filter((item) => item !== family)].slice(0, 5);
        setRecent(nextRecent);
        window.localStorage.setItem('helloweb.builder.recentFonts', JSON.stringify(nextRecent));
        onChange(family);
        setQuery('');
        setOpen(false);
    };

    return (
        <div className="relative mt-1.5">
            <button
                type="button"
                className="border-input bg-background hover:bg-muted flex h-8 w-full items-center justify-between rounded-md border px-2 text-left text-xs"
                onClick={() => setOpen((visible) => !visible)}
            >
                <span style={{ fontFamily: current }}>{current}</span>
                <span className="text-muted-foreground">⌄</span>
            </button>
            {open ? (
                <div className="border-border bg-card absolute top-9 right-0 left-0 z-50 overflow-hidden rounded-md border shadow-xl">
                    <div className="border-border border-b p-1.5">
                        <input
                            autoFocus
                            className="border-input bg-background h-7 w-full rounded border px-2 text-xs outline-none"
                            placeholder="Search fonts..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                        {!normalized && recentFonts.length > 0 ? (
                            <div className="border-border/70 mb-1 border-b pb-1">
                                <p className="text-muted-foreground px-2 py-1 text-[9px] font-bold tracking-wider uppercase">Recently used</p>
                                {recentFonts.map((font) =>
                                    font ? (
                                        <FontOption
                                            key={`recent-${font.family}`}
                                            family={font.family}
                                            selected={current === font.family}
                                            onSelect={selectFont}
                                        />
                                    ) : null,
                                )}
                            </div>
                        ) : null}
                        <p className="text-muted-foreground px-2 py-1 text-[9px] font-bold tracking-wider uppercase">All fonts</p>
                        {filtered.map((font) => (
                            <FontOption key={font.family} family={font.family} selected={current === font.family} onSelect={selectFont} />
                        ))}
                        {filtered.length === 0 ? <p className="text-muted-foreground px-2 py-3 text-center text-xs">No fonts found.</p> : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function FontOption({ family, selected, onSelect }: { family: string; selected: boolean; onSelect: (family: string) => void }) {
    return (
        <button
            type="button"
            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition ${selected ? 'bg-primary/12 text-primary' : 'hover:bg-muted text-foreground'}`}
            onClick={() => onSelect(family)}
        >
            <span style={{ fontFamily: family }}>{family}</span>
            {selected ? <span className="text-[10px]">Selected</span> : null}
        </button>
    );
}

function ResponsiveVisibilityControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const current = inheritedStyleValue(node, definition, breakpoint, 'display');
    const isHidden = current.value === 'none';
    const isOverridden = node.styles[breakpoint]?.display !== undefined;
    const breakpointName = breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1);

    return (
        <div className="border-border/80 bg-card space-y-2.5 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Visibility</span>
                    {isOverridden ? (
                        <button
                            type="button"
                            title="Reset visibility override"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={() => onClear('display')}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>
            <div className="bg-muted/30 flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2.5">
                    <div className={`flex size-7 items-center justify-center rounded-md ${isHidden ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </div>
                    <div>
                        <p className="text-foreground text-xs font-medium">
                            {isHidden ? `Hidden on ${breakpointName}` : `Visible on ${breakpointName}`}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                            {current.inherited ? 'Inherited from desktop' : `Custom override for ${breakpoint}`}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition shadow-xs ${
                        isHidden
                            ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
                            : 'bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20'
                    }`}
                    onClick={() => {
                        if (isHidden) {
                            if (isOverridden) {
                                onClear('display');
                            } else {
                                onChange('display', 'block');
                            }
                        } else {
                            onChange('display', 'none');
                        }
                    }}
                >
                    {isHidden ? 'Hidden' : 'Visible'}
                </button>
            </div>
        </div>
    );
}

function parseDimensionValue(
    value: StyleValue | undefined,
    defaultUnit = 'px',
): { value: number | string; unit: string; isAuto: boolean; isNone: boolean; isEmpty: boolean } {
    if (value === undefined || value === null || value === '') {
        return { value: '', unit: defaultUnit, isAuto: false, isNone: false, isEmpty: true };
    }
    if (value === 'auto') {
        return { value: 'auto', unit: 'auto', isAuto: true, isNone: false, isEmpty: false };
    }
    if (value === 'none') {
        return { value: 'none', unit: 'none', isAuto: false, isNone: true, isEmpty: false };
    }
    if (typeof value === 'object' && value !== null && 'value' in value) {
        return { value: value.value, unit: String(value.unit), isAuto: false, isNone: false, isEmpty: false };
    }
    if (typeof value === 'number') {
        return { value, unit: defaultUnit, isAuto: false, isNone: false, isEmpty: false };
    }
    const match = String(value).trim().match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh|vmin|vmax)?$/);
    if (match) {
        return {
            value: Number(match[1]),
            unit: match[2] || defaultUnit,
            isAuto: false,
            isNone: false,
            isEmpty: false,
        };
    }
    return { value: String(value), unit: defaultUnit, isAuto: false, isNone: false, isEmpty: false };
}

function CompactDimensionInput({
    label,
    propKey,
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
    defaultUnit = 'px',
    placeholder = 'auto',
}: {
    label: string;
    propKey: StylePropertyKey;
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
    defaultUnit?: string;
    placeholder?: string;
}) {
    const inherited = inheritedStyleValue(node, definition, breakpoint, propKey);
    const parsed = parseDimensionValue(inherited.value, defaultUnit);
    const isOverridden = node.styles[breakpoint]?.[propKey] !== undefined;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[10px] font-medium">{label}</span>
                {isOverridden ? (
                    <button
                        type="button"
                        title={`Reset ${label} override`}
                        className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                        onClick={() => onClear(propKey)}
                    >
                        <RotateCcw className="size-2.5" />
                    </button>
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                <div className="relative min-w-0 flex-1">
                    <input
                        type="text"
                        aria-label={label}
                        className={`border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border px-2 text-xs outline-none focus:ring-1 ${
                            isOverridden ? 'border-primary/50 font-medium' : ''
                        }`}
                        placeholder={placeholder}
                        value={parsed.isEmpty ? '' : String(parsed.value)}
                        onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val === '') {
                                onClear(propKey);
                            } else if (val === 'auto' || val === 'none') {
                                onChange(propKey, val);
                            } else {
                                const num = Number(val);
                                if (!isNaN(num)) {
                                    const unit = parsed.unit === 'auto' || parsed.unit === 'none' ? 'px' : parsed.unit;
                                    onChange(propKey, { value: num, unit: unit as LengthValue['unit'] });
                                } else {
                                    onChange(propKey, val);
                                }
                            }
                        }}
                    />
                </div>
                <select
                    aria-label={`${label} unit`}
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-14 shrink-0 rounded border px-1 text-[10px] outline-none focus:ring-1"
                    value={parsed.unit}
                    onChange={(e) => {
                        const newUnit = e.target.value;
                        if (newUnit === 'auto' || newUnit === 'none') {
                            onChange(propKey, newUnit);
                        } else {
                            const num = typeof parsed.value === 'number' ? parsed.value : Number(parsed.value) || 0;
                            onChange(propKey, { value: num, unit: newUnit as LengthValue['unit'] });
                        }
                    }}
                >
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="rem">rem</option>
                    <option value="vw">vw</option>
                    <option value="vh">vh</option>
                    <option value="auto">auto</option>
                </select>
            </div>
        </div>
    );
}

function DimensionsControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const [showConstraints, setShowConstraints] = useState(false);
    const caps = definition.styleCapabilities ?? [];
    const hasWidth = caps.includes('width');
    const hasHeight = caps.includes('height');
    const hasMinWidth = caps.includes('minWidth');
    const hasMaxWidth = caps.includes('maxWidth');
    const hasMinHeight = caps.includes('minHeight');
    const hasMaxHeight = caps.includes('maxHeight');
    const hasOverflow = caps.includes('overflow');

    const hasAnyConstraint = hasMinWidth || hasMaxWidth || hasMinHeight || hasMaxHeight;

    const dimKeys: StylePropertyKey[] = (
        ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'overflow'] as const
    ).filter((k) => caps.includes(k as StylePropertyKey));

    const hasOverride = dimKeys.some((k) => node.styles[breakpoint]?.[k] !== undefined);

    const clearAll = () => {
        dimKeys.forEach((k) => onClear(k));
    };

    if (!hasWidth && !hasHeight && !hasAnyConstraint && !hasOverflow) return null;

    const currentOverflow = inheritedStyleValue(node, definition, breakpoint, 'overflow').value;

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Dimensions</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset dimension overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>

            <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
                {hasWidth || hasHeight ? (
                    <div className="grid grid-cols-2 gap-2">
                        {hasWidth ? (
                            <CompactDimensionInput
                                label="Width (W)"
                                propKey="width"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                        ) : null}
                        {hasHeight ? (
                            <CompactDimensionInput
                                label="Height (H)"
                                propKey="height"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                        ) : null}
                    </div>
                ) : null}

                {hasWidth ? (
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1 text-[10px]">Width:</span>
                        <button
                            type="button"
                            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 rounded border px-1.5 text-[10px] font-medium transition"
                            onClick={() => onChange('width', '100%')}
                        >
                            100%
                        </button>
                        <button
                            type="button"
                            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 rounded border px-1.5 text-[10px] font-medium transition"
                            onClick={() => onChange('width', 'auto')}
                        >
                            Auto
                        </button>
                        <button
                            type="button"
                            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 rounded border px-1.5 text-[10px] font-medium transition"
                            onClick={() => onChange('width', { value: 320, unit: 'px' })}
                        >
                            320px
                        </button>
                        <button
                            type="button"
                            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 rounded border px-1.5 text-[10px] font-medium transition"
                            onClick={() => onChange('width', { value: 640, unit: 'px' })}
                        >
                            640px
                        </button>
                    </div>
                ) : null}

                {hasAnyConstraint ? (
                    <div className="border-border/60 border-t pt-2">
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between text-[11px] font-medium transition"
                            onClick={() => setShowConstraints((prev) => !prev)}
                        >
                            <span>Min / Max Constraints</span>
                            <ChevronDown className={`size-3 transition-transform ${showConstraints ? 'rotate-180' : ''}`} />
                        </button>

                        {showConstraints ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {hasMinWidth ? (
                                    <CompactDimensionInput
                                        label="Min Width"
                                        propKey="minWidth"
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onChange}
                                        onClear={onClear}
                                        defaultUnit="px"
                                        placeholder="0px"
                                    />
                                ) : null}
                                {hasMaxWidth ? (
                                    <CompactDimensionInput
                                        label="Max Width"
                                        propKey="maxWidth"
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onChange}
                                        onClear={onClear}
                                        defaultUnit="px"
                                        placeholder="none"
                                    />
                                ) : null}
                                {hasMinHeight ? (
                                    <CompactDimensionInput
                                        label="Min Height"
                                        propKey="minHeight"
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onChange}
                                        onClear={onClear}
                                        defaultUnit="px"
                                        placeholder="0px"
                                    />
                                ) : null}
                                {hasMaxHeight ? (
                                    <CompactDimensionInput
                                        label="Max Height"
                                        propKey="maxHeight"
                                        node={node}
                                        definition={definition}
                                        breakpoint={breakpoint}
                                        onChange={onChange}
                                        onClear={onClear}
                                        defaultUnit="px"
                                        placeholder="none"
                                    />
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {hasOverflow ? (
                    <div className="border-border/60 flex items-center justify-between border-t pt-2">
                        <span className="text-muted-foreground text-[10px] font-medium">Overflow</span>
                        <select
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 rounded border px-2 text-xs outline-none focus:ring-1"
                            value={String(currentOverflow ?? 'visible')}
                            onChange={(e) => onChange('overflow', e.target.value)}
                        >
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                            <option value="auto">Auto</option>
                            <option value="scroll">Scroll</option>
                        </select>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function FlexLayoutControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const caps = definition.styleCapabilities ?? [];
    const hasDirection = caps.includes('flexDirection');
    const hasAlign = caps.includes('alignItems');
    const hasJustify = caps.includes('justifyContent');
    const hasGap = caps.includes('gap');
    const hasWrap = caps.includes('flexWrap');
    const hasGridCols = caps.includes('gridTemplateColumns');

    if (!hasDirection && !hasAlign && !hasJustify && !hasGap && !hasWrap && !hasGridCols) return null;

    const flexKeys: StylePropertyKey[] = (
        ['flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'gap', 'gridTemplateColumns'] as const
    ).filter((k) => caps.includes(k as StylePropertyKey));

    const hasOverride = flexKeys.some((k) => node.styles[breakpoint]?.[k] !== undefined);

    const currentDirection = String(inheritedStyleValue(node, definition, breakpoint, 'flexDirection').value ?? 'row');
    const currentAlign = String(inheritedStyleValue(node, definition, breakpoint, 'alignItems').value ?? 'stretch');
    const currentJustify = String(inheritedStyleValue(node, definition, breakpoint, 'justifyContent').value ?? 'flex-start');
    const currentWrap = String(inheritedStyleValue(node, definition, breakpoint, 'flexWrap').value ?? 'nowrap');
    const currentGridCols = String(inheritedStyleValue(node, definition, breakpoint, 'gridTemplateColumns').value ?? '');

    const clearAll = () => {
        flexKeys.forEach((k) => onClear(k));
    };

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Alignment & Flow</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset layout overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>

            <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
                {hasDirection ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Direction</span>
                            {node.styles[breakpoint]?.flexDirection !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset direction override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('flexDirection')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                                    currentDirection === 'row'
                                        ? 'border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs'
                                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                onClick={() => onChange('flexDirection', 'row')}
                            >
                                <ArrowRight className="size-3.5" />
                                <span>Horizontal</span>
                            </button>
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                                    currentDirection === 'column'
                                        ? 'border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs'
                                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                onClick={() => onChange('flexDirection', 'column')}
                            >
                                <ArrowDown className="size-3.5" />
                                <span>Vertical</span>
                            </button>
                        </div>
                    </div>
                ) : null}

                {hasAlign ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Align Items</span>
                            {node.styles[breakpoint]?.alignItems !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset align override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('alignItems')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[
                                { value: 'flex-start', label: 'Start' },
                                { value: 'center', label: 'Center' },
                                { value: 'flex-end', label: 'End' },
                                { value: 'stretch', label: 'Stretch' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`rounded border px-1.5 py-1 text-center text-[11px] font-medium transition ${
                                        currentAlign === opt.value
                                            ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => onChange('alignItems', opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {hasJustify ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Justify Content</span>
                            {node.styles[breakpoint]?.justifyContent !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset justify override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('justifyContent')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {[
                                { value: 'flex-start', label: 'Start' },
                                { value: 'center', label: 'Center' },
                                { value: 'flex-end', label: 'End' },
                                { value: 'space-between', label: 'Between' },
                                { value: 'space-around', label: 'Around' },
                                { value: 'space-evenly', label: 'Evenly' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`rounded border px-1 py-1 text-center text-[10px] font-medium transition truncate ${
                                        currentJustify === opt.value
                                            ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => onChange('justifyContent', opt.value)}
                                    title={opt.label}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {hasGap || hasWrap ? (
                    <div className="border-border/60 flex items-center gap-2 border-t pt-2">
                        {hasGap ? (
                            <div className="min-w-0 flex-1">
                                <CompactDimensionInput
                                    label="Gap"
                                    propKey="gap"
                                    node={node}
                                    definition={definition}
                                    breakpoint={breakpoint}
                                    onChange={onChange}
                                    onClear={onClear}
                                    defaultUnit="px"
                                    placeholder="0px"
                                />
                            </div>
                        ) : null}
                        {hasWrap ? (
                            <div className="w-28 shrink-0 space-y-1">
                                <span className="text-muted-foreground block text-[10px] font-medium">Wrap</span>
                                <button
                                    type="button"
                                    className={`flex h-7 w-full items-center justify-center rounded border px-2 text-xs font-medium transition ${
                                        currentWrap === 'wrap'
                                            ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => onChange('flexWrap', currentWrap === 'wrap' ? 'nowrap' : 'wrap')}
                                >
                                    {currentWrap === 'wrap' ? 'Wrap' : 'No wrap'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {hasGridCols ? (
                    <div className="border-border/60 space-y-1 border-t pt-2">
                        <span className="text-muted-foreground block text-[10px] font-medium">Grid Columns</span>
                        <div className="grid grid-cols-4 gap-1">
                            {[
                                { value: '1fr', label: '1 Col' },
                                { value: 'repeat(2, minmax(0, 1fr))', label: '2 Cols' },
                                { value: 'repeat(3, minmax(0, 1fr))', label: '3 Cols' },
                                { value: 'repeat(4, minmax(0, 1fr))', label: '4 Cols' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`rounded border px-1 py-1 text-center text-[10px] font-medium transition ${
                                        currentGridCols === opt.value
                                            ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => onChange('gridTemplateColumns', opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function PositionControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const caps = definition.styleCapabilities ?? [];
    if (!caps.includes('position')) return null;

    const posKeys: StylePropertyKey[] = (
        ['position', 'top', 'right', 'bottom', 'left', 'zIndex'] as const
    ).filter((k) => caps.includes(k as StylePropertyKey));
    const hasOverride = posKeys.some((k) => node.styles[breakpoint]?.[k] !== undefined);
    const currentPosition = String(inheritedStyleValue(node, definition, breakpoint, 'position').value ?? 'static');

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Position</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset position overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={() => posKeys.forEach((k) => onClear(k))}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>

            <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[10px] font-medium">Type</span>
                    <select
                        className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 rounded border px-2 text-xs outline-none focus:ring-1"
                        value={currentPosition}
                        onChange={(e) => onChange('position', e.target.value)}
                    >
                        <option value="static">Static</option>
                        <option value="relative">Relative</option>
                        <option value="absolute">Absolute</option>
                        <option value="fixed">Fixed</option>
                        <option value="sticky">Sticky</option>
                    </select>
                </div>

                {currentPosition !== 'static' ? (
                    <div className="border-border/60 space-y-2 border-t pt-2">
                        <div className="grid grid-cols-2 gap-2">
                            <CompactDimensionInput
                                label="Top"
                                propKey="top"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                            <CompactDimensionInput
                                label="Right"
                                propKey="right"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                            <CompactDimensionInput
                                label="Bottom"
                                propKey="bottom"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                            <CompactDimensionInput
                                label="Left"
                                propKey="left"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="auto"
                            />
                        </div>
                        {caps.includes('zIndex') ? (
                            <div className="flex items-center justify-between border-border/40 border-t pt-1.5">
                                <span className="text-muted-foreground text-[10px] font-medium">Z-Index</span>
                                <input
                                    type="number"
                                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-20 rounded border px-2 text-right text-xs outline-none focus:ring-1"
                                    placeholder="auto"
                                    value={String(inheritedStyleValue(node, definition, breakpoint, 'zIndex').value ?? '')}
                                    onChange={(e) => {
                                        const v = e.target.value.trim();
                                        if (v === '') onClear('zIndex');
                                        else onChange('zIndex', Number(v));
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function TypographyGroupControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const caps = definition.styleCapabilities ?? [];
    const hasFontFamily = caps.includes('fontFamily');
    const hasFontSize = caps.includes('fontSize');
    const hasFontWeight = caps.includes('fontWeight');
    const hasLineHeight = caps.includes('lineHeight');
    const hasLetterSpacing = caps.includes('letterSpacing');
    const hasTextAlign = caps.includes('textAlign');
    const hasColor = caps.includes('color');
    const hasTransform = caps.includes('textTransform');
    const hasDecoration = caps.includes('textDecoration');

    const hasAnyTypography =
        hasFontFamily ||
        hasFontSize ||
        hasFontWeight ||
        hasLineHeight ||
        hasLetterSpacing ||
        hasTextAlign ||
        hasColor ||
        hasTransform ||
        hasDecoration;

    if (!hasAnyTypography) return null;

    const textKeys: StylePropertyKey[] = (
        [
            'fontFamily',
            'fontSize',
            'fontWeight',
            'lineHeight',
            'letterSpacing',
            'textAlign',
            'color',
            'textTransform',
            'textDecoration',
        ] as const
    ).filter((k) => caps.includes(k as StylePropertyKey));

    const hasOverride = textKeys.some((k) => node.styles[breakpoint]?.[k] !== undefined);

    const clearAll = () => {
        textKeys.forEach((k) => onClear(k));
    };

    const currentFamily = inheritedStyleValue(node, definition, breakpoint, 'fontFamily').value;
    const currentWeight = inheritedStyleValue(node, definition, breakpoint, 'fontWeight').value;
    const currentLineHeight = inheritedStyleValue(node, definition, breakpoint, 'lineHeight').value;
    const currentTextAlign = String(inheritedStyleValue(node, definition, breakpoint, 'textAlign').value ?? 'left');
    const currentColor = inheritedStyleValue(node, definition, breakpoint, 'color').value;
    const currentTransform = String(inheritedStyleValue(node, definition, breakpoint, 'textTransform').value ?? 'none');
    const currentDecoration = String(inheritedStyleValue(node, definition, breakpoint, 'textDecoration').value ?? 'none');

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Typography</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset typography overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>

            <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
                {hasFontFamily ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Font Family</span>
                            {node.styles[breakpoint]?.fontFamily !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset font family override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('fontFamily')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <FontFamilyControl value={currentFamily} onChange={(val) => onChange('fontFamily', val)} />
                    </div>
                ) : null}

                {hasFontSize || hasFontWeight ? (
                    <div className="grid grid-cols-2 gap-2">
                        {hasFontSize ? (
                            <CompactDimensionInput
                                label="Size"
                                propKey="fontSize"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="16px"
                            />
                        ) : null}
                        {hasFontWeight ? (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-[10px] font-medium">Weight</span>
                                    {node.styles[breakpoint]?.fontWeight !== undefined ? (
                                        <button
                                            type="button"
                                            title="Reset font weight override"
                                            className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                            onClick={() => onClear('fontWeight')}
                                        >
                                            <RotateCcw className="size-2.5" />
                                        </button>
                                    ) : null}
                                </div>
                                <select
                                    aria-label="Font weight"
                                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border px-2 text-xs outline-none focus:ring-1"
                                    value={String(currentWeight ?? 400)}
                                    onChange={(e) => onChange('fontWeight', Number(e.target.value))}
                                >
                                    {HELLOWEB_FONT_WEIGHT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {hasFontSize ? (
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1 text-[10px]">Presets:</span>
                        {[14, 16, 20, 24, 32, 48].map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 rounded border px-1.5 text-[10px] font-medium transition"
                                onClick={() => onChange('fontSize', { value: s, unit: 'px' })}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                ) : null}

                {hasLineHeight || hasLetterSpacing ? (
                    <div className="grid grid-cols-2 gap-2">
                        {hasLineHeight ? (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-[10px] font-medium">Line Height</span>
                                    {node.styles[breakpoint]?.lineHeight !== undefined ? (
                                        <button
                                            type="button"
                                            title="Reset line height override"
                                            className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                            onClick={() => onClear('lineHeight')}
                                        >
                                            <RotateCcw className="size-2.5" />
                                        </button>
                                    ) : null}
                                </div>
                                <input
                                    type="text"
                                    aria-label="Line height"
                                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border px-2 text-xs outline-none focus:ring-1"
                                    placeholder="1.5"
                                    value={currentLineHeight !== undefined ? String(currentLineHeight) : ''}
                                    onChange={(e) => {
                                        const val = e.target.value.trim();
                                        if (val === '') onClear('lineHeight');
                                        else {
                                            const num = Number(val);
                                            onChange('lineHeight', !isNaN(num) ? num : val);
                                        }
                                    }}
                                />
                            </div>
                        ) : null}
                        {hasLetterSpacing ? (
                            <CompactDimensionInput
                                label="Letter Spacing"
                                propKey="letterSpacing"
                                node={node}
                                definition={definition}
                                breakpoint={breakpoint}
                                onChange={onChange}
                                onClear={onClear}
                                defaultUnit="px"
                                placeholder="0px"
                            />
                        ) : null}
                    </div>
                ) : null}

                {hasTextAlign ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Alignment</span>
                            {node.styles[breakpoint]?.textAlign !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset text align override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('textAlign')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[
                                { value: 'left', label: 'Left', icon: AlignLeft },
                                { value: 'center', label: 'Center', icon: AlignCenter },
                                { value: 'right', label: 'Right', icon: AlignRight },
                                { value: 'justify', label: 'Justify', icon: AlignJustify },
                            ].map((opt) => {
                                const Icon = opt.icon;
                                const active = currentTextAlign === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        aria-label={`Align ${opt.label}`}
                                        title={`Align ${opt.label}`}
                                        className={`flex h-7 items-center justify-center rounded border transition ${
                                            active
                                                ? 'border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs'
                                                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                        onClick={() => onChange('textAlign', opt.value)}
                                    >
                                        <Icon className="size-3.5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                {hasColor ? (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[10px] font-medium">Text Color</span>
                            {node.styles[breakpoint]?.color !== undefined ? (
                                <button
                                    type="button"
                                    title="Reset text color override"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                    onClick={() => onClear('color')}
                                >
                                    <RotateCcw className="size-2.5" />
                                </button>
                            ) : null}
                        </div>
                        <ColorValueControl
                            label="Text Color"
                            compact
                            value={currentColor}
                            onChange={(val) => onChange('color', val)}
                        />
                    </div>
                ) : null}

                {hasTransform || hasDecoration ? (
                    <div className="border-border/60 flex items-center gap-2 border-t pt-2">
                        {hasTransform ? (
                            <div className="min-w-0 flex-1 space-y-1">
                                <span className="text-muted-foreground text-[10px] font-medium">Transform</span>
                                <div className="flex gap-1">
                                    {[
                                        { value: 'none', label: 'Aa' },
                                        { value: 'uppercase', label: 'TT' },
                                        { value: 'capitalize', label: 'Abc' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`flex-1 rounded border py-1 text-center text-[10px] font-medium transition ${
                                                currentTransform === opt.value
                                                    ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                            onClick={() => onChange('textTransform', opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {hasDecoration ? (
                            <div className="min-w-0 flex-1 space-y-1">
                                <span className="text-muted-foreground text-[10px] font-medium">Decoration</span>
                                <div className="flex gap-1">
                                    {[
                                        { value: 'none', label: 'None' },
                                        { value: 'underline', label: 'U', isUnderline: true },
                                        { value: 'line-through', label: 'S', isStrike: true },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`flex-1 rounded border py-1 text-center text-[10px] font-medium transition ${
                                                currentDecoration === opt.value
                                                    ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                            } ${opt.isStrike ? 'line-through' : ''}`}
                                            onClick={() => onChange('textDecoration', opt.value)}
                                            title={`Decoration: ${opt.value}`}
                                        >
                                            {opt.isUnderline ? <Underline className="mx-auto size-3" /> : opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function BackgroundColorControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const isOverridden = node.styles[breakpoint]?.backgroundColor !== undefined;
    const current = inheritedStyleValue(node, definition, breakpoint, 'backgroundColor');

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-semibold">Background</span>
                    {isOverridden ? (
                        <button
                            type="button"
                            title="Reset background color override"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={() => onClear('backgroundColor')}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>
            <div className="bg-muted/30 rounded-md border p-2.5">
                <ColorValueControl
                    label="Background Color"
                    value={current.value}
                    onChange={(value) => onChange('backgroundColor', value)}
                />
            </div>
        </div>
    );
}

function BoxModelControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
    margin,
    padding,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
    margin: boolean;
    padding: boolean;
}) {
    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-semibold">Spacing</span>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>
            {margin ? (
                <BoxModelGroup
                    label="Margin"
                    property="margin"
                    node={node}
                    definition={definition}
                    breakpoint={breakpoint}
                    onChange={onChange}
                    onClear={onClear}
                />
            ) : null}
            {padding ? (
                <BoxModelGroup
                    label="Padding"
                    property="padding"
                    node={node}
                    definition={definition}
                    breakpoint={breakpoint}
                    onChange={onChange}
                    onClear={onClear}
                />
            ) : null}
        </div>
    );
}

function BoxModelGroup({
    label,
    property,
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    label: 'Margin' | 'Padding';
    property: 'margin' | 'padding';
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const values = Object.fromEntries(sides.map((side) => [side, boxSideValue(node, definition, breakpoint, property, side)])) as Record<
        (typeof sides)[number],
        { value: StyleValue | undefined; inherited: boolean }
    >;

    const parsedValues = {
        Top: parseCompactBoxValue(values.Top.value, property === 'margin'),
        Right: parseCompactBoxValue(values.Right.value, property === 'margin'),
        Bottom: parseCompactBoxValue(values.Bottom.value, property === 'margin'),
        Left: parseCompactBoxValue(values.Left.value, property === 'margin'),
    };

    const hasAnyValue = sides.some((side) => values[side].value !== undefined);
    const hasOverride =
        sides.some((side) => node.styles[breakpoint]?.[`${property}${side}` as StylePropertyKey] !== undefined) ||
        node.styles[breakpoint]?.[property] !== undefined;

    const areSidesEqual =
        parsedValues.Top.value === parsedValues.Right.value &&
        parsedValues.Top.value === parsedValues.Bottom.value &&
        parsedValues.Top.value === parsedValues.Left.value &&
        parsedValues.Top.unit === parsedValues.Right.unit &&
        parsedValues.Top.unit === parsedValues.Bottom.unit &&
        parsedValues.Top.unit === parsedValues.Left.unit;

    const [linked, setLinked] = useState<boolean>(true);

    const setAllSides = (val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto') => {
        const styleVal: StyleValue = unit === 'auto' ? 'auto' : { value: typeof val === 'number' ? val : Number(val) || 0, unit };
        sides.forEach((side) => onChange(`${property}${side}` as StylePropertyKey, styleVal));
    };

    const setSide = (side: (typeof sides)[number], val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto') => {
        const styleVal: StyleValue = unit === 'auto' ? 'auto' : { value: typeof val === 'number' ? val : Number(val) || 0, unit };
        onChange(`${property}${side}` as StylePropertyKey, styleVal);
    };

    const clearAll = () => {
        sides.forEach((side) => onClear(`${property}${side}` as StylePropertyKey));
        onClear(property);
    };

    const quickPresets = property === 'margin' ? [0, 8, 16, 24, 32] : [0, 8, 12, 16, 24];

    return (
        <div className="bg-muted/30 space-y-2 rounded-md border p-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-medium">{label}</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title={`Reset ${label.toLowerCase()} overrides`}
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <div className="flex items-center gap-1">
                    {property === 'margin' ? (
                        <button
                            type="button"
                            title="Center horizontally (margin: 0 auto)"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded px-1.5 py-0.5 text-[10px] font-medium transition"
                            onClick={() => {
                                onChange('marginTop', { value: 0, unit: 'px' });
                                onChange('marginBottom', { value: 0, unit: 'px' });
                                onChange('marginLeft', 'auto');
                                onChange('marginRight', 'auto');
                            }}
                        >
                            Center
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                            linked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title={linked ? 'All sides linked' : 'Individual sides'}
                        onClick={() => setLinked((prev) => !prev)}
                    >
                        {linked ? <Link2 className="size-3" /> : <Unlink2 className="size-3" />}
                        <span>{linked ? 'Linked' : 'Sides'}</span>
                    </button>
                </div>
            </div>

            {linked ? (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-medium">
                                All
                            </span>
                            <input
                                type="text"
                                aria-label={`${label} all sides`}
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded-md border pr-2 pl-8 text-right text-xs outline-none focus:ring-1"
                                placeholder={areSidesEqual ? (hasAnyValue ? String(parsedValues.Top.value) : '0') : 'Mixed'}
                                value={areSidesEqual && hasAnyValue ? String(parsedValues.Top.value) : ''}
                                onChange={(e) => {
                                    const val = e.target.value.trim();
                                    if (val === 'auto' && property === 'margin') {
                                        setAllSides('auto', 'auto');
                                    } else if (val === '') {
                                        clearAll();
                                    } else {
                                        const num = Number(val);
                                        if (!isNaN(num)) {
                                            setAllSides(num, parsedValues.Top.unit === 'auto' ? 'px' : parsedValues.Top.unit);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <select
                            aria-label={`${label} unit`}
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-16 shrink-0 rounded-md border px-1 text-[11px] outline-none focus:ring-1"
                            value={parsedValues.Top.unit}
                            onChange={(e) => {
                                const newUnit = e.target.value as 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto';
                                const numVal = typeof parsedValues.Top.value === 'number' ? parsedValues.Top.value : 0;
                                setAllSides(newUnit === 'auto' ? 'auto' : numVal, newUnit);
                            }}
                        >
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                            {property === 'margin' ? <option value="auto">auto</option> : null}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1 text-[10px]">Presets:</span>
                        {quickPresets.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 min-w-5 rounded border px-1 text-[10px] font-medium transition"
                                onClick={() => setAllSides(preset, parsedValues.Top.unit === 'auto' ? 'px' : parsedValues.Top.unit)}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                        {sides.map((side) => {
                            const current = values[side];
                            const parsed = parsedValues[side];
                            const isOverridden = node.styles[breakpoint]?.[`${property}${side}` as StylePropertyKey] !== undefined;
                            return (
                                <div key={side} className="space-y-0.5">
                                    <div className="relative">
                                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-1.5 -translate-y-1/2 text-[10px] font-semibold select-none">
                                            {side[0]}
                                        </span>
                                        <input
                                            type="text"
                                            aria-label={`${label} ${side}`}
                                            title={`${side}: ${current.value !== undefined ? String(current.value) : '0'}${current.inherited ? ' (inherited)' : ''}`}
                                            className={`border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border pr-1 pl-4 text-right text-xs outline-none focus:ring-1 ${
                                                isOverridden ? 'border-primary/50 font-medium' : ''
                                            }`}
                                            placeholder={current.value !== undefined ? String(parsed.value) : '0'}
                                            value={current.value !== undefined ? String(parsed.value) : ''}
                                            onChange={(e) => {
                                                const val = e.target.value.trim();
                                                if (val === 'auto' && property === 'margin') {
                                                    setSide(side, 'auto', 'auto');
                                                } else if (val === '') {
                                                    onClear(`${property}${side}` as StylePropertyKey);
                                                } else {
                                                    const num = Number(val);
                                                    if (!isNaN(num)) {
                                                        setSide(side, num, parsed.unit === 'auto' ? 'px' : parsed.unit);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground block text-center text-[9px]">
                                        {side === 'Top' ? 'Top' : side === 'Right' ? 'Right' : side === 'Bottom' ? 'Bottom' : 'Left'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                        <span className="text-muted-foreground text-[10px]">Unit</span>
                        <select
                            aria-label={`${label} unit for all sides`}
                            className="border-input bg-background h-6 rounded border px-1 text-[10px] outline-none"
                            value={parsedValues.Top.unit}
                            onChange={(e) => {
                                const newUnit = e.target.value as 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto';
                                sides.forEach((side) => {
                                    const currentVal = typeof parsedValues[side].value === 'number' ? parsedValues[side].value : 0;
                                    setSide(side, newUnit === 'auto' ? 'auto' : currentVal, newUnit);
                                });
                            }}
                        >
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                            <option value="%">%</option>
                            <option value="em">em</option>
                            <option value="vw">vw</option>
                            <option value="vh">vh</option>
                            {property === 'margin' ? <option value="auto">auto</option> : null}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

function BorderGeometryControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
    stroke,
    radius,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
    stroke: boolean;
    radius: boolean;
}) {
    const supportsColor = definition.styleCapabilities?.includes('borderColor') === true;
    const supportsStyle = definition.styleCapabilities?.includes('borderStyle') === true;

    return (
        <div className="border-border/80 bg-card space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-semibold">Border & Stroke</span>
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">{breakpoint}</span>
            </div>

            {stroke ? (
                <StrokeControl
                    node={node}
                    definition={definition}
                    breakpoint={breakpoint}
                    onChange={onChange}
                    onClear={onClear}
                    supportsColor={supportsColor}
                    supportsStyle={supportsStyle}
                />
            ) : null}

            {radius ? (
                <CornerRadiusControl node={node} definition={definition} breakpoint={breakpoint} onChange={onChange} onClear={onClear} />
            ) : null}
        </div>
    );
}

function StrokeControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
    supportsColor,
    supportsStyle,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
    supportsColor: boolean;
    supportsStyle: boolean;
}) {
    const strokeSides: readonly [string, StylePropertyKey][] = [
        ['Top', 'borderTopWidth'],
        ['Right', 'borderRightWidth'],
        ['Bottom', 'borderBottomWidth'],
        ['Left', 'borderLeftWidth'],
    ];

    const values = Object.fromEntries(
        strokeSides.map(([side, key]) => [side, borderSideValue(node, definition, breakpoint, 'borderWidth', key)]),
    ) as Record<string, { value: StyleValue | undefined; inherited: boolean }>;

    const parsedValues = {
        Top: parseCompactBoxValue(values.Top.value, false),
        Right: parseCompactBoxValue(values.Right.value, false),
        Bottom: parseCompactBoxValue(values.Bottom.value, false),
        Left: parseCompactBoxValue(values.Left.value, false),
    };

    const hasAnyValue = strokeSides.some(([side]) => values[side].value !== undefined);
    const hasOverride =
        strokeSides.some(([, key]) => node.styles[breakpoint]?.[key] !== undefined) || node.styles[breakpoint]?.borderWidth !== undefined;

    const areSidesEqual =
        parsedValues.Top.value === parsedValues.Right.value &&
        parsedValues.Top.value === parsedValues.Bottom.value &&
        parsedValues.Top.value === parsedValues.Left.value &&
        parsedValues.Top.unit === parsedValues.Right.unit &&
        parsedValues.Top.unit === parsedValues.Bottom.unit &&
        parsedValues.Top.unit === parsedValues.Left.unit;

    const [linked, setLinked] = useState<boolean>(true);

    const setAllSides = (val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh') => {
        const num = typeof val === 'number' ? val : Number(val) || 0;
        const styleVal: StyleValue = { value: num, unit };
        strokeSides.forEach(([, key]) => onChange(key, styleVal));
        if (supportsStyle && num > 0) {
            const currentStyle = inheritedStyleValue(node, definition, breakpoint, 'borderStyle').value;
            if (!currentStyle || currentStyle === 'none') {
                onChange('borderStyle', 'solid');
            }
        }
    };

    const setSide = (key: StylePropertyKey, val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh') => {
        const num = typeof val === 'number' ? val : Number(val) || 0;
        onChange(key, { value: num, unit });
        if (supportsStyle && num > 0) {
            const currentStyle = inheritedStyleValue(node, definition, breakpoint, 'borderStyle').value;
            if (!currentStyle || currentStyle === 'none') {
                onChange('borderStyle', 'solid');
            }
        }
    };

    const clearAll = () => {
        strokeSides.forEach(([, key]) => onClear(key));
        onClear('borderWidth');
    };

    const currentStyle = inheritedStyleValue(node, definition, breakpoint, 'borderStyle').value;
    const currentColor = inheritedStyleValue(node, definition, breakpoint, 'borderColor').value;

    return (
        <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-medium">Stroke</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset stroke overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                        linked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={linked ? 'All borders linked' : 'Individual border sides'}
                    onClick={() => setLinked((prev) => !prev)}
                >
                    {linked ? <Link2 className="size-3" /> : <Unlink2 className="size-3" />}
                    <span>{linked ? 'Linked' : 'Sides'}</span>
                </button>
            </div>

            {linked ? (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-medium">
                                Width
                            </span>
                            <input
                                type="text"
                                aria-label="Stroke width"
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded-md border pr-2 pl-12 text-right text-xs outline-none focus:ring-1"
                                placeholder={areSidesEqual ? (hasAnyValue ? String(parsedValues.Top.value) : '0') : 'Mixed'}
                                value={areSidesEqual && hasAnyValue ? String(parsedValues.Top.value) : ''}
                                onChange={(e) => {
                                    const val = e.target.value.trim();
                                    if (val === '') {
                                        clearAll();
                                    } else {
                                        const num = Number(val);
                                        if (!isNaN(num)) {
                                            setAllSides(num, parsedValues.Top.unit === 'auto' ? 'px' : parsedValues.Top.unit);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <select
                            aria-label="Stroke unit"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-16 shrink-0 rounded-md border px-1 text-[11px] outline-none focus:ring-1"
                            value={parsedValues.Top.unit === 'auto' ? 'px' : parsedValues.Top.unit}
                            onChange={(e) => {
                                const newUnit = e.target.value as 'px' | '%' | 'rem';
                                const numVal = typeof parsedValues.Top.value === 'number' ? parsedValues.Top.value : 0;
                                setAllSides(numVal, newUnit);
                            }}
                        >
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1 text-[10px]">Presets:</span>
                        {[0, 1, 2, 4].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 min-w-5 rounded border px-1 text-[10px] font-medium transition"
                                onClick={() => setAllSides(preset, parsedValues.Top.unit === 'auto' ? 'px' : parsedValues.Top.unit)}
                            >
                                {preset}px
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                        {strokeSides.map(([side, key]) => {
                            const current = values[side];
                            const parsed = parsedValues[side as keyof typeof parsedValues];
                            const isOverridden = node.styles[breakpoint]?.[key] !== undefined;
                            return (
                                <div key={side} className="space-y-0.5">
                                    <div className="relative">
                                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-1.5 -translate-y-1/2 text-[10px] font-semibold select-none">
                                            {side[0]}
                                        </span>
                                        <input
                                            type="text"
                                            aria-label={`Border ${side} width`}
                                            title={`${side}: ${current.value !== undefined ? String(current.value) : '0'}`}
                                            className={`border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border pr-1 pl-4 text-right text-xs outline-none focus:ring-1 ${
                                                isOverridden ? 'border-primary/50 font-medium' : ''
                                            }`}
                                            placeholder={current.value !== undefined ? String(parsed.value) : '0'}
                                            value={current.value !== undefined ? String(parsed.value) : ''}
                                            onChange={(e) => {
                                                const val = e.target.value.trim();
                                                if (val === '') {
                                                    onClear(key);
                                                } else {
                                                    const num = Number(val);
                                                    if (!isNaN(num)) {
                                                        setSide(key, num, parsed.unit === 'auto' ? 'px' : parsed.unit);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground block text-center text-[9px]">{side}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {supportsStyle || supportsColor ? (
                <div className="border-border/60 flex items-center gap-2 border-t pt-2">
                    {supportsStyle ? (
                        <div className="min-w-0 flex-1">
                            <span className="text-muted-foreground mb-1 block text-[10px] font-medium">Style</span>
                            <select
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border px-1.5 text-xs outline-none focus:ring-1"
                                value={String(currentStyle ?? 'none')}
                                onChange={(e) => onChange('borderStyle', e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                            </select>
                        </div>
                    ) : null}
                    {supportsColor ? (
                        <div className="min-w-0 flex-1">
                            <span className="text-muted-foreground mb-1 block text-[10px] font-medium">Color</span>
                            <ColorValueControl
                                label="Color"
                                compact
                                value={currentColor}
                                onChange={(value) => onChange('borderColor', value)}
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function CornerRadiusControl({
    node,
    definition,
    breakpoint,
    onChange,
    onClear,
}: {
    node: BuilderComponentNode;
    definition: ComponentDefinition;
    breakpoint: BuilderBreakpoint;
    onChange: (key: StylePropertyKey, value: StyleValue) => void;
    onClear: (key: StylePropertyKey) => void;
}) {
    const radiusCorners: readonly [string, string, StylePropertyKey][] = [
        ['Top-Left', 'TL', 'borderTopLeftRadius'],
        ['Top-Right', 'TR', 'borderTopRightRadius'],
        ['Bottom-Right', 'BR', 'borderBottomRightRadius'],
        ['Bottom-Left', 'BL', 'borderBottomLeftRadius'],
    ];

    const values = Object.fromEntries(
        radiusCorners.map(([, code, key]) => [code, borderSideValue(node, definition, breakpoint, 'borderRadius', key)]),
    ) as Record<string, { value: StyleValue | undefined; inherited: boolean }>;

    const parsedValues = {
        TL: parseCompactBoxValue(values.TL.value, false),
        TR: parseCompactBoxValue(values.TR.value, false),
        BR: parseCompactBoxValue(values.BR.value, false),
        BL: parseCompactBoxValue(values.BL.value, false),
    };

    const hasAnyValue = radiusCorners.some(([, code]) => values[code].value !== undefined);
    const hasOverride =
        radiusCorners.some(([, , key]) => node.styles[breakpoint]?.[key] !== undefined) || node.styles[breakpoint]?.borderRadius !== undefined;

    const areSidesEqual =
        parsedValues.TL.value === parsedValues.TR.value &&
        parsedValues.TL.value === parsedValues.BR.value &&
        parsedValues.TL.value === parsedValues.BL.value &&
        parsedValues.TL.unit === parsedValues.TR.unit &&
        parsedValues.TL.unit === parsedValues.BR.unit &&
        parsedValues.TL.unit === parsedValues.BL.unit;

    const [linked, setLinked] = useState<boolean>(true);

    const setAllCorners = (val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh') => {
        const num = typeof val === 'number' ? val : Number(val) || 0;
        const styleVal: StyleValue = { value: num, unit };
        radiusCorners.forEach(([, , key]) => onChange(key, styleVal));
    };

    const setCorner = (key: StylePropertyKey, val: number | string, unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh') => {
        const num = typeof val === 'number' ? val : Number(val) || 0;
        onChange(key, { value: num, unit });
    };

    const clearAll = () => {
        radiusCorners.forEach(([, , key]) => onClear(key));
        onClear('borderRadius');
    };

    return (
        <div className="bg-muted/30 space-y-2.5 rounded-md border p-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-xs font-medium">Corner Radius</span>
                    {hasOverride ? (
                        <button
                            type="button"
                            title="Reset corner radius overrides"
                            className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center transition"
                            onClick={clearAll}
                        >
                            <RotateCcw className="size-3" />
                        </button>
                    ) : null}
                </div>
                <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                        linked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={linked ? 'All corners linked' : 'Individual corners'}
                    onClick={() => setLinked((prev) => !prev)}
                >
                    {linked ? <Link2 className="size-3" /> : <Unlink2 className="size-3" />}
                    <span>{linked ? 'Linked' : 'Corners'}</span>
                </button>
            </div>

            {linked ? (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-medium">
                                Radius
                            </span>
                            <input
                                type="text"
                                aria-label="Corner radius"
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded-md border pr-2 pl-14 text-right text-xs outline-none focus:ring-1"
                                placeholder={areSidesEqual ? (hasAnyValue ? String(parsedValues.TL.value) : '0') : 'Mixed'}
                                value={areSidesEqual && hasAnyValue ? String(parsedValues.TL.value) : ''}
                                onChange={(e) => {
                                    const val = e.target.value.trim();
                                    if (val === '') {
                                        clearAll();
                                    } else {
                                        const num = Number(val);
                                        if (!isNaN(num)) {
                                            setAllCorners(num, parsedValues.TL.unit === 'auto' ? 'px' : parsedValues.TL.unit);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <select
                            aria-label="Radius unit"
                            className="border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-16 shrink-0 rounded-md border px-1 text-[11px] outline-none focus:ring-1"
                            value={parsedValues.TL.unit === 'auto' ? 'px' : parsedValues.TL.unit}
                            onChange={(e) => {
                                const newUnit = e.target.value as 'px' | '%' | 'rem';
                                const numVal = typeof parsedValues.TL.value === 'number' ? parsedValues.TL.value : 0;
                                setAllCorners(numVal, newUnit);
                            }}
                        >
                            <option value="px">px</option>
                            <option value="rem">rem</option>
                            <option value="%">%</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1 text-[10px]">Presets:</span>
                        {[0, 4, 8, 16, 9999].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className="border-border hover:bg-muted text-muted-foreground hover:text-foreground h-5 min-w-5 rounded border px-1 text-[10px] font-medium transition"
                                onClick={() => setAllCorners(preset, parsedValues.TL.unit === 'auto' ? 'px' : parsedValues.TL.unit)}
                            >
                                {preset === 9999 ? 'Pill' : `${preset}px`}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                        {radiusCorners.map(([name, code, key]) => {
                            const current = values[code];
                            const parsed = parsedValues[code as keyof typeof parsedValues];
                            const isOverridden = node.styles[breakpoint]?.[key] !== undefined;
                            return (
                                <div key={code} className="space-y-0.5">
                                    <div className="relative">
                                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-semibold select-none">
                                            {code}
                                        </span>
                                        <input
                                            type="text"
                                            aria-label={`${name} radius`}
                                            title={`${name}: ${current.value !== undefined ? String(current.value) : '0'}`}
                                            className={`border-input bg-background focus:border-ring focus:ring-ring/20 h-7 w-full rounded border pr-1 pl-5 text-right text-xs outline-none focus:ring-1 ${
                                                isOverridden ? 'border-primary/50 font-medium' : ''
                                            }`}
                                            placeholder={current.value !== undefined ? String(parsed.value) : '0'}
                                            value={current.value !== undefined ? String(parsed.value) : ''}
                                            onChange={(e) => {
                                                const val = e.target.value.trim();
                                                if (val === '') {
                                                    onClear(key);
                                                } else {
                                                    const num = Number(val);
                                                    if (!isNaN(num)) {
                                                        setCorner(key, num, parsed.unit === 'auto' ? 'px' : parsed.unit);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground block text-center text-[9px]">{code}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function parseCompactBoxValue(
    value: StyleValue | undefined,
    allowAuto = true,
): { value: number | string; unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto' } {
    if (typeof value === 'object' && value !== null) return { value: value.value, unit: value.unit as 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' };
    if (typeof value === 'number') return { value, unit: 'px' };
    if (value === 'auto' && allowAuto) return { value: 'auto', unit: 'auto' };
    const match = String(value ?? '').match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)$/);
    return match ? { value: Number(match[1]), unit: match[2] as 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' } : { value: 0, unit: 'px' };
}

function boxSideValue(
    node: BuilderComponentNode,
    definition: ComponentDefinition,
    breakpoint: BuilderBreakpoint,
    property: 'margin' | 'padding',
    side: 'Top' | 'Right' | 'Bottom' | 'Left',
): { value: StyleValue | undefined; inherited: boolean } {
    const key = `${property}${side}` as StylePropertyKey;
    const own = inheritedStyleValue(node, definition, breakpoint, key);
    if (own.value !== undefined) return own;

    const shorthand = inheritedStyleValue(node, definition, breakpoint, property);
    if (shorthand.value === undefined) return own;
    const values = expandBoxShorthand(shorthand.value);
    return { value: values[['Top', 'Right', 'Bottom', 'Left'].indexOf(side)], inherited: shorthand.inherited };
}

function expandBoxShorthand(value: StyleValue): (StyleValue | undefined)[] {
    if (typeof value !== 'string' && typeof value !== 'number') return [value, value, value, value];
    const tokens = String(value).trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 1) return [tokens[0], tokens[0], tokens[0], tokens[0]];
    if (tokens.length === 2) return [tokens[0], tokens[1], tokens[0], tokens[1]];
    if (tokens.length === 3) return [tokens[0], tokens[1], tokens[2], tokens[1]];
    return [tokens[0], tokens[1], tokens[2], tokens[3]];
}

function borderSideValue(
    node: BuilderComponentNode,
    definition: ComponentDefinition,
    breakpoint: BuilderBreakpoint,
    shorthand: 'borderWidth' | 'borderRadius',
    key: StylePropertyKey,
): { value: StyleValue | undefined; inherited: boolean } {
    const own = inheritedStyleValue(node, definition, breakpoint, key);
    if (own.value !== undefined) return own;

    const base = inheritedStyleValue(node, definition, breakpoint, shorthand);
    if (base.value === undefined) return own;
    const values = expandBoxShorthand(base.value);

    if (shorthand === 'borderRadius') {
        const radiusKeys = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];
        return { value: values[radiusKeys.indexOf(key)], inherited: base.inherited };
    }

    const strokeKeys = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'];
    return { value: values[strokeKeys.indexOf(key)], inherited: base.inherited };
}

function PropControls({
    nodeType,
    schema,
    values,
    onChange,
    imageNode,
    onOpenMediaManager,
}: {
    nodeType: BuilderComponentNode['type'];
    schema: NonNullable<ComponentDefinition['propSchema']>;
    values: BuilderRecord;
    onChange: (patch: Partial<BuilderRecord>) => void;
    imageNode?: boolean;
    onOpenMediaManager?: () => void;
}) {
    return (
        <div className="space-y-3">
            {supportsColoredTextSegments(nodeType) ? (
                <ColoredTextSegmentsControl
                    value={Array.isArray(values.colorSegments) ? values.colorSegments : []}
                    fallbackText={String(values.text ?? '')}
                    onChange={(segments) =>
                        onChange({
                            colorSegments: segments,
                            text: segments.map((segment) => String(segment.text ?? '')).join(''),
                        })
                    }
                />
            ) : null}

            {imageNode && onOpenMediaManager ? (
                <div className="border-border/80 bg-card space-y-2 rounded-lg border p-3">
                    <p className="text-foreground text-xs font-semibold">Image Asset</p>
                    <button
                        type="button"
                        className="border-border hover:bg-muted/80 bg-background text-foreground w-full rounded-md border px-3 py-2 text-xs font-medium transition shadow-xs"
                        onClick={onOpenMediaManager}
                    >
                        Choose from media manager
                    </button>
                </div>
            ) : null}

            {nodeType === 'content.heading' && schema.level ? (
                <div className="border-border/80 bg-card space-y-2 rounded-lg border p-3">
                    <span className="text-foreground text-xs font-semibold">Heading Level</span>
                    <div className="grid grid-cols-6 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((lvl) => {
                            const active = Number(values.level ?? 2) === lvl;
                            return (
                                <button
                                    key={lvl}
                                    type="button"
                                    className={`h-7 rounded border text-xs font-bold transition ${
                                        active
                                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                    onClick={() => onChange({ level: lvl })}
                                >
                                    H{lvl}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {Object.entries(schema).map(([name, property]) => {
                if (nodeType === 'content.heading' && name === 'level') return null;
                if (supportsColoredTextSegments(nodeType) && name === 'colorSegments') return null;

                const value = values[name];
                const options = Array.isArray(property.values) ? property.values : [];

                if (nodeType === 'code.customcode' && name === 'code') {
                    return (
                        <div key={name} className="border-border/80 bg-card space-y-2 rounded-lg border p-3">
                            <span className="text-foreground block text-xs font-semibold">Custom Code</span>
                            <CodeEditor
                                language="html"
                                title="Custom Code"
                                minHeight="240px"
                                maxHeight="450px"
                                placeholder={
                                    '<div class="promo">Hello</div>\n<style>\n  .promo { color: #0f172a; }\n</style>\n<script>\n  console.log("custom code");\n</script>'
                                }
                                value={String(value ?? '')}
                                onChange={(next) => onChange({ [name]: next })}
                            />
                        </div>
                    );
                }

                let friendlyLabel = typeof property.label === 'string' ? property.label : name;
                let Icon = null;
                let isTextarea = false;

                if (name === 'text') {
                    friendlyLabel =
                        nodeType === 'content.button'
                            ? 'Button Label'
                            : nodeType === 'content.heading'
                              ? 'Heading Text'
                              : nodeType === 'content.link'
                                ? 'Link Text'
                                : 'Text Content';
                    Icon = Type;
                    if (nodeType === 'content.text' || nodeType === 'content.richtext') {
                        isTextarea = true;
                    }
                } else if (name === 'href') {
                    friendlyLabel = 'Link Destination (URL)';
                    Icon = LinkIcon;
                } else if (name === 'src') {
                    friendlyLabel = 'Image Source URL';
                } else if (name === 'alt') {
                    friendlyLabel = 'Alt Text (Accessibility)';
                }

                if (property.type === 'boolean') {
                    return (
                        <label key={name} className="border-border/80 bg-card hover:bg-muted/30 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition">
                            <span className="text-foreground text-xs font-medium">{friendlyLabel}</span>
                            <input
                                type="checkbox"
                                className="accent-primary size-4 rounded"
                                checked={value === true}
                                onChange={(event) => onChange({ [name]: event.target.checked })}
                            />
                        </label>
                    );
                }

                if (property.type === 'enum' && options.length > 0) {
                    return (
                        <div key={name} className="border-border/80 bg-card space-y-1.5 rounded-lg border p-3">
                            <span className="text-foreground text-xs font-semibold">{friendlyLabel}</span>
                            <select
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-1"
                                value={String(value ?? '')}
                                onChange={(event) => onChange({ [name]: parseValue(event.target.value, options) })}
                            >
                                {options.map((option) => (
                                    <option key={String(option)} value={String(option)}>
                                        {String(option)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                return (
                    <div key={name} className="border-border/80 bg-card space-y-1.5 rounded-lg border p-3">
                        <div className="flex items-center gap-1.5">
                            {Icon ? <Icon className="text-muted-foreground size-3.5" /> : null}
                            <span className="text-foreground text-xs font-semibold">{friendlyLabel}</span>
                        </div>
                        {isTextarea ? (
                            <textarea
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 min-h-[72px] w-full rounded-md border p-2 text-xs outline-none focus:ring-1"
                                value={String(value ?? '')}
                                rows={3}
                                onChange={(event) => onChange({ [name]: event.target.value })}
                            />
                        ) : (
                            <input
                                className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-1"
                                type={property.type === 'integer' || property.type === 'number' ? 'number' : 'text'}
                                value={String(value ?? '')}
                                placeholder={
                                    name === 'href'
                                        ? 'https://example.com or #section'
                                        : name === 'alt'
                                          ? 'Describe the image'
                                          : undefined
                                }
                                min={typeof property.min === 'number' ? property.min : undefined}
                                max={typeof property.max === 'number' ? property.max : undefined}
                                onChange={(event) =>
                                    onChange({
                                        [name]:
                                            property.type === 'integer' || property.type === 'number'
                                                ? Number(event.target.value)
                                                : event.target.value,
                                    })
                                }
                            />
                        )}
                    </div>
                );
            })}
        </div>
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
    const isOverridden = node.styles[breakpoint]?.[property.key] !== undefined;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-medium">{property.label}</span>
                <div className="flex items-center gap-1.5">
                    {current.inherited ? <span className="text-muted-foreground text-[10px]">Inherited</span> : null}
                    {isOverridden ? (
                        <button
                            type="button"
                            title={`Reset ${property.label} override`}
                            className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                            onClick={() => onClear(property.key)}
                        >
                            <RotateCcw className="size-2.5" />
                        </button>
                    ) : null}
                </div>
            </div>
            {property.key === 'fontFamily' ? (
                <FontFamilyControl value={current.value} onChange={(value) => onChange(property.key, value)} />
            ) : property.key === 'fontWeight' ? (
                <select
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                    value={String(current.value ?? 400)}
                    onChange={(event) => onChange(property.key, Number(event.target.value))}
                >
                    {HELLOWEB_FONT_WEIGHT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : property.type === 'enum' && options.length > 0 ? (
                <select
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
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
                <ColorValueControl label={property.label} value={current.value} onChange={(value) => onChange(property.key, value)} />
            ) : (
                <input
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2"
                    type={property.type === 'number' ? 'number' : 'text'}
                    value={String(current.value ?? '')}
                    placeholder={undefined}
                    onChange={(event) => onChange(property.key, property.type === 'number' ? Number(event.target.value) : event.target.value)}
                />
            )}
        </div>
    );
}

function parseValue(value: string, values: JsonValue[]): JsonValue {
    return values.find((option) => String(option) === value) ?? value;
}

interface ColorSegment extends Record<string, JsonValue> {
    text: string;
    color: string;
}

function ColoredTextSegmentsControl({
    value,
    fallbackText,
    onChange,
}: {
    value: JsonValue[];
    fallbackText: string;
    onChange: (segments: ColorSegment[]) => void;
}) {
    const segments = normalizeColorSegments(value, fallbackText);
    const updateSegment = (index: number, patch: Partial<ColorSegment>) => {
        onChange(
            segments.map((segment, nextIndex) =>
                nextIndex === index
                    ? {
                          text: patch.text ?? segment.text,
                          color: patch.color ?? segment.color,
                      }
                    : segment,
            ),
        );
    };

    return (
        <div className="border-border space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold">Colored text</p>
                    <p className="text-muted-foreground mt-0.5 text-[10px]">Split copy into colorable spans.</p>
                </div>
                <button
                    type="button"
                    className="border-border hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border"
                    aria-label="Add color segment"
                    onClick={() => onChange([...segments, { text: 'Text', color: '#000000' }])}
                >
                    <Plus className="size-3.5" />
                </button>
            </div>
            <div className="space-y-2">
                {segments.map((segment, index) => (
                    <div key={index} className="bg-muted/30 space-y-2 rounded-md border p-2">
                        <div className="flex gap-1.5">
                            <input
                                className="border-input bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-xs outline-none"
                                value={String(segment.text ?? '')}
                                aria-label={`Text segment ${index + 1}`}
                                onChange={(event) => updateSegment(index, { text: event.target.value })}
                            />
                            <button
                                type="button"
                                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
                                aria-label={`Remove text segment ${index + 1}`}
                                onClick={() => onChange(segments.filter((_, nextIndex) => nextIndex !== index))}
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                        <ColorValueControl
                            label={`Segment ${index + 1}`}
                            value={typeof segment.color === 'string' ? segment.color : '#000000'}
                            onChange={(color) => {
                                if (typeof color === 'string') updateSegment(index, { color });
                            }}
                            compact
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function ColorValueControl({
    label,
    value,
    onChange,
    compact = false,
}: {
    label: string;
    value: StyleValue | undefined;
    onChange: (value: StyleValue) => void;
    compact?: boolean;
}) {
    const color = normalizeColor(value);
    const rawValue = typeof value === 'string' && value !== '' ? value : color;
    const [draftValue, setDraftValue] = useState(rawValue);
    const [expanded, setExpanded] = useState(compact);
    const [recentColors, setRecentColors] = useState<string[]>(() => readRecentColors());
    const swatches = [
        '#000000',
        '#ffffff',
        HELLOWEB_DESIGN_TOKENS.colors.primary,
        HELLOWEB_DESIGN_TOKENS.colors.accent,
        '#16a34a',
        '#2563eb',
        '#dc2626',
        '#f59e0b',
        '#7c3aed',
        '#0f172a',
    ];
    const tokens = [
        ['Primary', HELLOWEB_DESIGN_TOKENS.colors.primary],
        ['Accent', HELLOWEB_DESIGN_TOKENS.colors.accent],
        ['Background', HELLOWEB_DESIGN_TOKENS.colors.background],
        ['Transparent', 'transparent'],
    ] as const;
    const commitColor = (nextColor: StyleValue) => {
        onChange(nextColor);
        if (typeof nextColor === 'string') {
            setDraftValue(nextColor);
            const updated = rememberRecentColor(nextColor);
            setRecentColors(updated);
        }
    };

    useEffect(() => {
        setDraftValue(rawValue);
    }, [rawValue]);

    useEffect(() => {
        const handleStorage = () => setRecentColors(readRecentColors());

        window.addEventListener('storage', handleStorage);

        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className={compact ? 'space-y-2' : 'mt-1.5 space-y-2'}>
            <div className="flex gap-1.5">
                <input
                    aria-label={`${label} swatch`}
                    className="border-input bg-background h-8 w-10 cursor-pointer rounded-md border p-1"
                    type="color"
                    value={color}
                    onChange={(event) => commitColor(event.target.value)}
                />
                <input
                    aria-label={`${label} hex code`}
                    className="border-input bg-background focus:border-ring focus:ring-ring/20 h-8 min-w-0 flex-1 rounded-md border px-2 font-mono text-xs uppercase outline-none focus:ring-2"
                    value={draftValue}
                    placeholder="#000000"
                    onChange={(event) => {
                        const nextValue = normalizeHexInput(event.target.value);
                        setDraftValue(nextValue);
                        if (isValidColorValue(nextValue)) commitColor(nextValue);
                    }}
                    onBlur={() => {
                        if (!isValidColorValue(draftValue)) setDraftValue(rawValue);
                    }}
                />
                {!compact ? (
                    <button
                        type="button"
                        className="border-border hover:bg-muted h-8 rounded-md border px-2 text-[10px] font-medium"
                        onClick={() => setExpanded((value) => !value)}
                    >
                        {expanded ? 'Hide' : 'Edit'}
                    </button>
                ) : null}
            </div>
            {expanded && recentColors.length > 0 ? (
                <div>
                    <p className="text-muted-foreground mb-1 text-[9px] font-semibold tracking-[0.12em] uppercase">Recent</p>
                    <div className="grid grid-cols-10 gap-1">
                        {recentColors.map((recentColor) => (
                            <button
                                key={recentColor}
                                type="button"
                                className="border-border focus:ring-ring/40 size-5 rounded border outline-none focus:ring-2"
                                style={{ backgroundColor: recentColor }}
                                aria-label={`Use recent color ${recentColor}`}
                                title={recentColor}
                                onClick={() => commitColor(recentColor)}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {expanded ? (
                <div className="grid grid-cols-10 gap-1">
                    {swatches.map((swatch) => (
                        <button
                            key={swatch}
                            type="button"
                            className="border-border focus:ring-ring/40 size-5 rounded border outline-none focus:ring-2"
                            style={{ backgroundColor: swatch }}
                            aria-label={`Use ${swatch}`}
                            title={swatch}
                            onClick={() => commitColor(swatch)}
                        />
                    ))}
                </div>
            ) : null}
            {expanded && !compact ? (
                <div className="grid grid-cols-2 gap-1">
                    {tokens.map(([name, token]) => (
                        <button
                            key={name}
                            type="button"
                            className="border-border hover:bg-muted flex items-center gap-1.5 rounded border px-2 py-1 text-[10px]"
                            onClick={() => commitColor(token)}
                        >
                            <span className="border-border size-3 rounded-sm border" style={{ backgroundColor: token }} />
                            <span className="truncate">{name}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

const RECENT_COLOR_STORAGE_KEY = 'helloweb.builder.recentColors';

function readRecentColors(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const value = JSON.parse(window.localStorage.getItem(RECENT_COLOR_STORAGE_KEY) ?? '[]');
        if (!Array.isArray(value)) return [];

        return value.filter((color): color is string => typeof color === 'string' && isRememberableColor(color)).slice(0, 10);
    } catch {
        return [];
    }
}

function rememberRecentColor(color: string): string[] {
    if (typeof window === 'undefined' || !isRememberableColor(color)) return readRecentColors();

    const normalized = color.toLowerCase();
    const updated = [normalized, ...readRecentColors().filter((recentColor) => recentColor.toLowerCase() !== normalized)].slice(0, 10);
    window.localStorage.setItem(RECENT_COLOR_STORAGE_KEY, JSON.stringify(updated));

    return updated;
}

function isRememberableColor(color: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(color) || /^#[0-9a-f]{3}$/i.test(color);
}

function isValidColorValue(color: string): boolean {
    return /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i.test(color);
}

function normalizeColorSegments(value: JsonValue[], fallbackText: string): ColorSegment[] {
    const segments = value
        .filter(isColorSegmentRecord)
        .map((segment) => ({
            text: typeof segment.text === 'string' ? segment.text : '',
            color: typeof segment.color === 'string' ? segment.color : '#000000',
        }))
        .filter((segment) => segment.text !== '' || segment.color !== '#000000');

    return segments.length > 0 ? segments : [{ text: fallbackText, color: '#000000' }];
}

function isColorSegmentRecord(value: JsonValue): value is ColorSegment {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function supportsColoredTextSegments(type: BuilderComponentNode['type']): boolean {
    return type === 'content.heading' || type === 'content.text' || type === 'content.richtext';
}

function normalizeHexInput(value: string): string {
    const nextValue = value.trim();
    if (nextValue === '') return '#';
    if (nextValue === 'transparent') return nextValue;
    return nextValue.startsWith('#') ? nextValue : `#${nextValue}`;
}

function normalizeColor(value: StyleValue | undefined): string {
    if (typeof value !== 'string') return '#000000';
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    if (/^#[0-9a-f]{3}$/i.test(value)) {
        return `#${value
            .slice(1)
            .split('')
            .map((character) => `${character}${character}`)
            .join('')}`;
    }

    return '#000000';
}
