import type { MediaExplorerErrorBody } from './types';

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const isFormData = init?.body instanceof FormData;

    const response = await fetch(url, {
        ...init,
        headers: {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            ...(init?.headers ?? {}),
        },
    });

    const payload = (await response.json().catch(() => ({}))) as T & MediaExplorerErrorBody;

    if (!response.ok) {
        const validation = payload.errors ? Object.values(payload.errors).flat().join(' ') : null;
        throw new Error(validation || payload.message || 'The request failed.');
    }

    return payload;
}
