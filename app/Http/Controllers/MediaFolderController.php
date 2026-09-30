<?php

namespace App\Http\Controllers;

use App\Builder\Media\MediaFolderService;
use App\Models\MediaFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MediaFolderController extends Controller
{
    public function __construct(
        private readonly MediaFolderService $folders,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['folders' => $this->folders->tree($request->user())]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'parent_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ]);

        $parent = null;
        if (($data['parent_id'] ?? null) !== null) {
            $parent = MediaFolder::findOrFail($data['parent_id']);
        }

        $folder = $this->folders->create($request->user(), $parent, $data['name']);

        return response()->json(['folder' => $this->data($folder)], 201);
    }

    public function update(Request $request, MediaFolder $folder): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);

        $updated = $this->folders->rename($request->user(), $folder, $data['name']);

        return response()->json(['folder' => $this->data($updated)]);
    }

    public function move(Request $request, MediaFolder $folder): JsonResponse
    {
        $data = $request->validate(['parent_id' => ['nullable', 'integer', 'exists:media_folders,id']]);

        $destination = null;
        if (($data['parent_id'] ?? null) !== null) {
            $destination = MediaFolder::findOrFail($data['parent_id']);
        }

        $moved = $this->folders->move($request->user(), $folder, $destination);

        return response()->json(['folder' => $this->data($moved)]);
    }

    public function destroy(Request $request, MediaFolder $folder): JsonResponse
    {
        $this->folders->delete($request->user(), $folder);

        return response()->json(['status' => 'deleted']);
    }

    /** @return array<string, mixed> */
    private function data(MediaFolder $folder): array
    {
        return [
            'id' => $folder->id,
            'name' => $folder->name,
            'parentId' => $folder->parent_id,
        ];
    }
}
