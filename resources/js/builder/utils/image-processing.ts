/**
 * Client-Side Image Processing Engine for HelloWeb Builder
 * 
 * Supports:
 * 1. Native In-Browser WebP Conversion (HTML5 Canvas + createImageBitmap)
 * 2. Client-Side AI Background Removal (WebAssembly / ONNX via @imgly/background-removal)
 */

export interface ProcessImageOptions {
    convertToWebp?: boolean;
    removeBackground?: boolean;
    quality?: number; // 0.1 to 1.0 (default 0.85)
    onProgress?: (stage: string, progress: number) => void;
}

/**
 * Converts any image (PNG, JPEG, GIF, BMP, etc.) to modern WebP format
 * entirely within the browser using HTML5 Canvas & createImageBitmap.
 */
export async function convertImageToWebp(
    source: File | Blob | string,
    options: { quality?: number; fileName?: string } = {}
): Promise<File> {
    const quality = options.quality ?? 0.85;

    let originalName = 'image';
    let blob: Blob;

    if (source instanceof File) {
        originalName = source.name;
        blob = source;
    } else if (typeof source === 'string') {
        const urlParts = source.split('/');
        originalName = urlParts[urlParts.length - 1]?.split('?')[0] || 'image';
        const res = await fetch(source);
        if (!res.ok) throw new Error(`Failed to load image from "${source}".`);
        blob = await res.blob();
    } else {
        blob = source;
        if (options.fileName) originalName = options.fileName;
    }

    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context is not supported in this browser.');
    }

    ctx.drawImage(bitmap, 0, 0);

    const webpBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Failed to encode image to WebP format.'));
                }
            },
            'image/webp',
            quality
        );
    });

    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}.webp`;

    return new File([webpBlob], newFileName, { type: 'image/webp' });
}

/**
 * Removes background from an image using client-side AI (@imgly/background-removal).
 * Runs completely locally in the user's browser via WebAssembly / ONNX.
 */
export async function removeImageBackground(
    source: File | Blob | string,
    options: {
        format?: 'image/png' | 'image/webp';
        quality?: number;
        fileName?: string;
        onProgress?: (stage: string, progress: number) => void;
    } = {}
): Promise<File> {
    const format = options.format ?? 'image/webp';
    const quality = options.quality ?? 0.9;

    let originalName = 'cutout';
    let inputSource: Blob | File | string = source;

    if (source instanceof File) {
        originalName = source.name;
    } else if (typeof source === 'string') {
        const urlParts = source.split('/');
        originalName = urlParts[urlParts.length - 1]?.split('?')[0] || 'cutout';
        try {
            const res = await fetch(source);
            if (res.ok) {
                inputSource = await res.blob();
            }
        } catch {
            // Keep string as fallback for imgly
        }
    } else if (options.fileName) {
        originalName = options.fileName;
    }

    options.onProgress?.('Loading AI model...', 10);

    // Dynamically import @imgly/background-removal to keep initial bundle lean
    const imglyModule = await import('@imgly/background-removal');
    const removeBackground = (imglyModule.removeBackground ?? imglyModule.default) as (
        image: File | Blob | string,
        configuration?: any
    ) => Promise<Blob>;

    options.onProgress?.('Extracting foreground...', 30);

    const resultBlob = await removeBackground(inputSource, {
        model: 'isnet_fp16',
        output: {
            format,
            quality,
        },
        progress: (key: string, current: number, total: number) => {
            if (options.onProgress && total > 0) {
                const percent = Math.min(99, Math.round((current / total) * 100));
                options.onProgress(`AI Analysis: ${key}`, percent);
            }
        },
    });

    options.onProgress?.('Finalizing transparent asset...', 100);

    const ext = format === 'image/webp' ? 'webp' : 'png';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}-nobg.${ext}`;

    return new File([resultBlob], newFileName, { type: format });
}

/**
 * Combined pipeline helper:
 * - If removeBackground is true: runs cutout, optionally encoding as WebP.
 * - Else if convertToWebp is true: converts to WebP.
 * - Otherwise returns the original file untouched.
 */
export async function processImageFile(
    file: File,
    options: ProcessImageOptions
): Promise<File> {
    if (options.removeBackground) {
        return removeImageBackground(file, {
            format: options.convertToWebp ? 'image/webp' : 'image/png',
            quality: options.quality ?? 0.85,
            onProgress: options.onProgress,
        });
    }

    if (options.convertToWebp) {
        options.onProgress?.('Converting to WebP...', 50);
        const result = await convertImageToWebp(file, {
            quality: options.quality ?? 0.85,
        });
        options.onProgress?.('Complete', 100);
        return result;
    }

    return file;
}
