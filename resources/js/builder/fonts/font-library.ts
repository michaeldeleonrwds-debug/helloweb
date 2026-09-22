export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';

export interface FontFamilyMetadata {
    family: string;
    provider: 'google-fonts';
    category: FontCategory;
    weights: number[];
    styles: ('normal' | 'italic')[];
    recommended: boolean;
    loadingStrategy: 'on-demand';
}

export const HELLOWEB_FONT_LIBRARY: FontFamilyMetadata[] = [
    { family: 'Inter', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 600, 700], styles: ['normal'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Manrope', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 600, 700], styles: ['normal'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'DM Sans', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 700], styles: ['normal', 'italic'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Plus Jakarta Sans', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 600, 700], styles: ['normal'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Outfit', provider: 'google-fonts', category: 'display', weights: [400, 500, 600, 700], styles: ['normal'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Poppins', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 600, 700], styles: ['normal'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Roboto', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 700], styles: ['normal', 'italic'], recommended: true, loadingStrategy: 'on-demand' },
    { family: 'Open Sans', provider: 'google-fonts', category: 'sans-serif', weights: [400, 500, 600, 700], styles: ['normal', 'italic'], recommended: true, loadingStrategy: 'on-demand' },
];

export function findFontFamily(family: string): FontFamilyMetadata | null {
    return HELLOWEB_FONT_LIBRARY.find((font) => font.family === family) ?? null;
}
