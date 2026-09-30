import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PromptDialogProps {
    open: boolean;
    title: string;
    description?: string;
    label: string;
    placeholder?: string;
    initialValue?: string;
    confirmLabel?: string;
    error?: string | null;
    onCancel: () => void;
    onSubmit: (value: string) => void | Promise<void>;
}

export function PromptDialog({
    open,
    title,
    description,
    label,
    placeholder,
    initialValue,
    confirmLabel = 'Save',
    error,
    onCancel,
    onSubmit,
}: PromptDialogProps) {
    const [value, setValue] = useState(initialValue ?? '');
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setValue(initialValue ?? '');
            setSubmitting(false);
        }
    }, [open, initialValue]);

    const submit = async () => {
        const trimmed = value.trim();
        if (trimmed === '' || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit(trimmed);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onCancel();
            }}
        >
            <DialogContent className="z-[60] w-[min(100%,26rem)] gap-4 rounded-xl sm:rounded-xl" onOpenAutoFocus={() => inputRef.current?.select()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="prompt-dialog-input">{label}</Label>
                    <Input
                        id="prompt-dialog-input"
                        ref={inputRef}
                        value={value}
                        placeholder={placeholder}
                        autoComplete="off"
                        disabled={submitting}
                        onChange={(event) => setValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                void submit();
                            }
                        }}
                    />
                    {error ? <p className="text-destructive text-xs" role="alert">{error}</p> : null}
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" size="sm" disabled={submitting || value.trim() === ''} onClick={() => void submit()}>
                        {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    destructive?: boolean;
    error?: string | null;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Delete',
    destructive = true,
    error,
    onCancel,
    onConfirm,
}: ConfirmDialogProps) {
    const [submitting, setSubmitting] = useState(false);

    const confirm = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await onConfirm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onCancel();
            }}
        >
            <DialogContent className="z-[60] w-[min(100%,26rem)] gap-4 rounded-xl sm:rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-6">
                        {destructive ? (
                            <span className="bg-destructive/10 text-destructive flex size-7 shrink-0 items-center justify-center rounded-full">
                                <AlertTriangle className="size-4" />
                            </span>
                        ) : null}
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground leading-relaxed">{description}</DialogDescription>
                    {error ? <p className="text-destructive text-xs" role="alert">{error}</p> : null}
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={destructive ? 'destructive' : 'default'}
                        disabled={submitting}
                        onClick={() => void confirm()}
                    >
                        {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
