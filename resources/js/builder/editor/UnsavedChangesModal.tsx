import { AlertTriangle, Check, Loader2, X } from 'lucide-react';

export interface UnsavedChangesModalProps {
    open: boolean;
    onClose: () => void;
    onDiscard: () => void;
    onSaveAndLeave: () => void;
    isSaving?: boolean;
}

export function UnsavedChangesModal({
    open,
    onClose,
    onDiscard,
    onSaveAndLeave,
    isSaving = false,
}: UnsavedChangesModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-modal-title"
        >
            <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all">
                {/* Close 'X' button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    title="Close"
                    aria-label="Close dialog"
                >
                    <X className="size-4" />
                </button>

                {/* Dialog Content */}
                <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <AlertTriangle className="size-5" />
                    </div>
                    <div className="space-y-1.5 pt-0.5">
                        <h3 id="unsaved-modal-title" className="text-base font-semibold text-foreground">
                            You have unsaved changes
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Leaving the builder now will discard any unsaved edits made on this page. Would you like to save your changes before returning to the dashboard?
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        Keep editing
                    </button>

                    <button
                        type="button"
                        onClick={onDiscard}
                        className="rounded-lg border border-destructive/30 px-3.5 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                    >
                        Discard & leave
                    </button>

                    <button
                        type="button"
                        onClick={onSaveAndLeave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-2xs transition hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                        <span>{isSaving ? 'Saving...' : 'Save & leave'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UnsavedChangesModal;
