import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    Code,
    ExternalLink,
    FileArchive,
    FileCode,
    FileText,
    Image,
    Layers,
    Loader2,
    Palette,
    Sparkles,
    UploadCloud,
    X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ImportType = 'component' | 'template';

interface AnalysisResult {
    type: ImportType;
    name: string;
    htmlFiles: string[];
    cssFiles: string[];
    jsFiles: string[];
    assetFiles: string[];
    detectedLibraries: string[];
    unsupportedInteractions: string[];
    detectedProps: Record<string, any>;
    pagesCount: number;
}

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialType?: ImportType;
    onSuccess?: (result: { type: ImportType; id: number; name: string }) => void;
}

export function ImportModal({
    open,
    onOpenChange,
    initialType = 'component',
    onSuccess,
}: ImportModalProps) {
    const [selectedType, setSelectedType] = useState<ImportType>(initialType);
    const [step, setStep] = useState<'type' | 'upload' | 'analyzing' | 'preview' | 'importing' | 'success'>('type');
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [customName, setCustomName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [importedResult, setImportedResult] = useState<{ id: number; name: string; type: ImportType } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync initialType when modal opens
    React.useEffect(() => {
        if (open) {
            setSelectedType(initialType);
            setStep('type');
            setFile(null);
            setAnalysis(null);
            setError(null);
            setImportedResult(null);
        }
    }, [open, initialType]);

    const handleFileSelected = async (selectedFile: File) => {
        if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
            setError('Please upload a valid ZIP archive containing your design files.');
            return;
        }

        setError(null);
        setFile(selectedFile);
        setCustomName(selectedFile.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' '));
        setStep('analyzing');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', selectedType);

        try {
            const res = await fetch(route('builder.import.analyze'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to analyze package.');
            }

            setAnalysis(data.analysis);
            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Error parsing ZIP archive. Please ensure it contains HTML and assets.');
            setStep('upload');
        }
    };

    const handleConfirmImport = async () => {
        if (!file) return;

        setStep('importing');
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        if (customName.trim()) {
            formData.append('name', customName.trim());
        }

        const endpoint = selectedType === 'template' 
            ? route('builder.import.template') 
            : route('builder.import.component');

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Import process encountered an error.');
            }

            const item = data.component || data.template;
            const resObj = { id: item.id, name: item.name, type: selectedType };
            setImportedResult(resObj);
            setStep('success');

            if (onSuccess) {
                onSuccess(resObj);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to complete import.');
            setStep('preview');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-card border-border p-0 overflow-hidden shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="p-6 border-b border-border/80 bg-muted/20">
                    <DialogHeader>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <UploadCloud className="size-4.5 stroke-[2.2]" />
                            </div>
                            <DialogTitle className="text-lg font-extrabold text-foreground">
                                Import into HelloWeb
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Convert pre-built web designs into native, responsive visual builder blocks or complete website templates.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    {/* Step 1: Type Selection */}
                    {step === 'type' && (
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Step 1: Choose Import Target
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Component Card */}
                                <div
                                    onClick={() => setSelectedType('component')}
                                    className={`relative cursor-pointer rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                                        selectedType === 'component'
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <Sparkles className="size-4.5" />
                                            </div>
                                            {selectedType === 'component' && (
                                                <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                    <Check className="size-3 stroke-[3]" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-extrabold text-sm text-foreground mb-1">
                                            Component
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            A reusable section, hero, testimonial carousel, pricing card, or navbar to insert into any page.
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Layers className="size-3 text-amber-500" />
                                        <span>Scoped styles & editable props</span>
                                    </div>
                                </div>

                                {/* Template Card */}
                                <div
                                    onClick={() => setSelectedType('template')}
                                    className={`relative cursor-pointer rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                                        selectedType === 'template'
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <FileArchive className="size-4.5" />
                                            </div>
                                            {selectedType === 'template' && (
                                                <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                    <Check className="size-3 stroke-[3]" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-extrabold text-sm text-foreground mb-1">
                                            Template
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            A complete multi-page ready-made website structure with global headers, footers, and assets.
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Code className="size-3 text-blue-500" />
                                        <span>Global head/footer code & multi-page</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setStep('upload')}
                                    className="rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground hover:brightness-105"
                                >
                                    <span>Continue to Upload</span>
                                    <ArrowRight className="size-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: ZIP Upload */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Step 2: Upload Design Package ({selectedType})
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setStep('type')}
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    Change type
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".zip"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleFileSelected(e.target.files[0]);
                                    }
                                }}
                            />

                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    if (e.dataTransfer.files?.[0]) {
                                        handleFileSelected(e.dataTransfer.files[0]);
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                                    dragActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
                                }`}
                            >
                                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                                    <UploadCloud className="size-7 stroke-[2]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Drag & drop your design ZIP here, or <span className="text-primary underline">browse</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports packages containing HTML, CSS, JS, and image assets (Max 50MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Analyzing */}
                    {step === 'analyzing' && (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                            <Loader2 className="size-8 text-primary animate-spin" />
                            <h3 className="font-extrabold text-base text-foreground">
                                Analyzing Design Package...
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Extracting HTML structure, resolving external stylesheets, isolating scoped CSS, and detecting editable properties.
                            </p>
                        </div>
                    )}

                    {/* Step 4: Preview & Confirmation */}
                    {step === 'preview' && analysis && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Step 3: Verification & Ingestion Summary
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setStep('upload')}
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    Upload different file
                                </button>
                            </div>

                            {/* Name input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">
                                    Asset Name
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="e.g. Modern Pricing Card"
                                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-medium text-foreground outline-none focus:border-primary/50 focus:bg-card focus:ring-2 focus:ring-primary/10 transition"
                                />
                            </div>

                            {/* Breakdown Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                        <FileText className="size-3.5 text-primary" />
                                        <span className="text-[11px] font-semibold">HTML Pages</span>
                                    </div>
                                    <span className="text-base font-extrabold text-foreground">
                                        {analysis.htmlFiles.length}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                        <Palette className="size-3.5 text-blue-500" />
                                        <span className="text-[11px] font-semibold">Stylesheets</span>
                                    </div>
                                    <span className="text-base font-extrabold text-foreground">
                                        {analysis.cssFiles.length}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                        <Image className="size-3.5 text-emerald-500" />
                                        <span className="text-[11px] font-semibold">Asset Files</span>
                                    </div>
                                    <span className="text-base font-extrabold text-foreground">
                                        {analysis.assetFiles.length}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                        <Sparkles className="size-3.5 text-amber-500" />
                                        <span className="text-[11px] font-semibold">Editable Props</span>
                                    </div>
                                    <span className="text-base font-extrabold text-foreground">
                                        {Object.keys(analysis.detectedProps).length}
                                    </span>
                                </div>
                            </div>

                            {/* External Libraries & Dependencies */}
                            {analysis.detectedLibraries.length > 0 && (
                                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                        <Code className="size-3.5" />
                                        <span>Detected External Libraries</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {analysis.detectedLibraries.map((lib) => (
                                            <span
                                                key={lib}
                                                className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400"
                                            >
                                                {lib}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground pt-1">
                                        Dependencies will automatically merge into Header/Footer Code Containers.
                                    </p>
                                </div>
                            )}

                            {/* Unsupported Interactions Warning */}
                            {analysis.unsupportedInteractions.length > 0 && (
                                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                        <AlertCircle className="size-3.5" />
                                        <span>Interactive Elements Handled</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Special scripts ({analysis.unsupportedInteractions.join(', ')}) will be isolated safely in the code container to maintain canvas visual integrity.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep('upload')}
                                    className="rounded-full text-xs font-semibold"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleConfirmImport}
                                    className="rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground hover:brightness-105"
                                >
                                    <span>Confirm & Import {selectedType === 'template' ? 'Template' : 'Component'}</span>
                                    <CheckCircle2 className="size-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Ingesting */}
                    {step === 'importing' && (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                            <Loader2 className="size-8 text-primary animate-spin" />
                            <h3 className="font-extrabold text-base text-foreground">
                                Importing & Constructing Document...
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Transferring media assets to cloud storage and generating native HelloWeb tree nodes.
                            </p>
                        </div>
                    )}

                    {/* Step 6: Success */}
                    {step === 'success' && importedResult && (
                        <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="size-7 stroke-[2.5]" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-lg text-foreground">
                                    Import Completed!
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                                    <strong className="text-foreground font-semibold">{importedResult.name}</strong> has been successfully imported as a native{' '}
                                    <span className="capitalize">{importedResult.type}</span>.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="rounded-full text-xs font-semibold"
                                >
                                    Done
                                </Button>
                                {importedResult.type === 'template' ? (
                                    <Button
                                        asChild
                                        className="rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:brightness-105"
                                    >
                                        <a href="/templates">
                                            <span>View in Templates</span>
                                            <ArrowRight className="size-3.5 ml-1.5" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:brightness-105"
                                    >
                                        <a href="/reusable-components">
                                            <span>View in Reusable Blocks</span>
                                            <ArrowRight className="size-3.5 ml-1.5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
