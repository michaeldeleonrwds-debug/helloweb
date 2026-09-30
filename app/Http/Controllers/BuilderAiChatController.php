<?php

namespace App\Http\Controllers;

use App\Builder\Commands\EditorCommandService;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Builder\Style\StyleSchema;
use App\Models\Page;
use App\Services\AiConnectionStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;

final class BuilderAiChatController extends Controller
{
    public function __construct(
        private readonly AiConnectionStatusService $status,
        private readonly EditorCommandService $commands,
    ) {}

    public function __invoke(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'mode' => ['nullable', 'in:plan,build'],
            'document' => ['required', 'array'],
            'selectedNodeId' => ['nullable', 'string', 'max:160'],
            'history' => ['nullable', 'array', 'max:12'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:4000'],
        ]);

        if (! $this->status->settingsTableExists()) {
            return response()->json(['message' => 'Run migrations before using AI chat.'], 422);
        }

        $setting = $request->user()->aiSetting()->firstOrCreate([]);
        $provider = $this->status->resolveProvider($setting);
        $key = $this->status->resolveProviderKey($provider, $setting);

        if ($key === null) {
            return response()->json(['message' => 'Add and test an AI provider API key in Settings before chatting.'], 422);
        }

        $model = (string) ($setting->ai_model ?: $this->status->defaultModel($provider));
        $context = $this->builderContext($page, $data['document'], $data['selectedNodeId'] ?? null);

