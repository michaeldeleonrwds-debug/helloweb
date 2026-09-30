<?php

namespace App\Services;

use App\Models\AiSetting;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

final readonly class AiConnectionStatusService
{
    /** @return array<string, array<string, mixed>> */
    public function forUser(User $user): array
    {
        $setting = $this->settingsTableExists() ? $user->aiSetting : null;
        $provider = $this->resolveProvider($setting);
        $databaseKeyConfigured = is_string($this->databaseKey($setting)) && trim((string) $this->databaseKey($setting)) !== '';
        $environmentKeyConfigured = $this->environmentKey($provider) !== null;
        $configured = $databaseKeyConfigured || $environmentKeyConfigured;
        $enabled = $setting?->ai_enabled ?? $setting?->openai_enabled ?? $environmentKeyConfigured;
        $status = $configured ? ($setting?->ai_status ?? $setting?->openai_status ?? ($environmentKeyConfigured ? 'configured' : 'not_tested')) : 'not_configured';
        $connected = $configured && $enabled && $status === 'connected';

        return [
            'openai' => [
                'configured' => $configured,
                'enabled' => $enabled,
                'connected' => $connected,
                'status' => $connected ? 'connected' : $status,
                'provider' => $provider,
                'providerLabel' => $this->providerLabel($provider),
                'model' => $setting?->ai_model ?? $setting?->openai_model ?? $this->defaultModel($provider),
                'source' => $databaseKeyConfigured ? 'database' : ($environmentKeyConfigured ? 'environment' : null),
            ],
            'mcp' => [
                'configured' => true,
                'connected' => true,
                'status' => 'available',
                'client' => 'external',
            ],
        ];
    }

    public function resolveOpenAiKey(?AiSetting $setting): ?string
    {
        return $this->resolveProviderKey($this->resolveProvider($setting), $setting);
    }

    public function resolveProviderKey(string $provider, ?AiSetting $setting): ?string
    {
        $databaseKey = $this->databaseKey($setting);
        if (is_string($databaseKey) && trim($databaseKey) !== '') {
            return $databaseKey;
        }

        return $this->environmentKey($provider);
    }

    public function settingsTableExists(): bool
    {
        return Schema::hasTable('ai_settings') && Schema::hasColumn('ai_settings', 'ai_provider');
    }

    public function resolveProvider(?AiSetting $setting): string
    {
        $provider = $setting?->ai_provider ?? config('ai.default_provider', 'openai');

        return is_string($provider) && array_key_exists($provider, config('ai.providers', [])) ? $provider : 'openai';
    }

    public function defaultModel(string $provider): string
    {
        return (string) config("ai.providers.{$provider}.default_model", 'gpt-4.1-mini');
    }

    private function providerLabel(string $provider): string
    {
        return (string) config("ai.providers.{$provider}.label", ucfirst($provider));
    }

    private function databaseKey(?AiSetting $setting): ?string
    {
        return $setting?->ai_api_key ?? $setting?->openai_api_key;
    }

    private function environmentKey(string $provider): ?string
    {
        $envKey = config("ai.providers.{$provider}.env_key");
        $key = is_string($envKey) ? env($envKey) : null;

        return is_string($key) && trim($key) !== '' ? $key : null;
    }
}
