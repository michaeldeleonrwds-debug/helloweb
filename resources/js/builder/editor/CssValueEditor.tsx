import { useMemo } from 'react';

import type { StylePropertyKey } from '../style/style';
import type { LengthValue } from '../style/style';

export type CssUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'ch' | 'ex' | 'cm' | 'mm' | 'in' | 'pt' | 'pc' | 'auto' | 'none' | 'expression';

const units: { value: CssUnit; label: string; group: string }[] = [
    { value: 'px', label: 'px', group: 'Absolute' }, { value: 'rem', label: 'rem', group: 'Relative' }, { value: 'em', label: 'em', group: 'Relative' }, { value: '%', label: '%', group: 'Relative' }, { value: 'vw', label: 'vw', group: 'Relative' }, { value: 'vh', label: 'vh', group: 'Relative' }, { value: 'vmin', label: 'vmin', group: 'Relative' }, { value: 'vmax', label: 'vmax', group: 'Relative' }, { value: 'ch', label: 'ch', group: 'Relative' }, { value: 'ex', label: 'ex', group: 'Relative' }, { value: 'cm', label: 'cm', group: 'Absolute' }, { value: 'mm', label: 'mm', group: 'Absolute' }, { value: 'in', label: 'in', group: 'Absolute' }, { value: 'pt', label: 'pt', group: 'Absolute' }, { value: 'pc', label: 'pc', group: 'Absolute' }, { value: 'auto', label: 'Auto', group: 'Keywords' }, { value: 'none', label: 'None', group: 'Keywords' }, { value: 'expression', label: 'CSS expression', group: 'Advanced' },
];

interface CssValueEditorProps {
    property: StylePropertyKey;
    value: string | number | LengthValue | undefined;
    onChange: (value: string | number | LengthValue) => void;
}

export function CssValueEditor({ property, value, onChange }: CssValueEditorProps) {
    const parsed = useMemo(() => parseCssValue(value), [value]);
    const allowedUnits = units.filter((unit) => allowedUnitsFor(property).includes(unit.value));

    if (parsed.unit === 'expression') {
        return <div className="mt-1.5 flex gap-1.5"><input className="border-input bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-xs" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} /><UnitSelect units={allowedUnits} value={parsed.unit} onChange={(unit) => onChange(unit === 'auto' || unit === 'none' ? unit : `${parsed.value}${unit}`)} /></div>;
    }

    return <div className="mt-1.5 flex gap-1.5"><input className="border-input bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-xs" type={parsed.unit === 'auto' || parsed.unit === 'none' ? 'text' : 'number'} value={String(parsed.value)} onChange={(event) => onChange(parsed.unit === 'auto' || parsed.unit === 'none' ? event.target.value : { value: Number(event.target.value), unit: parsed.unit as LengthValue['unit'] })} /><UnitSelect units={allowedUnits} value={parsed.unit} onChange={(unit) => onChange(unit === 'auto' || unit === 'none' ? unit : { value: Number(parsed.value) || 0, unit: unit as LengthValue['unit'] })} /></div>;
}

function UnitSelect({ units: options, value, onChange }: { units: typeof units; value: CssUnit; onChange: (unit: CssUnit) => void }) {
    return <select className="border-input bg-background h-8 w-24 rounded-md border px-1.5 text-xs" value={value} onChange={(event) => onChange(event.target.value as CssUnit)}>{['Absolute', 'Relative', 'Keywords', 'Advanced'].map((group) => <optgroup key={group} label={group}>{options.filter((unit) => unit.group === group).map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</optgroup>)}</select>;
}

function parseCssValue(value: string | number | LengthValue | undefined): { value: string | number; unit: CssUnit } {
    if (typeof value === 'object' && value !== null) return { value: value.value, unit: value.unit };
    if (typeof value === 'number') return { value, unit: 'px' };
    if (!value || value === 'auto' || value === 'none') return { value: value || 0, unit: value === 'auto' || value === 'none' ? value : 'px' };
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/);
    if (match) return { value: Number(match[1]), unit: match[2] as CssUnit };
    return { value, unit: 'expression' };
}

function allowedUnitsFor(property: StylePropertyKey): CssUnit[] {
    if (property === 'maxWidth' || property === 'maxHeight') return units.map((unit) => unit.value).filter((unit) => unit !== 'auto');
    if (property === 'margin') return units.map((unit) => unit.value);
    return units.map((unit) => unit.value).filter((unit) => unit !== 'none');
}