        try {
            $mode = (string) ($data['mode'] ?? 'plan');
            $shouldApply = $mode === 'build' && $this->shouldApply((string) $data['message']);
            if ($shouldApply) {
                $plan = $this->chatForCommands($provider, $key, $model, $context, $data['message'], $data['history'] ?? []);
                $commands = $this->normalizeCommands($plan['commands'] ?? [], $data['document']);
                $results = [];
                $idMap = [];

                foreach ($commands as $command) {
                    $page->refresh();
                    $command['expectedVersion'] = (int) $page->document_version;
                    $command = $this->remapPlaceholderIds($command, $idMap);
                    $result = $this->commands->execute($request->user(), $page, $command);
                    $results[] = $result;

                    if (isset($result['createdId']) && isset($command['_placeholderId'])) {
                        $idMap[$command['_placeholderId']] = $result['createdId'];
                    }
                }

                $page->refresh();

                return response()->json([
                    'reply' => (string) ($plan['reply'] ?? 'Applied the requested builder changes.'),
                    'provider' => $provider,
                    'model' => $model,
                    'applied' => count($results),
                    'document' => $page->draft_document,
                    'version' => (int) $page->document_version,
                    'results' => $results,
                ]);
            }

            $reply = $this->chat($provider, $key, $model, $context, $data['message'], $data['history'] ?? []);

            return response()->json([
                'reply' => $reply,
                'provider' => $provider,
                'model' => $model,
            ]);
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'AI chat failed: '.$exception->getMessage()], 422);
        }
    }

    public function plan(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'document' => ['required', 'array'],
            'selectedNodeId' => ['nullable', 'string', 'max:160'],
            'history' => ['nullable', 'array', 'max:12'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:4000'],
        ]);

        try {
            [$provider, $key, $model] = $this->providerConfig($request);
            $context = $this->builderContext($page, $data['document'], $data['selectedNodeId'] ?? null);
            $plan = $this->chatForCommands($provider, $key, $model, $context, $data['message'], $data['history'] ?? []);

            return response()->json([
                'reply' => (string) ($plan['reply'] ?? 'I prepared the requested draft changes.'),
                'commands' => $this->normalizeCommands($plan['commands'] ?? [], $data['document']),
                'provider' => $provider,
                'model' => $model,
            ]);
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'AI planning failed: '.$exception->getMessage()], 422);
        }
    }

    public function execute(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);

        $data = $request->validate([
            'command' => ['required', 'array'],
            'idMap' => ['nullable', 'array'],
        ]);

        try {
            $page->refresh();
            $idMap = is_array($data['idMap'] ?? null) ? $data['idMap'] : [];
            $normalized = $this->normalizeCommands([$data['command']], $page->draft_document ?? []);
            if ($normalized === []) {
                return response()->json(['message' => 'Builder command had no valid editable fields after normalization.'], 422);
            }

            $command = $normalized[0];
            $command['expectedVersion'] = (int) $page->document_version;
            $command = $this->remapPlaceholderIds($command, $idMap);
            $result = $this->commands->execute($request->user(), $page, $command);
            $page->refresh();

            return response()->json([
                'result' => $result,
                'document' => $page->draft_document,
                'version' => (int) $page->document_version,
                'createdId' => $result['createdId'] ?? null,
            ]);
        } catch (\Throwable $exception) {
            return response()->json(['message' => 'Builder command failed: '.$exception->getMessage()], 422);
        }
    }

    /** @return array{0: string, 1: string, 2: string} */
    private function providerConfig(Request $request): array
    {
        if (! $this->status->settingsTableExists()) {
            throw new \RuntimeException('Run migrations before using AI chat.');
        }

        $setting = $request->user()->aiSetting()->firstOrCreate([]);
        $provider = $this->status->resolveProvider($setting);
        $key = $this->status->resolveProviderKey($provider, $setting);

        if ($key === null) {
            throw new \RuntimeException('Add and test an AI provider API key in Settings before chatting.');
        }

        return [$provider, $key, (string) ($setting->ai_model ?: $this->status->defaultModel($provider))];
    }

    /** @param array<string, mixed> $document */
    private function builderContext(Page $page, array $document, ?string $selectedNodeId): string
    {
        $json = json_encode($document, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $json = mb_substr($json, 0, 30000);
        $builderManual = $this->builderManual();

        return <<<CONTEXT
You are HelloWeb Builder AI inside a visual website builder.
Help the user edit and reason about the current page. Be specific and concise.
When suggesting builder changes, refer to element ids and component types from the document.
Do not claim you changed the page unless a tool or endpoint applies the change.
You are editing the draft document only. The public site changes only after the user clicks Publish.

Page:
- id: {$page->id}
- title: {$page->title}
- slug: {$page->slug}
- status: {$page->status}
- selectedNodeId: {$selectedNodeId}

Builder capabilities and rules:
{$builderManual}

Current builder document JSON:
{$json}
CONTEXT;
    }

    private function builderManual(): string
    {
        $registry = BuiltInComponentDefinitions::registry();
        $components = collect($registry->all())
            ->map(function ($definition): array {
                $data = $definition->toArray();

                return [
                    'type' => $data['type'] ?? null,
                    'name' => $data['name'] ?? null,
                    'category' => $data['category'] ?? null,
                    'props' => array_keys($data['propSchema'] ?? []),
                    'styles' => array_slice($data['styleCapabilities'] ?? [], 0, 30),
                    'children' => data_get($data, 'childRules.allowedTypes', []),
                ];
            })
            ->values()
            ->all();

        $componentJson = json_encode($components, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        return <<<MANUAL
- Draft/publish model: AI changes save to the draft. The user must click Publish to update the live site.
- Save model: the builder saves the current draft before AI applies commands, then reloads the edited draft into the canvas.
- Breakpoints: desktop, tablet, mobile. Use update_responsive_styles for tablet/mobile-specific changes.
- Valid editor command types:
  get_page, find_elements, get_components, get_design_tokens,
  create_element, create_section, create_row, create_column,
  update_element, update_content, replace_image,
  update_styles, update_responsive_styles, resize_element,
  move_element, duplicate_element, delete_element.
- Style values should usually be strings with units, for example "32px", "100%", "#FFFFFF", "flex", "center".
- For update_styles, styles must be a flat object like {"color":"#FFFFFF","fontSize":"48px"}.
- Do not wrap styles in {"desktop": ...}, {"tablet": ...}, or {"mobile": ...}. Use update_responsive_styles with breakpoint instead.
- Layout hierarchy basics:
  layout.root accepts layout.section and layout.navbar.
  layout.section accepts layout.row, layout.container, and code.customcode.
  layout.row accepts layout.column and code.customcode.
  layout.column accepts content, media, code, marketing, and nested layout primitives including rows.
- When creating new nodes, use "assignId" to name them so later commands can reference them as parentId or elementId.
  Example: create_section with assignId:"s1", then create_row with parentId:"s1" and assignId:"r1", then create_column with parentId:"r1".
- Available component definitions:
{$componentJson}
MANUAL;
    }

    /** @param array<int, array{role: string, content: string}> $history */
    private function chat(string $provider, string $key, string $model, string $context, string $message, array $history): string
    {
        return match ((string) config("ai.providers.{$provider}.auth", 'bearer')) {
            'anthropic' => $this->chatAnthropic($provider, $key, $model, $context, $message, $history),
            'query_key' => $this->chatGemini($provider, $key, $model, $context, $message, $history),
            default => $this->chatOpenAiCompatible($provider, $key, $model, $context, $message, $history),
        };
    }

    /** @param array<int, array{role: string, content: string}> $history */
    private function chatForCommands(string $provider, string $key, string $model, string $context, string $message, array $history): array
    {
        $commandPrompt = <<<PROMPT
{$context}

The user is asking you to apply changes now.
Return ONLY valid JSON with this shape:
{
  "reply": "short plain English summary of what you changed",
  "commands": [
    {"type":"update_styles","elementId":"...","styles":{"color":"#FFFFFF"}},
    {"type":"update_content","elementId":"...","text":"..."},
    {"type":"update_element","elementId":"...","props":{"text":"...","href":"..."}}
  ]
}

Use only these command types when editing:
- update_styles: elementId, flat styles object, never nested by breakpoint
- update_responsive_styles: elementId, breakpoint desktop|tablet|mobile, flat styles object
- update_content: elementId, text string
- update_element: elementId, props object. Put prop edits inside props, for example {"props":{"text":"Templates"}}.
- create_element: parentId, componentType, optional position, optional assignId
- create_section: optional assignId
- create_row: parentId, optional assignId
- create_column: parentId, optional assignId
- move_element: elementId, parentId, optional position
- duplicate_element: elementId
- delete_element: elementId

IMPORTANT: When creating new elements and subsequent commands need to reference them,
include "assignId" with a placeholder name (e.g. "new_section", "new_row", "col_1", "col_2").
Then use that same placeholder name as parentId or elementId in later commands.
Example:
  {"type":"create_section","assignId":"new_section"},
  {"type":"create_row","parentId":"new_section","assignId":"new_row"},
  {"type":"create_column","parentId":"new_row","assignId":"col_1"},
  {"type":"create_column","parentId":"new_row","assignId":"col_2"}

Prefer scoped, valid edits to existing element ids. Do not invent unsupported CSS keys. If you cannot safely edit, return an empty commands array and explain why in reply.
You know the draft/publish workflow: command edits update the draft only; do not say the live page was published.
PROMPT;

        $raw = $this->chat($provider, $key, $model, $commandPrompt, $message, $history);
        $json = $this->extractJson($raw);
        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new \RuntimeException('AI did not return a valid builder command plan.');
        }

        return $decoded;
    }

    private function shouldApply(string $message): bool
    {
        return preg_match('/\b(do it|apply|change|update|edit|redesign|improve|make it|fix|create|add|remove|delete|move)\b/i', $message) === 1;
    }

    private function extractJson(string $text): string
    {
        if (preg_match('/```(?:json)?\s*(.*?)```/is', $text, $matches) === 1) {
            return trim($matches[1]);
        }

        $start = strpos($text, '{');
        $end = strrpos($text, '}');
        if ($start !== false && $end !== false && $end > $start) {
            return substr($text, $start, $end - $start + 1);
        }

        return $text;
    }

    /** @return array<int, array<string, mixed>> */
    private function normalizeCommands(mixed $commands, array $document): array
    {
        if (! is_array($commands)) {
            return [];
        }

        return array_values(array_filter(array_map(function ($command) use ($document): ?array {
            if (! is_array($command) || ! isset($command['type'])) {
                return null;
            }

            $type = (string) $command['type'];
            $command = $this->resolveCommandNodeReferences($command, $document);

            // Preserve the AI's original placeholder IDs for create commands so we can
            // build an idMap (placeholder → real) when executing commands sequentially.
            if (in_array($type, ['create_section', 'create_row', 'create_column', 'create_element'], true)) {
                $placeholder = $command['_placeholderId'] ?? $command['assignId'] ?? null;
                if (is_string($placeholder) && $placeholder !== '') {
                    $command['_placeholderId'] = $placeholder;
                }
            }

            if ($type === 'update_element') {
                $command = $this->normalizeUpdateElementCommand($command, $document);
                if (! isset($command['props']) || ! is_array($command['props']) || $command['props'] === []) {
                    return null;
                }
            }

            if (in_array($type, ['update_styles', 'update_responsive_styles', 'resize_element'], true) && isset($command['styles']) && is_array($command['styles'])) {
                $command = $this->normalizeStyleCommand($command);
                $command['styles'] = $this->sanitizeStylePatch((string) ($command['elementId'] ?? ''), $command['styles'], $document);
                if ($command['styles'] === []) {
                    return null;
                }
            }

            return $command;
        }, $commands)));
    }

    /**
     * Remap AI-planned placeholder IDs to real node IDs that were created by earlier commands.
     *
     * @param  array<string, mixed>  $command
     * @param  array<string, string>  $idMap  placeholder → real ID
     * @return array<string, mixed>
     */
    private function remapPlaceholderIds(array $command, array $idMap): array
    {
        if ($idMap === []) {
            return $command;
        }

        foreach (['parentId', 'elementId'] as $field) {
            if (isset($command[$field]) && is_string($command[$field]) && isset($idMap[$command[$field]])) {
                $command[$field] = $idMap[$command[$field]];
            }
        }

        if (isset($command['position']['siblingId']) && is_string($command['position']['siblingId']) && isset($idMap[$command['position']['siblingId']])) {
            $command['position']['siblingId'] = $idMap[$command['position']['siblingId']];
        }

        if (isset($command['siblingId']) && is_string($command['siblingId']) && isset($idMap[$command['siblingId']])) {
            $command['siblingId'] = $idMap[$command['siblingId']];
        }

        return $command;
    }

    /**
     * @param array<string, mixed> $command
     * @param array<string, mixed> $document
     * @return array<string, mixed>
     */
    private function resolveCommandNodeReferences(array $command, array $document): array
    {
        foreach (['parentId', 'elementId'] as $field) {
            if (isset($command[$field]) && is_string($command[$field])) {
                $command[$field] = $this->resolveNodeReference($command[$field], $document) ?? $command[$field];
            }
        }

        if (isset($command['position']) && is_array($command['position']) && isset($command['position']['siblingId']) && is_string($command['position']['siblingId'])) {
            $command['position']['siblingId'] = $this->resolveNodeReference($command['position']['siblingId'], $document) ?? $command['position']['siblingId'];
        }

        if (isset($command['siblingId']) && is_string($command['siblingId'])) {
            $command['siblingId'] = $this->resolveNodeReference($command['siblingId'], $document) ?? $command['siblingId'];
        }

        return $command;
    }

    /** @param array<string, mixed> $document */
    private function resolveNodeReference(string $reference, array $document): ?string
    {
        $root = $document['root'] ?? null;
        if (! is_array($root)) {
            return null;
        }

        if ($reference === 'root' || $reference === 'document.root') {
            return is_string($root['id'] ?? null) ? $root['id'] : null;
        }

        if (! str_starts_with($reference, 'root.')) {
            return null;
        }

        $current = $root;
        if (preg_match_all('/children\[(\d+)\]/', $reference, $matches) < 1) {
            return null;
        }

        foreach ($matches[1] as $index) {
            $children = $current['children'] ?? null;
            if (! is_array($children) || ! isset($children[(int) $index]) || ! is_array($children[(int) $index])) {
                return null;
            }

            $current = $children[(int) $index];
        }

        return is_string($current['id'] ?? null) ? $current['id'] : null;
    }

    /** @param array<string, mixed> $command */
    private function normalizeStyleCommand(array $command): array
    {
        $styles = $command['styles'];
        if (! is_array($styles)) {
            return $command;
        }

        foreach (['desktop', 'tablet', 'mobile'] as $breakpoint) {
            if (isset($styles[$breakpoint]) && is_array($styles[$breakpoint])) {
                $command['styles'] = $styles[$breakpoint];
                if (($command['type'] ?? null) !== 'update_styles') {
                    $command['breakpoint'] = $command['breakpoint'] ?? $breakpoint;
                }

                return $command;
            }
        }

        if (isset($styles['styles']) && is_array($styles['styles'])) {
            $command['styles'] = $styles['styles'];
        }

        return $command;
    }

    /**
     * @param array<string, mixed> $command
     * @param array<string, mixed> $document
     * @return array<string, mixed>
     */
    private function normalizeUpdateElementCommand(array $command, array $document): array
    {
        if (isset($command['props']) && is_array($command['props']) && ! array_is_list($command['props'])) {
            return $command;
        }

        $props = [];
        foreach (['text', 'href', 'url', 'src', 'alt', 'label', 'className', 'id'] as $key) {
            if (array_key_exists($key, $command)) {
                $props[$key] = $command[$key];
            }
        }

        if (isset($props['label']) && ! isset($props['text'])) {
            $props['text'] = $props['label'];
            unset($props['label']);
        }

        if (isset($props['url']) && ! isset($props['href'])) {
            $props['href'] = $props['url'];
            unset($props['url']);
        }

        $node = $this->findNode($document['root'] ?? [], (string) ($command['elementId'] ?? ''));
        if ($node !== null) {
            $props = $this->filterPropsForNode($props, (string) ($node['type'] ?? ''));
        }

        $command['props'] = $props;

        return $command;
    }

    /**
     * @param array<string, mixed> $props
     * @return array<string, mixed>
     */
    private function filterPropsForNode(array $props, string $componentType): array
    {
        $registry = BuiltInComponentDefinitions::registry();
        if (! $registry->has($componentType)) {
            return $props;
        }

        $schema = $registry->get($componentType)->propSchema();

        return array_filter(
            $props,
            fn (mixed $_value, string $key): bool => array_key_exists($key, $schema),
            ARRAY_FILTER_USE_BOTH,
        );
    }

    /**
     * @param array<string, mixed> $styles
     * @param array<string, mixed> $document
     * @return array<string, mixed>
     */
    private function sanitizeStylePatch(string $elementId, array $styles, array $document): array
    {
        $node = $this->findNode($document['root'] ?? [], $elementId);
        if ($node === null) {
            return $styles;
        }

        $registry = BuiltInComponentDefinitions::registry();
        $definition = $registry->has((string) ($node['type'] ?? '')) ? $registry->get((string) $node['type']) : null;
        $styleDefinitions = StyleSchema::definitions();
        $sanitized = [];

        foreach ($styles as $key => $value) {
            if (! is_string($key) || str_contains($key, ':') || str_starts_with($key, '&') || in_array($key, ['hover', 'focus', 'active', 'transition'], true)) {
                continue;
            }

            if ($key === 'boxShadow' && is_string($value) && ! in_array($value, $styleDefinitions['boxShadow']->options, true)) {
                $value = $this->nearestShadowPreset($value);
            }

            $styleDefinition = $styleDefinitions[$key] ?? null;
            if ($styleDefinition === null) {
                continue;
            }

            if ($styleDefinition->type === 'number') {
                $value = $this->normalizeNumberStyleValue($value);
                if (! is_int($value) && ! is_float($value)) {
                    continue;
                }
            }

            if ($definition !== null && ! $this->componentSupportsStyle($definition->styleCapabilities(), $key)) {
                continue;
            }

            if ($styleDefinition->type === 'enum' && is_string($value) && ! in_array($value, $styleDefinition->options, true)) {
                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }

    private function normalizeNumberStyleValue(mixed $value): mixed
    {
        if (is_int($value) || is_float($value)) {
            return $value;
        }

        if (! is_string($value)) {
            return $value;
        }

        $trimmed = trim($value);
        if (is_numeric($trimmed)) {
            return str_contains($trimmed, '.') ? (float) $trimmed : (int) $trimmed;
        }

        if (preg_match('/^(-?\d+(?:\.\d+)?)(?:em|rem|px)$/', $trimmed, $matches) === 1) {
            return (float) $matches[1];
        }

        if (preg_match('/^(\d+(?:\.\d+)?)%$/', $trimmed, $matches) === 1) {
            return ((float) $matches[1]) / 100;
        }

        return $value;
    }

    private function nearestShadowPreset(string $value): string
    {
        $lower = mb_strtolower($value);

        if ($lower === 'none' || str_contains($lower, '0 0 0')) {
            return 'none';
        }

        if (str_contains($lower, '80') || str_contains($lower, 'large') || str_contains($lower, 'strong')) {
            return '0 24px 80px rgba(15,23,42,.28)';
        }

        if (str_contains($lower, '18') || str_contains($lower, '50')) {
            return '0 18px 50px rgba(15,23,42,.18)';
        }

        if (str_contains($lower, '8') || str_contains($lower, '24')) {
            return '0 8px 24px rgba(0,0,0,.12)';
        }

        return '0 18px 50px rgba(15,23,42,.18)';
    }

    /** @param list<string> $capabilities */
    private function componentSupportsStyle(array $capabilities, string $key): bool
    {
        return in_array($key, $capabilities, true)
            || (str_starts_with($key, 'margin') && in_array('margin', $capabilities, true))
            || (str_starts_with($key, 'padding') && in_array('padding', $capabilities, true))
            || (str_starts_with($key, 'border') && str_ends_with($key, 'Width') && in_array('borderWidth', $capabilities, true))
            || (str_starts_with($key, 'border') && str_ends_with($key, 'Radius') && in_array('borderRadius', $capabilities, true))
            || (str_starts_with($key, 'border') && str_ends_with($key, 'Style') && in_array('borderStyle', $capabilities, true))
            || (str_starts_with($key, 'border') && str_ends_with($key, 'Color') && in_array('borderColor', $capabilities, true));
    }

    /** @param array<string, mixed> $node */
    private function findNode(array $node, string $elementId): ?array
    {
        if (($node['id'] ?? null) === $elementId) {
            return $node;
        }

        foreach (($node['children'] ?? []) as $child) {
            if (is_array($child)) {
                $found = $this->findNode($child, $elementId);
                if ($found !== null) {
                    return $found;
                }
            }
        }

        return null;
    }

    /** @param array<int, array{role: string, content: string}> $history */
    private function chatOpenAiCompatible(string $provider, string $key, string $model, string $context, string $message, array $history): string
    {
        $baseUrl = match ($provider) {
            'groq' => 'https://api.groq.com/openai/v1/chat/completions',
            'xai' => 'https://api.x.ai/v1/chat/completions',
            'openrouter' => 'https://openrouter.ai/api/v1/chat/completions',
            default => 'https://api.openai.com/v1/chat/completions',
        };

        $messages = [
            ['role' => 'system', 'content' => $context],
            ...array_map(fn (array $item): array => ['role' => $item['role'], 'content' => $item['content']], $history),
            ['role' => 'user', 'content' => $message],
        ];

        $response = Http::withToken($key)
            ->acceptJson()
            ->timeout(45)
            ->post($baseUrl, [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.3,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException($response->json('error.message') ?? 'Provider rejected the chat request.');
        }

        return (string) $response->json('choices.0.message.content', '');
    }

    /** @param array<int, array{role: string, content: string}> $history */
    private function chatAnthropic(string $provider, string $key, string $model, string $context, string $message, array $history): string
    {
        $messages = [
            ...array_map(fn (array $item): array => [
                'role' => $item['role'],
                'content' => [['type' => 'text', 'text' => $item['content']]],
            ], $history),
            ['role' => 'user', 'content' => [['type' => 'text', 'text' => $message]]],
        ];

        $response = Http::acceptJson()
            ->withHeaders([
                'x-api-key' => $key,
                'anthropic-version' => '2023-06-01',
            ])
            ->timeout(45)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'system' => $context,
                'messages' => $messages,
                'max_tokens' => 1200,
                'temperature' => 0.3,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException($response->json('error.message') ?? 'Provider rejected the chat request.');
        }

        return (string) $response->json('content.0.text', '');
    }

    /** @param array<int, array{role: string, content: string}> $history */
    private function chatGemini(string $provider, string $key, string $model, string $context, string $message, array $history): string
    {
        $contents = array_map(fn (array $item): array => [
            'role' => $item['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $item['content']]],
        ], $history);
        $contents[] = ['role' => 'user', 'parts' => [['text' => $message]]];

        $response = Http::acceptJson()
            ->timeout(45)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}", [
                'systemInstruction' => ['parts' => [['text' => $context]]],
                'contents' => $contents,
                'generationConfig' => ['temperature' => 0.3],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException($response->json('error.message') ?? 'Provider rejected the chat request.');
        }

        return (string) $response->json('candidates.0.content.parts.0.text', '');
    }
}
