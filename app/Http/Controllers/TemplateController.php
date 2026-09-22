<?php

namespace App\Http\Controllers;

use App\Builder\Persistence\StaleDocumentException;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Models\Page;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class TemplateController extends Controller
{
    public function __construct(
        private readonly TemplatePersistenceService $templates,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['templates' => array_map(fn (Template $template): array => $this->data($template), $this->templates->available($request->user()))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['nullable', 'string', 'max:40'],
            'document' => ['required', 'array'],
        ]);
        $template = $this->templates->create($request->user(), $data['name'], $data['document'], $data['slug'] ?? null, $data['description'] ?? null, $data['type'] ?? 'page');

        return response()->json(['template' => $this->data($template)], 201);
    }

    public function update(Request $request, Template $template): JsonResponse
    {
        Gate::authorize('update', $template);
        $data = $request->validate(['name' => ['sometimes', 'string', 'max:120'], 'description' => ['nullable', 'string', 'max:1000'], 'document' => ['required', 'array']]);
        $updated = $this->templates->update($request->user(), $template, $data['document'], $data['name'] ?? null, $data['description'] ?? null);

        return response()->json(['template' => $this->data($updated)]);
    }

    public function archive(Request $request, Template $template): JsonResponse
    {
        Gate::authorize('update', $template);
        $this->templates->archive($request->user(), $template);

        return response()->json(['status' => 'archived']);
    }

    public function instantiate(Request $request, Template $template, Page $page): JsonResponse
    {
        Gate::authorize('instantiate', $template);
        $data = $request->validate(['parent_id' => ['required', 'string'], 'expected_version' => ['required', 'integer', 'min:0']]);

        try {
            $updated = $this->templates->instantiate($request->user(), $template, $page, $data['parent_id'], $data['expected_version']);
        } catch (StaleDocumentException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'version' => $exception->currentVersion], 409);
        }

        return response()->json(['page' => ['id' => $updated->id, 'version' => $updated->document_version], 'document' => $updated->draft_document]);
    }

    /** @return array<string, mixed> */
    private function data(Template $template): array
    {
        return ['id' => $template->id, 'name' => $template->name, 'slug' => $template->slug, 'description' => $template->description, 'type' => $template->type, 'schemaVersion' => $template->schema_version, 'document' => $template->document];
    }
}
