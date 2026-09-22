<?php

namespace App\Http\Controllers;

use App\Builder\Persistence\ReusableComponentService;
use App\Builder\Persistence\StaleDocumentException;
use App\Models\Page;
use App\Models\ReusableComponent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class ReusableComponentController extends Controller
{
    public function __construct(
        private readonly ReusableComponentService $components,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['components' => $this->components->definitions($request->user())]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120'], 'description' => ['nullable', 'string', 'max:1000'], 'document' => ['required', 'array']]);
        $component = $this->components->create($request->user(), $data['name'], $data['document'], $data['description'] ?? null);

        return response()->json(['component' => $this->data($component)], 201);
    }

    public function update(Request $request, ReusableComponent $component): JsonResponse
    {
        Gate::authorize('update', $component);
        $data = $request->validate(['name' => ['sometimes', 'string', 'max:120'], 'document' => ['required', 'array']]);
        $updated = $this->components->update($request->user(), $component, $data['document'], $data['name'] ?? null);

        return response()->json(['component' => $this->data($updated)]);
    }

    public function archive(Request $request, ReusableComponent $component): JsonResponse
    {
        Gate::authorize('update', $component);
        $this->components->archive($request->user(), $component);

        return response()->json(['status' => 'archived']);
    }

    public function insert(Request $request, ReusableComponent $component, Page $page): JsonResponse
    {
        Gate::authorize('insert', $component);
        $data = $request->validate(['parent_id' => ['required', 'string'], 'expected_version' => ['required', 'integer', 'min:0']]);

        try {
            $updated = $this->components->insert($request->user(), $component, $page, $data['parent_id'], $data['expected_version']);
        } catch (StaleDocumentException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'version' => $exception->currentVersion], 409);
        }

        return response()->json(['page' => ['id' => $updated->id, 'version' => $updated->document_version], 'document' => $updated->draft_document]);
    }

    /** @return array<string, mixed> */
    private function data(ReusableComponent $component): array
    {
        return ['id' => $component->id, 'name' => $component->name, 'description' => $component->description, 'schemaVersion' => $component->schema_version, 'document' => $component->document];
    }
}
