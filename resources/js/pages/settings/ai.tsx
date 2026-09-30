import { Head, router, useForm } from '@inertiajs/react';
import { Check, CheckCircle2, Copy, KeyRound, Radio, ShieldCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

interface AiProviderStatus {
    configured: boolean;
    enabled?: boolean;
    connected: boolean;
    status: string;
    provider?: string;
    providerLabel?: string;
    model?: string;
    source?: string | null;
    client?: string | null;
}

interface AiStatus {
    openai: AiProviderStatus;
    mcp: AiProviderStatus;
}

interface McpPromptOption {
    id: string;
    title: string;
    description: string;
    content: string;
}

interface AiProviderOption {
    id: string;
    label: string;
    defaultModel: string;
    keyPlaceholder: string;
    models: string[];
    envKey: string | null;
}

export default function AiSettingsPage({
    aiStatus,
    settings,
}: {
    aiStatus: AiStatus;
    settings: {
        aiProvider: string;
        aiModel: string;
        aiEnabled: boolean;
        hasDatabaseAiKey: boolean;
        providers: AiProviderOption[];
        mcpEnabled: boolean;
        mcpEndpoint: string;
        requiresMigration?: boolean;
    };
}) {
    const form = useForm<{
        ai_provider: string;
        ai_api_key: string;
        ai_model: string;
        ai_enabled: boolean;
        clear_ai_api_key: boolean;
        mcp_enabled: boolean;
    }>({
        ai_provider: settings.aiProvider,
        ai_api_key: '',
        ai_model: settings.aiModel,
        ai_enabled: settings.aiEnabled,
        clear_ai_api_key: false,
        mcp_enabled: settings.mcpEnabled,
    });
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI settings', href: route('ai.settings.edit') }];
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const selectedProvider = settings.providers.find((provider) => provider.id === form.data.ai_provider) ?? settings.providers[0];
    const availableModels = Array.from(new Set([...(selectedProvider?.models ?? []), form.data.ai_model].filter(Boolean)));
    const mcpPromptOptions = useMemo(() => buildMcpPromptOptions(settings.mcpEndpoint), [settings.mcpEndpoint]);

    const copyPrompt = async (id: string, content: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedPromptId(id);
        window.setTimeout(() => setCopiedPromptId((current) => (current === id ? null : current)), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI settings" />
            <SettingsLayout>
                <div className="space-y-7">
                    <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <HeadingSmall
                            title="AI Settings"
                            description="Configure server-side OpenAI access and prepare external AI connections through MCP."
                        />
                        <StatusPill label="AI" status={aiStatus.openai} />
                    </div>

                    {settings.requiresMigration ? (
                        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs leading-5 font-medium text-amber-700 dark:text-amber-300">
                            AI settings storage is not migrated yet. Run `php artisan migrate`, then return here to save OpenAI or MCP settings.
                        </div>
                    ) : null}

                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch(route('ai.settings.update'), {
                                preserveScroll: true,
                                onSuccess: () => form.setData('ai_api_key', ''),
                            });
                        }}
                    >
                        <section className="border-border bg-background/40 space-y-4 rounded-2xl border p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                                    <KeyRound className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold">AI provider</h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        Choose the provider and model HelloWeb should use. The key is encrypted and never sent back to the browser.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ai_provider">Provider</Label>
                                <select
                                    id="ai_provider"
                                    className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-sm"
                                    value={form.data.ai_provider}
                                    onChange={(event) => {
                                        const provider = settings.providers.find((option) => option.id === event.target.value);
                                        form.setData((data) => ({
                                            ...data,
                                            ai_provider: event.target.value,
                                            ai_model: provider?.defaultModel ?? provider?.models[0] ?? data.ai_model,
                                            ai_api_key: '',
                                            clear_ai_api_key: false,
                                        }));
                                    }}
                                >
                                    {settings.providers.map((provider) => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.ai_provider} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ai_api_key">{selectedProvider?.label ?? 'AI'} API key</Label>
                                <Input
                                    id="ai_api_key"
                                    type="password"
                                    autoComplete="off"
                                    value={form.data.ai_api_key}
                                    placeholder={settings.hasDatabaseAiKey ? 'Saved encrypted key' : (selectedProvider?.keyPlaceholder ?? 'API key')}
                                    onChange={(event) => {
                                        form.setData('ai_api_key', event.target.value);
                                        if (event.target.value !== '') form.setData('clear_ai_api_key', false);
                                    }}
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-muted-foreground text-[11px]">
                                        Source:{' '}
                                        {aiStatus.openai.source === 'database'
                                            ? 'encrypted database key'
                                            : aiStatus.openai.source === 'environment'
                                              ? selectedProvider?.envKey
                                              : 'none'}
                                    </p>
                                    {settings.hasDatabaseAiKey ? (
                                        <label className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                                            <input
                                                type="checkbox"
                                                checked={form.data.clear_ai_api_key}
                                                onChange={(event) => form.setData('clear_ai_api_key', event.target.checked)}
                                            />
                                            Clear saved key
                                        </label>
                                    ) : null}
                                </div>
                                <InputError message={form.errors.ai_api_key} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ai_model">Model</Label>
                                <select
                                    id="ai_model"
                                    className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-sm"
                                    value={form.data.ai_model}
                                    onChange={(event) => form.setData('ai_model', event.target.value)}
                                >
                                    {availableModels.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.ai_model} />
                            </div>

                            <label className="border-border bg-card flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold">
                                Enable HelloWeb AI
                                <input
                                    type="checkbox"
                                    checked={form.data.ai_enabled}
                                    onChange={(event) => form.setData('ai_enabled', event.target.checked)}
                                />
                            </label>
                        </section>

                        <section className="border-border bg-background/40 space-y-4 rounded-2xl border p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
                                    <Radio className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold">MCP</h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                                        MCP server transport and authenticated sessions are not enabled until a real MCP server adapter is installed.
                                    </p>
                                </div>
                            </div>

                            <div className="border-border bg-card rounded-xl border p-3 text-xs">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold">Endpoint</span>
                                    <div className="flex min-w-0 items-center gap-2">
                                        <code className="bg-muted truncate rounded px-2 py-1 text-[11px]">{settings.mcpEndpoint}</code>
                                        <button
                                            type="button"
                                            className="border-border bg-background text-muted-foreground hover:text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-lg border"
                                            onClick={() => copyPrompt('endpoint', settings.mcpEndpoint)}
                                            aria-label="Copy MCP endpoint"
                                        >
                                            {copiedPromptId === 'endpoint' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="font-semibold">Status</span>
                                    <StatusPill label="MCP" status={aiStatus.mcp} />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {mcpPromptOptions.map((option) => (
                                    <div key={option.id} className="border-border bg-card flex flex-col gap-3 rounded-xl border p-3">
                                        <div>
                                            <h3 className="text-sm font-bold">{option.title}</h3>
                                            <p className="text-muted-foreground mt-1 text-xs leading-5">{option.description}</p>
                                        </div>
                                        <pre className="border-border bg-muted/50 max-h-28 overflow-auto rounded-lg border p-2 text-[11px] leading-5 whitespace-pre-wrap">
                                            {option.content}
                                        </pre>
                                        <Button type="button" variant="outline" size="sm" onClick={() => copyPrompt(option.id, option.content)}>
                                            {copiedPromptId === option.id ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <label className="border-border bg-card flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold">
                                Prepare MCP configuration
                                <input
                                    type="checkbox"
                                    checked={form.data.mcp_enabled}
                                    onChange={(event) => form.setData('mcp_enabled', event.target.checked)}
                                />
                            </label>
                        </section>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save AI Settings'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.post(route('ai.settings.openai.test'))}>
                                Test AI Connection
                            </Button>
                            {form.recentlySuccessful ? <span className="text-xs font-medium text-emerald-600">Settings saved</span> : null}
                        </div>
                    </form>

                    <div className="border-primary/20 bg-primary/5 text-muted-foreground rounded-2xl border p-4 text-xs leading-5">
                        <div className="text-foreground mb-1 flex items-center gap-2 font-bold">
                            <ShieldCheck className="text-primary size-4" />
                            Security boundary
                        </div>
                        AI providers and MCP will use HelloWeb editor commands. They do not receive database credentials, API keys, PHP execution, SQL
                        execution, or filesystem access.
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function buildMcpPromptOptions(endpoint: string): McpPromptOption[] {
    return [
        {
            id: 'chatgpt',
            title: 'ChatGPT',
            description: 'Prompt for adding HelloWeb as an MCP connection in an AI workspace.',
            content: `Connect to my HelloWeb MCP server.

Server name: HelloWeb
Transport: Streamable HTTP
URL: ${endpoint}

Use this connection only to inspect and edit my authorized HelloWeb builder pages through the exposed editor tools. Do not ask for database credentials, API keys, PHP execution, SQL execution, or filesystem access.`,
        },
        {
            id: 'claude',
            title: 'Claude',
            description: 'Config-style prompt for Claude or clients that accept MCP server details.',
            content: `Add this MCP server:

name: helloweb
transport: streamable_http
url: ${endpoint}

Only call tools that are exposed by HelloWeb. Treat the server as an editor command API, not as direct database or filesystem access.`,
        },
        {
            id: 'cursor',
            title: 'Cursor',
            description: 'JSON snippet for MCP clients that store named server definitions.',
            content: `{
  "mcpServers": {
    "helloweb": {
      "transport": "streamable_http",
      "url": "${endpoint}"
    }
  }
}`,
        },
        {
            id: 'antigravity',
            title: 'Antigravity',
            description: 'PowerShell command for the Antigravity CLI.',
            content: `agy mcp add HelloWeb ${endpoint}

# Optional explicit type:
agy mcp add --type http HelloWeb ${endpoint}`,
        },
        {
            id: 'generic',
            title: 'Generic AI',
            description: 'Plain connection brief for any AI tool that supports external MCP servers.',
            content: `Use the HelloWeb MCP server for builder edits.

Endpoint: ${endpoint}
Transport: Streamable HTTP over HTTPS
Scope: authenticated HelloWeb editor commands only
Security: no database credentials, API keys, PHP execution, SQL execution, or filesystem access`,
        },
    ];
}

function StatusPill({ label, status }: { label: string; status: AiProviderStatus }) {
    const connected = status.connected;
    const Icon = connected ? CheckCircle2 : XCircle;
    const statusText = connected ? (status.status === 'available' ? 'Available' : 'Connected') : status.status.replaceAll('_', ' ');

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                connected ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' : 'border-border bg-muted text-muted-foreground'
            }`}
        >
            <Icon className="size-3.5" />
            {label} {statusText}
        </span>
    );
}
