import { Keyboard, X } from 'lucide-react';
import React, { useEffect, useId } from 'react';

interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    const titleId = useId();

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const shortcuts: { category: string; items: { keys: string[]; description: string }[] }[] = [
        {
            category: 'History & Editing',
            items: [
                { keys: ['Ctrl', 'S'], description: 'Save current draft' },
                { keys: ['Ctrl', 'Z'], description: 'Undo last document change' },
                { keys: ['Ctrl', 'Y'], description: 'Redo last undone change' },
                { keys: ['Ctrl', 'Shift', 'Z'], description: 'Alternative Redo shortcut' },
                { keys: ['Ctrl', 'D'], description: 'Duplicate currently selected element' },
                { keys: ['Ctrl', 'C'], description: 'Copy selected element to clipboard' },
                { keys: ['Ctrl', 'V'], description: 'Paste copied element into container' },
                { keys: ['Delete'], description: 'Remove currently selected element' },
                { keys: ['Escape'], description: 'Deselect element / Close modal' },
            ],
        },
        {
            category: 'Arrangement & Navigation',
            items: [
                { keys: ['↑'], description: 'Move element up among siblings' },
                { keys: ['↓'], description: 'Move element down among siblings' },
                { keys: ['Double Click'], description: 'Direct inline text editing on canvas' },
            ],
        },
        {
            category: 'Shortcuts & Tools',
            items: [
                { keys: ['Ctrl', '/'], description: 'Toggle this keyboard shortcuts dialog' },
                { keys: ['Click Breadcrumb'], description: 'Climb up element hierarchy in footer bar' },
            ],
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/80 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Keyboard className="size-4" />
                        </div>
                        <div>
                            <h2 id={titleId} className="text-sm font-bold text-foreground">
                                Keyboard Shortcuts
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Fast navigation and editing shortcuts in Visual Studio
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        aria-label="Close"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
                    {shortcuts.map((group) => (
                        <div key={group.category} className="space-y-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {group.category}
                            </h3>
                            <div className="rounded-xl border border-border/80 bg-muted/20 divide-y divide-border/60 overflow-hidden">
                                {group.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                                        <span className="text-foreground font-medium">{item.description}</span>
                                        <div className="flex items-center gap-1">
                                            {item.keys.map((k, kIdx) => (
                                                <kbd
                                                    key={kIdx}
                                                    className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-card px-1.5 font-mono text-[10px] font-semibold text-foreground shadow-2xs"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-5 py-3 text-xs">
                    <span className="text-muted-foreground text-[11px]">HelloWeb Visual Builder</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-2xs"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcutsModal;
