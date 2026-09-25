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

export function useBuilderAutosave(builderDocument: BuilderPageDocument, pageId: number | null, initialVersion = 0): AutosaveResult {
    const [status, setStatus] = useState<BuilderSaveStatus>('saved');
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(initialVersion);
    const versionRef = useRef(initialVersion);
    const lastSavedRef = useRef(JSON.stringify(builderDocument));
    const pendingRef = useRef(builderDocument);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);

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
        if (!pageId) return false;

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
                return true;
            } catch (caught) {
                setStatus('error');
                setError(caught instanceof Error ? caught.message : 'Unable to save the document.');
                return false;
            } finally {
                inFlightPromiseRef.current = null;
                if (JSON.stringify(pendingRef.current) !== lastSavedRef.current) {
                    schedule(300);
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
