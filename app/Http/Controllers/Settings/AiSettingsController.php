<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\AiConnectionStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

final class AiSettingsController extends Controller
{
    public function __construct(
        private readonly AiConnectionStatusService $status,
    ) {}

    public function edit(Request $request): Response
    {
        $setting = $this->status->settingsTableExists() ? $request->user()->aiSetting()->firstOrCreate([]) : null;
        $provider = $this->status->resolveProvider($setting);

        return Inertia::render('settings/ai', [
            'aiStatus' => $this->status->forUser($request->user()),
            'settings' => [
                'aiProvider' => $provider,
                'aiModel' => $setting?->ai_model ?? $setting?->openai_model ?? $this->status->defaultModel($provider),
                'aiEnabled' => (bool) ($setting?->ai_enabled ?? $setting?->openai_enabled ?? false),
                'hasDatabaseAiKey' => is_string($setting?->ai_api_key ?? $setting?->openai_api_key) && trim((string) ($setting?->ai_api_key ?? $setting?->openai_api_key)) !== '',
                'providers' => $this->providerOptions(),
                'mcpEnabled' => (bool) ($setting?->mcp_enabled ?? false),
                'mcpEndpoint' => url('/mcp'),
                'requiresMigration' => $setting === null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ai_provider' => ['required', 'string', 'max:80'],
            'ai_api_key' => ['nullable', 'string', 'max:4096'],
            'ai_model' => ['required', 'string', 'max:180'],
            'ai_enabled' => ['required', 'boolean'],
            'clear_ai_api_key' => ['nullable', 'boolean'],
            'mcp_enabled' => ['required', 'boolean'],
        ]);

        if (! $this->status->settingsTableExists()) {
            return back()->withErrors(['ai_api_key' => 'Run database migrations before saving AI settings.']);
        }

        if (! array_key_exists($data['ai_provider'], config('ai.providers', []))) {
            return back()->withErrors(['ai_provider' => 'Choose a supported AI provider.']);
        }

        $setting = $request->user()->aiSetting()->firstOrCreate([]);
        $patch = [
            'ai_provider' => $data['ai_provider'],
            'ai_model' => $data['ai_model'],
            'ai_enabled' => (bool) $data['ai_enabled'],
            'mcp_enabled' => (bool) $data['mcp_enabled'],
        ];

        if (($data['clear_ai_api_key'] ?? false) === true) {
            $patch['ai_api_key'] = null;
            $patch['ai_status'] = 'not_configured';
            $patch['ai_tested_at'] = null;
        } elseif (array_key_exists('ai_api_key', $data) && trim((string) $data['ai_api_key']) !== '') {
            $patch['ai_api_key'] = trim((string) $data['ai_api_key']);
            $patch['ai_status'] = 'not_tested';
            $patch['ai_tested_at'] = null;
        }

        $setting->forceFill($patch)->save();

        return back()->with('status', 'AI settings saved.');
    }

    public function testOpenAi(Request $request): RedirectResponse
    {
        if (! $this->status->settingsTableExists()) {
            return back()->withErrors(['ai_api_key' => 'Run database migrations before testing AI settings.']);
        }

        $setting = $request->user()->aiSetting()->firstOrCreate([]);
        $provider = $this->status->resolveProvider($setting);
        $key = $this->status->resolveProviderKey($provider, $setting);

        if ($key === null) {
            $setting->forceFill(['ai_status' => 'not_configured', 'ai_tested_at' => now()])->save();

            return back()->withErrors(['ai_api_key' => 'Add an API key before testing the connection.']);
        }

        try {
            $response = $this->testProvider($provider, $key);

            $setting->forceFill([
                'ai_status' => $response->successful() ? 'connected' : 'invalid',
                'ai_tested_at' => now(),
            ])->save();

            if (! $response->successful()) {
                return back()->withErrors(['ai_api_key' => 'The selected provider rejected this key. Check the provider, key, and model.']);
            }

            return back()->with('status', 'AI connection verified.');
        } catch (\Throwable) {
            $setting->forceFill(['ai_status' => 'invalid', 'ai_tested_at' => now()])->save();

            return back()->withErrors(['ai_api_key' => 'Unable to reach the selected provider from the server.']);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function providerOptions(): array
    {
        return collect(config('ai.providers', []))
            ->map(fn (array $provider, string $id): array => [
                'id' => $id,
                'label' => $provider['label'] ?? ucfirst($id),
                'defaultModel' => $provider['default_model'] ?? null,
                'keyPlaceholder' => $provider['key_placeholder'] ?? 'API key',
                'models' => $provider['models'] ?? [],
                'envKey' => $provider['env_key'] ?? null,
            ])
            ->values()
            ->all();
    }

    private function testProvider(string $provider, string $key): \Illuminate\Http\Client\Response
    {
        $url = (string) config("ai.providers.{$provider}.test_url");
        $auth = (string) config("ai.providers.{$provider}.auth", 'bearer');
        $request = Http::acceptJson()->timeout(12);

        if ($auth === 'anthropic') {
            return $request
                ->withHeaders([
                    'x-api-key' => $key,
                    'anthropic-version' => '2023-06-01',
                ])
                ->get($url);
        }

        if ($auth === 'query_key') {
            return $request->get($url, ['key' => $key]);
        }

        return $request->withToken($key)->get($url);
    }
}
