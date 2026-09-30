import { Bot, CheckCircle2, Hammer, Loader2, MessageSquareText, Send, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { BuilderPageDocument } from '../document';

interface BuilderAiPanelProps {
    width: number;
    pageId: number | null;
    document: BuilderPageDocument;
    selectedNodeId: string | null;
    connected: boolean;
    providerLabel?: string;
    onBeforeApply?: () => Promise<boolean>;
    onApplyDocument?: (document: BuilderPageDocument, version: number) => void;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type BuilderAiCommand = Record<string, unknown>;

export function BuilderAiPanel({
    width,
    pageId,
    document,
    selectedNodeId,
    connected,
    providerLabel,
    onBeforeApply,
    onApplyDocument,
}: BuilderAiPanelProps) {
    const storageKey = useMemo(() => `helloweb.builder.ai-chat.${pageId ?? 'draft'}`, [pageId]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'plan' | 'build'>('plan');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: connected
                ? 'Ask me about this page, the selected element, layout, copy, styling, or what to change next.'
                : 'Connect an AI provider in Settings before using builder chat.',
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading, error, progress]);

    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(storageKey);
            if (!saved) return;
            const parsed = JSON.parse(saved) as { messages?: ChatMessage[]; mode?: 'plan' | 'build' };
            if (Array.isArray(parsed.messages) && parsed.messages.length > 0) setMessages(parsed.messages);
            if (parsed.mode === 'plan' || parsed.mode === 'build') setMode(parsed.mode);
        } catch {
            // Ignore invalid saved chat state.
        }
    }, [storageKey]);

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({ messages: messages.slice(-30), mode }));
        } catch {
            // Ignore storage quota/private mode failures.
        }
    }, [messages, mode, storageKey]);

    const send = async () => {
        const message = input.trim();
        if (!message || !pageId || loading || !connected) return;

        const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);
        setProgress(null);
        setError(null);

        try {
            const wantsApply =
                mode === 'build' && /\b(do it|apply|change|update|edit|redesign|improve|make it|fix|create|add|remove|delete|move)\b/i.test(message);
            if (wantsApply && onBeforeApply) {
                const saved = await onBeforeApply();
                if (!saved) {
                    throw new Error('Save the current draft before AI can apply changes.');
                }
            }

            if (wantsApply) {
                await buildWithRealtimeUpdates(message, messages);
                return;
            }

            const response = await fetch(route('builder.pages.ai-chat', pageId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    message,
                    mode,
                    document,
                    selectedNodeId,
                    history: messages
                        .slice(1)
                        .slice(-8)
                        .map(({ role, content }) => ({ role, content })),
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message ?? 'AI chat failed.');
            }

            const applied = Number(data.applied ?? 0);
            if (data.document && typeof data.version === 'number' && onApplyDocument) {
                onApplyDocument(data.document as BuilderPageDocument, data.version);
            }

            const report =
                applied > 0
                    ? `\n\nDraft updated: ${applied} builder ${applied === 1 ? 'command' : 'commands'} applied. Click Publish when you want this live.`
                    : '';
            setMessages((current) => [...current, { role: 'assistant', content: `${String(data.reply ?? '')}${report}` }]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'AI chat failed.');
        } finally {
            setProgress(null);
            setLoading(false);
        }
    };

    const buildWithRealtimeUpdates = async (message: string, historyMessages: ChatMessage[]) => {
        if (!pageId) return;

        const planResponse = await fetch(route('builder.pages.ai-chat.plan', pageId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({
                message,
                document,
                selectedNodeId,
                history: historyMessages
                    .slice(1)
                    .slice(-8)
                    .map(({ role, content }) => ({ role, content })),
            }),
        });

        const planData = await planResponse.json().catch(() => ({}));
        if (!planResponse.ok) {
            throw new Error(planData.message ?? 'AI could not prepare builder commands.');
        }

        const commands = Array.isArray(planData.commands) ? (planData.commands as BuilderAiCommand[]) : [];
        setProgress({ current: 0, total: commands.length });
        setMessages((current) => [
            ...current,
            {
                role: 'assistant',
                content: `${String(planData.reply ?? 'I prepared draft changes.')}\n\nExecuting ${commands.length} builder ${
                    commands.length === 1 ? 'command' : 'commands'
                }...`,
            },
        ]);

        let currentDocument = document;
        let applied = 0;
        const idMap: Record<string, string> = {};

        for (let index = 0; index < commands.length; index += 1) {
            const command = commands[index];
            const assignId = typeof command.assignId === 'string' ? command.assignId : null;
            setProgress({ current: index + 1, total: commands.length });
            const executeResponse = await fetch(route('builder.pages.ai-chat.execute', pageId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ command, idMap }),
            });

            const executeData = await executeResponse.json().catch(() => ({}));
            if (!executeResponse.ok) {
                throw new Error(executeData.message ?? 'A builder command failed.');
            }

            // Track placeholder → real ID mapping for subsequent commands
            if (assignId && typeof executeData.createdId === 'string') {
                idMap[assignId] = executeData.createdId;
            }

            if (executeData.document && typeof executeData.version === 'number' && onApplyDocument) {
                currentDocument = executeData.document as BuilderPageDocument;
                onApplyDocument(currentDocument, executeData.version);
                applied += 1;
                await new Promise((resolve) => window.setTimeout(resolve, 120));
            }
        }

        setMessages((current) => [
            ...current,
            {
                role: 'assistant',
                content: `Draft updated: ${applied} builder ${applied === 1 ? 'command' : 'commands'} applied. Click Publish when you want this live.`,
            },
        ]);
    };

    return (
        <aside
            className="bg-card text-card-foreground border-border flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l"
            style={{ width: `${width}px` }}
            aria-label="Builder AI chat"
        >
            <div className="border-border bg-background/50 shrink-0 border-b px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-primary text-[10px] font-bold tracking-[0.14em] uppercase">AI Console</p>
                        <h2 className="mt-0.5 text-sm font-bold">Builder Chat</h2>
                        <p className="text-muted-foreground mt-1 truncate text-[11px]">
                            {selectedNodeId ? `Selected ${selectedNodeId}` : 'No element selected'}
                        </p>
                    </div>
                    <span className="border-border bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold">
                        <Sparkles className="size-3" />
                        {providerLabel ?? 'Provider'}
                    </span>
                </div>
            </div>

            <div className="border-border flex shrink-0 items-center justify-between border-b px-3 py-2 text-[11px]">
                <div className="text-muted-foreground flex min-w-0 items-center gap-2">
                    <MessageSquareText className="size-3.5 shrink-0" />
                    <span className="truncate">{messages.length > 1 ? `${messages.length - 1} saved messages` : 'Session saved here'}</span>
                </div>
                <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-semibold"
                    onClick={() => {
                        const fresh: ChatMessage[] = [
                            {
                                role: 'assistant',
                                content: connected
                                    ? 'Ask me about this page, the selected element, layout, copy, styling, or what to change next.'
                                    : 'Connect an AI provider in Settings before using builder chat.',
                            },
                        ];
                        setMessages(fresh);
                        setError(null);
                        window.localStorage.removeItem(storageKey);
                    }}
                >
                    <Trash2 className="size-3.5" />
                    Clear
                </button>
            </div>

            <div ref={scrollRef} className="bg-background/20 min-h-0 flex-1 space-y-3 overflow-y-auto scroll-smooth p-3">
                {messages.map((message, index) => (
                    <div
                        key={`${message.role}-${index}`}
                        className={`border px-3 py-2.5 text-xs leading-5 shadow-xs ${
                            message.role === 'user'
                                ? 'border-primary/20 bg-primary text-primary-foreground ml-8 rounded-2xl rounded-tr-md'
                                : 'border-border bg-card text-card-foreground mr-6 rounded-2xl rounded-tl-md'
                        }`}
                    >
                        {message.role === 'assistant' ? (
                            <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase">
                                <Bot className="text-primary size-3" />
                                Assistant
                            </div>
                        ) : null}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                ))}
                {loading ? (
                    <div className="border-border bg-card text-muted-foreground mr-6 rounded-2xl rounded-tl-md border px-3 py-2.5 text-xs shadow-xs">
                        <div className="flex items-center gap-2">
                            <Loader2 className="text-primary size-3.5 animate-spin" />
                            <span>{mode === 'build' ? 'Executing draft changes...' : 'Thinking...'}</span>
                        </div>
                        {progress ? (
                            <div className="mt-2">
                                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-[10px]">
                                    Command {progress.current} of {progress.total}
                                </p>
                            </div>
                        ) : null}
                    </div>
                ) : null}
                {error ? (
                    <div className="border-destructive/25 bg-destructive/10 text-destructive rounded-xl border px-3 py-2 text-xs">{error}</div>
                ) : null}
            </div>

            <div className="border-border bg-card shrink-0 border-t p-3">
                <div className="bg-muted mb-2 grid grid-cols-2 rounded-xl p-1" role="tablist" aria-label="AI mode">
                    {(['plan', 'build'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="tab"
                            aria-selected={mode === option}
                            className={`rounded-lg px-2 py-1.5 text-xs font-bold capitalize transition ${
                                mode === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setMode(option)}
                        >
                            <span className="inline-flex items-center justify-center gap-1.5">
                                {option === 'build' ? <Hammer className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                                {option}
                            </span>
                        </button>
                    ))}
                </div>
                <p className="text-muted-foreground mb-2 text-[11px] leading-4">
                    {mode === 'build'
                        ? 'Build can apply changes to the draft. You still publish manually.'
                        : 'Plan only explains and suggests changes.'}
                </p>
                <div className="border-input bg-background focus-within:border-primary flex gap-2 rounded-2xl border p-2">
                    <textarea
                        className="text-foreground placeholder:text-muted-foreground min-h-22 flex-1 resize-none bg-transparent px-1 py-1 text-xs leading-5 outline-hidden"
                        value={input}
                        placeholder={
                            connected
                                ? mode === 'build'
                                    ? 'Tell AI what to build in the draft...'
                                    : 'Ask for a plan, critique, or copy ideas...'
                                : 'Connect AI in Settings first'
                        }
                        disabled={!connected || loading}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                void send();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex size-10 shrink-0 items-center justify-center self-end rounded-xl shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!connected || loading || input.trim() === ''}
                        onClick={() => void send()}
                        aria-label="Send AI message"
                        title="Send (Enter). New line: Shift+Enter"
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
