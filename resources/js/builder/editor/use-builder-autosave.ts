import { useCallback, useEffect, useRef, useState } from 'react';

import type { BuilderPageDocument } from '../document';

export type BuilderSaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface AutosaveResult {
    status: BuilderSaveStatus;
    error: string | null;
    version: number;
    retry: () => void;
    saveNow: () => Promise<boolean>;
    sync: (document: BuilderPageDocument, version: number) => void;
    cancelPending: () => void;
}

export function useBuilderAutosave(
    builderDocument: BuilderPageDocument,
    pageId: number | null,
    initialVersion = 0,
    saveUrl?: string,
    onSaveSuccess?: (payload: { template?: { id: number; name?: string; slug?: string; type?: string; description?: string | null }; page?: { id: number; version?: number } }) => void
): AutosaveResult {
    const [status, setStatus] = useState<BuilderSaveStatus>('saved');
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(initialVersion);
    const versionRef = useRef(initialVersion);
    const lastSavedRef = useRef(JSON.stringify(builderDocument));
    const pendingRef = useRef(builderDocument);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);

    // saveUrl can change at runtime (e.g. when a platform template is forked and
    // the editor re-points at the new id). Keep it in a ref so `flush` stays
    // referentially stable and the debounced timer never captures a stale one.
    const saveUrlRef = useRef(saveUrl);
    const onSaveSuccessRef = useRef(onSaveSuccess);

    useEffect(() => {
        saveUrlRef.current = saveUrl;
        onSaveSuccessRef.current = onSaveSuccess;
    }, [saveUrl, onSaveSuccess]);

    const cancelPending = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const schedule = useCallback((delay = 650) => {
        cancelPending();
        timerRef.current = setTimeout(() => void flush(), delay);
    }, [cancelPending]);

    const flush = useCallback(async (): Promise<boolean> => {
        const targetUrl = saveUrlRef.current ?? (pageId ? route('builder.pages.document.update', pageId) : null);
        if (!targetUrl) return false;

        // If a save request is already in progress, wait for it before proceeding
        if (inFlightPromiseRef.current) {
            try {
                await inFlightPromiseRef.current;
            } catch {
                // Ignore failure of previous flush; next attempt will evaluate fresh snapshot
            }
            if (JSON.stringify(pendingRef.current) === lastSavedRef.current) {
                return true;
            }
        }

        cancelPending();

        const doSave = async (): Promise<boolean> => {
            const snapshot = pendingRef.current;
            setStatus('saving');
            setError(null);

            try {
                const response = await fetch(targetUrl, {
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
                    // When 409 Conflict occurs, server provides the actual current version in payload.save.version
                    if (response.status === 409 && typeof payload.save?.version === 'number') {
                        versionRef.current = payload.save.version;
                        setVersion(payload.save.version);
                    }
                    const validationMessage = Object.values(payload.errors ?? {})
                        .flat()
                        .join(' ');
                    throw new Error(validationMessage || payload.message || 'Unable to save the document.');
                }

                const nextVersion = payload.save?.version ?? versionRef.current + 1;
                versionRef.current = nextVersion;
                setVersion(nextVersion);
                lastSavedRef.current = JSON.stringify(snapshot);
                setStatus(JSON.stringify(pendingRef.current) === lastSavedRef.current ? 'saved' : 'unsaved');
                onSaveSuccessRef.current?.(payload as any);
                return true;
            } catch (caught) {
                setStatus('error');
                setError(caught instanceof Error ? caught.message : 'Unable to save the document.');
                return false;
            } finally {
                inFlightPromiseRef.current = null;
                if (JSON.stringify(pendingRef.current) !== lastSavedRef.current) {
                    setStatus('unsaved');
                }
            }
        };

        const promise = doSave();
        inFlightPromiseRef.current = promise;
        return promise;
    }, [pageId, schedule, cancelPending]);

    useEffect(() => {
        pendingRef.current = builderDocument;
        if (!pageId || JSON.stringify(builderDocument) === lastSavedRef.current) return;
        setStatus('unsaved');
    }, [builderDocument, pageId]);

    const retry = useCallback(() => {
        if (!pageId) return;
        setStatus('unsaved');
        setError(null);
        void flush();
    }, [pageId, flush]);

    const saveNow = useCallback(async (): Promise<boolean> => {
        if (!pageId) return true;
        cancelPending();
        return await flush();
    }, [pageId, cancelPending, flush]);

    const sync = useCallback((nextDocument: BuilderPageDocument, nextVersion: number) => {
        cancelPending();
        pendingRef.current = nextDocument;
        lastSavedRef.current = JSON.stringify(nextDocument);
        versionRef.current = nextVersion;
        setVersion(nextVersion);
        setStatus('saved');
        setError(null);
    }, [cancelPending]);

    return { status, error, version, retry, saveNow, sync, cancelPending };
}
