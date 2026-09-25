import { ChevronDown, RotateCcw } from 'lucide-react';
import { Suspense, lazy, useEffect, useState, type CSSProperties } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { alphaPercent, isGradientValue, parseColor, toHexColor, toRgbaString } from '../style/style';
import { readRecentColors, rememberRecentColor } from './recent-colors';

const ColorPicker = lazy(() => import('react-best-gradient-color-picker'));

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #111827, #10b981)';

const CHECKERBOARD_STYLE: CSSProperties = {
    backgroundImage:
        'linear-gradient(45deg, rgba(0,0,0,0.16) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.16) 75%), linear-gradient(45deg, rgba(0,0,0,0.16) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.16) 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 4px 4px',
};

interface BackgroundColorFieldProps {
    label: string;
    value: string | undefined;
    mode?: 'solid' | 'gradient';
    onChange: (value: string) => void;
    idSuffix?: string;
    visibleLabel?: boolean;
    inherited?: boolean;
    overridden?: boolean;
    onReset?: () => void;
    disabled?: boolean;
}

export function BackgroundColorField({
    label,
    value,
    mode = 'solid',
    onChange,
    idSuffix,
    visibleLabel = false,
    inherited = false,
    overridden = false,
    onReset,
    disabled = false,
}: BackgroundColorFieldProps) {
    const [open, setOpen] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>(() => readRecentColors());
    const isGradient = mode === 'gradient';
    const pickerValue = isGradient
        ? typeof value === 'string' && isGradientValue(value)
            ? value
            : DEFAULT_GRADIENT
        : toRgbaString(value);
    const previewValue = isGradient ? pickerValue : toRgbaString(value);
    const hex = toHexColor(value);
    const alpha = alphaPercent(value);

    useEffect(() => {
        const handleStorage = () => setRecentColors(readRecentColors());

        window.addEventListener('storage', handleStorage);

        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleChange = (nextValue: string) => {
        if (typeof nextValue !== 'string' || nextValue === '') return;

        if (isGradient) {
            if (!isGradientValue(nextValue)) return;
            onChange(nextValue);
            return;
        }

        if (!parseColor(nextValue)) return;
        const normalized = toRgbaString(nextValue);
        onChange(normalized);
        setRecentColors(rememberRecentColor(normalized));
    };

    return (
        <div className="space-y-1.5">
            {visibleLabel ? (
                <div className="flex items-center justify-between">
                    <span className="text-foreground text-xs font-medium">{label}</span>
                    <div className="flex items-center gap-1.5">
                        {inherited ? <span className="text-muted-foreground text-[10px]">Inherited</span> : null}
                        {overridden && onReset ? (
                            <button
                                type="button"
                                title={`Reset ${label} override`}
                                className="text-muted-foreground hover:text-foreground inline-flex size-3.5 items-center justify-center transition"
                                onClick={onReset}
                            >
                                <RotateCcw className="size-2.5" />
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        aria-label={`${label} picker, alpha ${alpha}%`}
                        className="border-input bg-background hover:bg-muted focus-visible:ring-ring/40 flex h-8 w-full items-center gap-2 rounded-md border px-2 text-left text-xs outline-none transition focus-visible:ring-2 disabled:opacity-50"
                    >
                        <span className="border-border/60 relative size-4 shrink-0 overflow-hidden rounded border" style={CHECKERBOARD_STYLE}>
                            <span
                                className="absolute inset-0"
                                style={isGradient ? { backgroundImage: previewValue } : { backgroundColor: previewValue }}
                            />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] uppercase">{isGradient ? 'Gradient' : (value === 'transparent' ? 'Transparent' : hex)}</span>
                        {!isGradient && value !== 'transparent' ? <span className="text-muted-foreground shrink-0 font-mono text-[10px] tabular-nums">{alpha}%</span> : null}
                        <ChevronDown className="text-muted-foreground size-3 shrink-0" />
                    </button>
                </PopoverTrigger>
                <PopoverContent side="left" align="start" sideOffset={12} className="w-auto p-3 shadow-2xl rounded-2xl border-border bg-popover text-popover-foreground">
                    <Suspense
                        fallback={<div className="text-muted-foreground w-[260px] p-6 text-center text-xs">Loading color picker…</div>}
                    >
                        <ColorPickerContent
                            value={pickerValue}
                            onChange={handleChange}
                            recentColors={recentColors}
                            idSuffix={idSuffix}
                            onSelectTransparent={() => {
                                onChange('transparent');
                                setOpen(false);
                            }}
                        />
                    </Suspense>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function ColorPickerContent({
    value,
    onChange,
    recentColors,
    idSuffix,
    onSelectTransparent,
}: {
    value: string;
    onChange: (value: string) => void;
    recentColors: string[];
    idSuffix?: string;
    onSelectTransparent?: () => void;
}) {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const presets = recentColors.length > 0 ? recentColors.map((color) => toRgbaString(color)) : undefined;

    const quickColors = [
        { label: 'White', value: '#ffffff' },
        { label: 'Slate 900', value: '#0f172a' },
        { label: 'Emerald', value: '#10b981' },
        { label: 'Blue', value: '#2563eb' },
        { label: 'Purple', value: '#8b5cf6' },
        { label: 'Dark Gray', value: '#1e293b' },
    ];

    return (
        <div className="space-y-3">
            <ColorPicker
                value={value}
                onChange={onChange}
                width={250}
                height={130}
                presets={presets}
                idSuffix={idSuffix ? idSuffix.replace(/[^a-zA-Z0-9_-]/g, '') : ''}
                hideColorTypeBtns
                hideAdvancedSliders
                hideColorGuide
                disableDarkMode={!isDark}
                disableLightMode={isDark}
            />

            <div className="border-border/60 flex items-center justify-between border-t pt-2.5">
                <button
                    type="button"
                    onClick={onSelectTransparent}
                    className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition"
                >
                    <span className="border-border/60 relative size-3 shrink-0 overflow-hidden rounded border" style={CHECKERBOARD_STYLE} />
                    <span>Transparent</span>
                </button>

                <div className="flex items-center gap-1">
                    {quickColors.map((qc) => (
                        <button
                            key={qc.value}
                            type="button"
                            title={qc.label}
                            onClick={() => onChange(qc.value)}
                            className="size-4.5 rounded-full border border-black/10 transition hover:scale-110 active:scale-95"
                            style={{ backgroundColor: qc.value }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
