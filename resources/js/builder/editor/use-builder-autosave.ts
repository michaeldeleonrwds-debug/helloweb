import { useCallback, useEffect, useRef, useState } from 'react';

import type { BuilderPageDocument } from '../document';

export type BuilderSaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface AutosaveResult {
    status: BuilderSaveStatus;
    error: string | null;
    version: number;
    retry: () => void;
    saveNow: () => void;
    sync: (document: BuilderPageDocument, version: number) => void;
}

export function useBuilderAutosave(builderDocument: BuilderPageDocument, pageId: number | null, initialVersion = 0): AutosaveResult {
    const [status, setStatus] = useState<BuilderSaveStatus>('saved');
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(initialVersion);
    const versionRef = useRef(initialVersion);
    const lastSavedRef = useRef(JSON.stringify(builderDocument));
    const pendingRef = useRef(builderDocument);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savingRef = useRef(false);

    const schedule = useCallback((delay = 650) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void flush(), delay);
    }, []);

    const flush = useCallback(async () => {
        if (!pageId || savingRef.current) return;
        savingRef.current = true;
        const snapshot = pendingRef.current;
        let succeeded = false;
        setStatus('saving');
        setError(null);

        try {
            const response = await fetch(route('builder.pages.document.update', pageId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ document: snapshot, expected_version: versionRef.current }),
            });
            const payload = (await response.json()) as {
                message?: string;
                errors?: Record<string, string[]>;
                save?: { status?: string; version?: number };
            };
            if (!response.ok) {
                const validationMessage = Object.values(payload.errors ?? {})
                    .flat()
                    .join(' ');
                console.error('Builder save rejected', response.status, payload);
                throw new Error(validationMessage || payload.message || 'Unable to save the document.');
            }

            const nextVersion = payload.save?.version ?? versionRef.current + 1;
            versionRef.current = nextVersion;
            setVersion(nextVersion);
            lastSavedRef.current = JSON.stringify(snapshot);
            succeeded = true;
            setStatus(JSON.stringify(pendingRef.current) === lastSavedRef.current ? 'saved' : 'unsaved');
        } catch (caught) {
            setStatus('error');
            setError(caught instanceof Error ? caught.message : 'Unable to save the document.');
        } finally {
            savingRef.current = false;
            if (succeeded && JSON.stringify(pendingRef.current) !== lastSavedRef.current) schedule(0);
        }
    }, [pageId, schedule]);

    useEffect(() => {
        pendingRef.current = builderDocument;
        if (!pageId || JSON.stringify(builderDocument) === lastSavedRef.current) return;
        setStatus('unsaved');
        schedule();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [builderDocument, pageId, schedule]);

    const retry = useCallback(() => {
        if (!pageId) return;
        setStatus('unsaved');
        schedule(0);
    }, [pageId, schedule]);

    const saveNow = useCallback(() => {
        if (!pageId) return;
        schedule(0);
    }, [pageId, schedule]);

    const sync = useCallback((nextDocument: BuilderPageDocument, nextVersion: number) => {
        pendingRef.current = nextDocument;
        lastSavedRef.current = JSON.stringify(nextDocument);
        versionRef.current = nextVersion;
        setVersion(nextVersion);
        setStatus('saved');
        setError(null);
    }, []);

    return { status, error, version, retry, saveNow, sync };
}
