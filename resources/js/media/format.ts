export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDimensions(asset: { width?: number | null; height?: number | null }): string {
    if (!asset.width || !asset.height) return '';
    return `${asset.width}×${asset.height}`;
}

export function absoluteUrl(path?: string | null): string {
    if (!path) return '';
    if (/^[a-z][a-z\d+\-.]*:/i.test(path)) return path;

    try {
        return new URL(path, window.location.origin).href;
    } catch {
        return path;
    }
}
