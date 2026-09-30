<?php

namespace App\Http\Controllers;

use App\Builder\Commands\EditorCommandService;
use App\Models\Page;
use App\Models\ReusableComponent;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class McpController extends Controller
{
    public function __construct(
        private readonly EditorCommandService $commands,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json([
            'name' => 'HelloWeb',
            'transport' => 'streamable-http',
            'protocol' => 'mcp',
            'endpoint' => url('/mcp'),
            'status' => 'available',
            'message' => 'HelloWeb MCP endpoint is reachable. Tool execution will be added through the editor command adapter.',
        ]);
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->json()->all();
        $method = is_string($payload['method'] ?? null) ? $payload['method'] : null;
        $id = $payload['id'] ?? null;

        if ($method === null) {
            return $this->jsonRpcError($id, -32600, 'Invalid Request');
        }

        return match ($method) {
            'initialize' => $this->jsonRpcResult($id, [
                'protocolVersion' => (string) data_get($payload, 'params.protocolVersion', '2024-11-05'),
                'capabilities' => [
                    'resources' => [
                        'subscribe' => false,
                        'listChanged' => false,
                    ],
                    'tools' => [
                        'listChanged' => false,
                    ],
                ],
                'serverInfo' => [
                    'name' => 'HelloWeb',
                    'version' => config('app.version', '0.1.0'),
                ],
                'instructions' => 'HelloWeb exposes authenticated builder editor commands. Database, filesystem, SQL, PHP execution, and secret access are not available through MCP.',
            ]),
            'notifications/initialized' => response()->json(null, Response::HTTP_ACCEPTED),
            'ping' => $this->jsonRpcResult($id, new \stdClass()),
            'resources/list' => $this->jsonRpcResult($id, [
                'resources' => $this->resources(),
            ]),
            'resources/read' => $this->readResource($id, (string) data_get($payload, 'params.uri', '')),
            'tools/list' => $this->jsonRpcResult($id, [
                'tools' => $this->tools(),
            ]),
            'tools/call' => $this->callTool($id, (string) data_get($payload, 'params.name', ''), data_get($payload, 'params.arguments', [])),
            default => $this->jsonRpcError($id, -32601, "Method [{$method}] is not implemented yet."),
        };
    }

    /** @return array<int, array<string, string>> */
    private function resources(): array
    {
        return [
            ...Page::query()
                ->with('website:id,name')
                ->orderBy('id')
                ->get(['id', 'website_id', 'title', 'slug', 'status', 'document_version', 'document_schema_version', 'updated_at'])
                ->map(fn (Page $page): array => [
                    'uri' => "helloweb://pages/{$page->id}",
                    'name' => "Page: {$page->title}",
                    'description' => sprintf(
                        '%s / %s, status: %s, version: %s',
                        $page->website?->name ?? 'Website',
                        $page->slug,
                        $page->status,
                        $page->document_version,
                    ),
                    'mimeType' => 'application/json',
                ])
                ->all(),
            ...Template::query()
                ->orderBy('id')
                ->get(['id', 'name', 'slug', 'type', 'status', 'schema_version', 'updated_at'])
                ->map(fn (Template $template): array => [
                    'uri' => "helloweb://templates/{$template->id}",
                    'name' => "Template: {$template->name}",
                    'description' => sprintf('%s template, status: %s, schema: %s', $template->type, $template->status, $template->schema_version),
                    'mimeType' => 'application/json',
                ])
                ->all(),
            ...ReusableComponent::query()
                ->orderBy('id')
                ->get(['id', 'name', 'description', 'schema_version', 'status', 'updated_at'])
                ->map(fn (ReusableComponent $component): array => [
                    'uri' => "helloweb://components/{$component->id}",
                    'name' => "Component: {$component->name}",
                    'description' => sprintf('%s, status: %s, schema: %s', $component->description ?: 'Reusable component', $component->status, $component->schema_version),
                    'mimeType' => 'application/json',
                ])
                ->all(),
        ];
    }

    private function readResource(mixed $id, string $uri): JsonResponse
    {
        if (preg_match('/^helloweb:\/\/pages\/(\d+)$/', $uri, $matches) === 1) {
            $page = Page::query()->with('website:id,name,slug')->find((int) $matches[1]);

            if ($page === null) {
                return $this->jsonRpcError($id, -32002, 'Page resource not found.');
            }

            return $this->jsonRpcResult($id, [
                'contents' => [$this->jsonResourceContent($uri, [
                    'kind' => 'page',
                    'id' => $page->id,
                    'website' => $page->website?->only(['id', 'name', 'slug']),
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'status' => $page->status,
                    'documentVersion' => $page->document_version,
                    'schemaVersion' => $page->document_schema_version,
                    'draftDocument' => $page->draft_document,
                    'publishedDocument' => $page->published_document,
                    'updatedAt' => $page->updated_at?->toIso8601String(),
                ])],
            ]);
        }

        if (preg_match('/^helloweb:\/\/templates\/(\d+)$/', $uri, $matches) === 1) {
            $template = Template::query()->find((int) $matches[1]);

            if ($template === null) {
                return $this->jsonRpcError($id, -32002, 'Template resource not found.');
            }

            return $this->jsonRpcResult($id, [
                'contents' => [$this->jsonResourceContent($uri, [
                    'kind' => 'template',
                    'id' => $template->id,
                    'name' => $template->name,
                    'slug' => $template->slug,
                    'type' => $template->type,
                    'status' => $template->status,
                    'schemaVersion' => $template->schema_version,
                    'document' => $template->document,
                    'updatedAt' => $template->updated_at?->toIso8601String(),
                ])],
            ]);
        }

        if (preg_match('/^helloweb:\/\/components\/(\d+)$/', $uri, $matches) === 1) {
            $component = ReusableComponent::query()->find((int) $matches[1]);

            if ($component === null) {
                return $this->jsonRpcError($id, -32002, 'Reusable component resource not found.');
            }

            return $this->jsonRpcResult($id, [
                'contents' => [$this->jsonResourceContent($uri, [
                    'kind' => 'reusable_component',
                    'id' => $component->id,
                    'name' => $component->name,
                    'description' => $component->description,
                    'status' => $component->status,
                    'schemaVersion' => $component->schema_version,
                    'document' => $component->document,
                    'updatedAt' => $component->updated_at?->toIso8601String(),
                ])],
            ]);
        }

        return $this->jsonRpcError($id, -32602, 'Unsupported resource URI.');
    }

    /** @return array<int, array<string, mixed>> */
    private function tools(): array
    {
        return [
            [
                'name' => 'helloweb.editor_command',
                'description' => 'Read or mutate a HelloWeb builder page through the validated editor command service. Use resources/list first to find page ids and versions.',
                'inputSchema' => [
                    'type' => 'object',
                    'required' => ['pageId', 'command'],
                    'properties' => [
                        'pageId' => [
                            'type' => 'integer',
                            'description' => 'The HelloWeb page id to inspect or edit.',
                        ],
                        'command' => [
                            'type' => 'object',
                            'description' => 'Editor command payload. Supported type values include get_page, find_elements, get_components, get_design_tokens, create_element, create_section, create_row, create_column, update_element, update_content, replace_image, update_styles, update_responsive_styles, move_element, duplicate_element, and delete_element.',
                            'additionalProperties' => true,
                        ],
                    ],
                ],
            ],
        ];
    }

    private function callTool(mixed $id, string $name, mixed $arguments): JsonResponse
    {
        if ($name !== 'helloweb.editor_command') {
            return $this->jsonRpcError($id, -32602, 'Unsupported tool.');
        }

        if (! is_array($arguments) || ! isset($arguments['pageId'], $arguments['command']) || ! is_array($arguments['command'])) {
            return $this->jsonRpcError($id, -32602, 'Tool arguments must include pageId and command.');
        }

        $page = Page::query()->with('website.user')->find((int) $arguments['pageId']);
        if ($page === null || $page->website?->user === null) {
            return $this->jsonRpcError($id, -32002, 'Page was not found.');
        }

        try {
            $result = $this->commands->execute($page->website->user, $page, $arguments['command']);

            return $this->jsonRpcResult($id, [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
                    ],
                ],
                'isError' => false,
            ]);
        } catch (\Throwable $exception) {
            return $this->jsonRpcResult($id, [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => $exception->getMessage(),
                    ],
                ],
                'isError' => true,
            ]);
        }
    }

    /** @param array<string, mixed> $payload */
    private function jsonResourceContent(string $uri, array $payload): array
    {
        return [
            'uri' => $uri,
            'mimeType' => 'application/json',
            'text' => json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        ];
    }

    private function jsonRpcResult(mixed $id, mixed $result): JsonResponse
    {
        return response()->json([
            'jsonrpc' => '2.0',
            'id' => $id,
            'result' => $result,
        ]);
    }

    private function jsonRpcError(mixed $id, int $code, string $message): JsonResponse
    {
        return response()->json([
            'jsonrpc' => '2.0',
            'id' => $id,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ]);
    }
}
