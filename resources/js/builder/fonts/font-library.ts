export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';

export interface FontFamilyMetadata {
    family: string;
    provider: 'google-fonts' | 'system';
    category: FontCategory;
    weights: number[];
    styles: ('normal' | 'italic')[];
    recommended: boolean;
    loadingStrategy: 'on-demand';
}

const googleSans = [
    'Inter',
    'Manrope',
    'DM Sans',
    'Plus Jakarta Sans',
    'Outfit',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Lato',
    'Nunito',
    'Nunito Sans',
    'Raleway',
    'Oswald',
    'Rubik',
    'Work Sans',
    'Figtree',
    'Urbanist',
    'Space Grotesk',
    'Sora',
    'Source Sans 3',
    'IBM Plex Sans',
];
const googleEditorial = ['Merriweather', 'Playfair Display', 'Libre Baskerville', 'Cormorant Garamond', 'Roboto Slab'];
const googleMono = ['IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Source Code Pro'];

export const HELLOWEB_FONT_LIBRARY: FontFamilyMetadata[] = [
    ...googleSans.map((family) => ({
        family,
        provider: 'google-fonts' as const,
        category: 'sans-serif' as const,
        weights: [200, 300, 400, 500, 600, 700, 800, 900],
        styles: ['normal', 'italic'] as ('normal' | 'italic')[],
        recommended: ['Inter', 'Manrope', 'DM Sans', 'Poppins', 'Montserrat'].includes(family),
        loadingStrategy: 'on-demand' as const,
    })),
    ...googleEditorial.map((family) => ({
        family,
        provider: 'google-fonts' as const,
        category: 'serif' as const,
        weights: [300, 400, 500, 600, 700, 800, 900],
        styles: ['normal', 'italic'] as ('normal' | 'italic')[],
        recommended: false,
        loadingStrategy: 'on-demand' as const,
    })),
    ...googleMono.map((family) => ({
        family,
        provider: 'google-fonts' as const,
        category: 'monospace' as const,
        weights: [300, 400, 500, 600, 700],
        styles: ['normal', 'italic'] as ('normal' | 'italic')[],
        recommended: false,
        loadingStrategy: 'on-demand' as const,
    })),
    ...[
        'Arial',
        'Helvetica',
        'Helvetica Neue',
        'Verdana',
        'Tahoma',
        'Trebuchet MS',
        'Georgia',
        'Times New Roman',
        'Courier New',
        'system-ui',
        'sans-serif',
        'serif',
        'monospace',
    ].map((family) => ({
        family,
        provider: 'system' as const,
        category:
            family === 'monospace'
                ? ('monospace' as const)
                : family === 'Georgia' || family === 'Times New Roman' || family === 'serif'
                  ? ('serif' as const)
                  : ('sans-serif' as const),
        weights: [400, 500, 600, 700, 800, 900],
        styles: ['normal', 'italic'] as ('normal' | 'italic')[],
        recommended: ['Arial', 'Helvetica', 'Georgia', 'system-ui'].includes(family),
        loadingStrategy: 'on-demand' as const,
    })),
];

export const HELLOWEB_FONT_WEIGHT_OPTIONS = [
    { value: 200, label: 'Extra Light' },
    { value: 300, label: 'Light' },
    { value: 400, label: 'Normal' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semibold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extra Bold' },
    { value: 900, label: 'Ultra Bold' },
] as const;

export function findFontFamily(family: string): FontFamilyMetadata | null {
    return HELLOWEB_FONT_LIBRARY.find((font) => font.family === family) ?? null;
}
