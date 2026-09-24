import type { ResolvedStyle, StylePropertyKey, StyleValue } from '../style/style';

const DROP_SHADOW_KEYS: readonly StylePropertyKey[] = ['dropShadowX', 'dropShadowY', 'dropShadowBlur', 'dropShadowSpread', 'dropShadowColor'];
const INNER_SHADOW_KEYS: readonly StylePropertyKey[] = ['innerShadowX', 'innerShadowY', 'innerShadowBlur', 'innerShadowSpread', 'innerShadowColor'];
const GLASS_KEYS: readonly StylePropertyKey[] = [
    'glassRefraction',
    'glassDepth',
    'glassDispersion',
    'glassFrost',
    'glassSplay',
    'glassLightDegree',
    'glassOpacity',
];
const VIRTUAL_EFFECT_KEYS: readonly StylePropertyKey[] = [...DROP_SHADOW_KEYS, ...INNER_SHADOW_KEYS, 'layerBlur', 'backgroundBlur', ...GLASS_KEYS];

function numeric(value: StyleValue | undefined, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
    if (typeof value === 'object' && value !== null && typeof value.value === 'number') return value.value;
    return fallback;
}

function px(value: number): string {
    return `${Math.round(value * 100) / 100}px`;
}

function colorText(value: StyleValue | undefined, fallback: string): string {
    return typeof value === 'string' && value !== '' ? value : fallback;
}

function takeNumber(styles: ResolvedStyle, key: StylePropertyKey): number | undefined {
    const value = styles[key];
    if (value === undefined) return undefined;
    delete styles[key];
    return numeric(value);
}

function takeColor(styles: ResolvedStyle, key: StylePropertyKey): string | undefined {
    const value = styles[key];
    if (value === undefined) return undefined;
    delete styles[key];
    return typeof value === 'string' && value !== '' ? value : undefined;
}

