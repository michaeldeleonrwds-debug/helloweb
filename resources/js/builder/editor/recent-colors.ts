const RECENT_COLOR_STORAGE_KEY = 'helloweb.builder.recentColors';

export function readRecentColors(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const value = JSON.parse(window.localStorage.getItem(RECENT_COLOR_STORAGE_KEY) ?? '[]');
        if (!Array.isArray(value)) return [];

        return value.filter((color): color is string => typeof color === 'string' && isRememberableColor(color)).slice(0, 10);
    } catch {
        return [];
    }
}

export function rememberRecentColor(color: string): string[] {
    if (typeof window === 'undefined' || !isRememberableColor(color)) return readRecentColors();

    const normalized = color.toLowerCase();
    const updated = [normalized, ...readRecentColors().filter((recentColor) => recentColor.toLowerCase() !== normalized)].slice(0, 10);
    window.localStorage.setItem(RECENT_COLOR_STORAGE_KEY, JSON.stringify(updated));

    return updated;
}

export function isRememberableColor(color: string): boolean {
    return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color) || /^(rgba?|hsla?)\([^)]*\)$/i.test(color);
}