export function composeEffectsStyles(styles: ResolvedStyle): ResolvedStyle {
    const next: ResolvedStyle = { ...styles };

    const dropX = takeNumber(next, 'dropShadowX');
    const dropY = takeNumber(next, 'dropShadowY');
    const dropBlur = takeNumber(next, 'dropShadowBlur');
    const dropSpread = takeNumber(next, 'dropShadowSpread');
    const dropColor = takeColor(next, 'dropShadowColor');
    const innerX = takeNumber(next, 'innerShadowX');
    const innerY = takeNumber(next, 'innerShadowY');
    const innerBlur = takeNumber(next, 'innerShadowBlur');
    const innerSpread = takeNumber(next, 'innerShadowSpread');
    const innerColor = takeColor(next, 'innerShadowColor');
    const layerBlur = takeNumber(next, 'layerBlur');
    const backgroundBlur = takeNumber(next, 'backgroundBlur');
    const glassRefraction = takeNumber(next, 'glassRefraction');
    const glassDepth = takeNumber(next, 'glassDepth');
    const glassDispersion = takeNumber(next, 'glassDispersion');
    const glassFrost = takeNumber(next, 'glassFrost');
    const glassSplay = takeNumber(next, 'glassSplay');
    const glassLightDegree = takeNumber(next, 'glassLightDegree');
    const glassOpacity = takeNumber(next, 'glassOpacity');
    for (const key of VIRTUAL_EFFECT_KEYS) delete next[key];

    const glassActive = [glassRefraction, glassDepth, glassDispersion, glassFrost, glassSplay, glassLightDegree, glassOpacity].some(
        (value) => value !== undefined,
    );
    const dropActive = [dropX, dropY, dropBlur, dropSpread, dropColor].some((value) => value !== undefined);
    const innerActive = [innerX, innerY, innerBlur, innerSpread, innerColor].some((value) => value !== undefined);

    const shadowParts: string[] = [];
    if (innerActive) {
        shadowParts.push(
            `inset ${px(numeric(innerX))} ${px(numeric(innerY, 1))} ${px(numeric(innerBlur, 4))} ${px(numeric(innerSpread))} ${colorText(
                innerColor,
                'rgba(255,255,255,0.35)',
            )}`,
        );
    }
    if (glassActive) {
        const depth = numeric(glassDepth);
        const splay = numeric(glassSplay);
        const light = numeric(glassLightDegree, 135);
        if (depth > 0 || splay > 0) {
            const radians = (light * Math.PI) / 180;
            const lightOffset = Math.sin(radians) * depth * 0.12;
            const highlightAlpha = 0.15 + (splay / 100) * 0.5;
            shadowParts.push(`inset 0 ${px(lightOffset)} ${px(depth * 0.4)} rgba(255,255,255,${highlightAlpha.toFixed(3)})`);
            shadowParts.push(`inset 0 ${px(-lightOffset * 0.6)} ${px(depth * 0.5)} rgba(15,23,42,${(depth * 0.003).toFixed(3)})`);
        }
        const dispersion = numeric(glassDispersion);
        if (dispersion > 0) {
            const offset = dispersion * 0.08;
            const alpha = (dispersion * 0.004).toFixed(3);
            shadowParts.push(`inset ${px(offset)} 0 ${px(offset)} rgba(255,72,136,${alpha})`);
            shadowParts.push(`inset ${px(-offset)} 0 ${px(offset)} rgba(64,224,255,${alpha})`);
        }
    }
    if (dropActive) {
        shadowParts.push(
            `${px(numeric(dropX))} ${px(numeric(dropY, 8))} ${px(numeric(dropBlur, 24))} ${px(numeric(dropSpread))} ${colorText(
                dropColor,
                'rgba(15,23,42,0.18)',
            )}`,
        );
    }
    const existingShadow = typeof next.boxShadow === 'string' && next.boxShadow !== 'none' ? next.boxShadow : '';
    if (shadowParts.length > 0) {
        next.boxShadow = [...shadowParts, existingShadow].filter((part) => part !== '').join(', ');
    }

    if (layerBlur !== undefined) {
        const base = typeof next.filter === 'string' && next.filter !== 'none' ? next.filter : '';
        const composed = `blur(${px(layerBlur)})${base ? ` ${base}` : ''}`;
        if (layerBlur === 0 && base === '') delete next.filter;
        else next.filter = composed;
    }

    const backdropParts: string[] = [];
    if (backgroundBlur !== undefined && backgroundBlur > 0) backdropParts.push(`blur(${px(backgroundBlur)})`);
    if (glassActive) {
        const frost = numeric(glassFrost);
        const refraction = numeric(glassRefraction);
        if (frost > 0) backdropParts.push(`blur(${px(frost * 0.4)})`);
        if (refraction > 0) {
            backdropParts.push(`saturate(${Math.round(100 + refraction)}%)`);
            backdropParts.push(`contrast(${Math.round(100 + refraction * 0.4)}%)`);
        }
    }
    if (backdropParts.length > 0) {
        const base = typeof next.backdropFilter === 'string' && next.backdropFilter !== 'none' ? next.backdropFilter : '';
        next.backdropFilter = [...backdropParts, base].filter((part) => part !== '').join(' ');
    }

    if (glassActive) {
        const alpha = Math.min(100, Math.max(0, numeric(glassOpacity, 16))) / 100;
        const degrees = numeric(glassLightDegree, 135);
        const sheen = `linear-gradient(${degrees}deg, rgba(255,255,255,${alpha.toFixed(3)}), rgba(255,255,255,${(alpha * 0.3).toFixed(3)}) 45%, rgba(255,255,255,0))`;
        const existingImage = typeof next.backgroundImage === 'string' && next.backgroundImage !== '' ? next.backgroundImage : '';
        next.backgroundImage = existingImage !== '' ? `${sheen}, ${existingImage}` : sheen;
    }

    return next;
}
