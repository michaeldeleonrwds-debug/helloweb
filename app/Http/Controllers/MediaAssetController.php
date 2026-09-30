<?php

namespace App\Http\Controllers;

use App\Builder\Media\MediaAssetService;
use App\Builder\Media\MediaFolderService;
use App\Models\MediaAsset;
use App\Models\MediaFolder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class MediaAssetController extends Controller
{
    public function __construct(
        private readonly MediaAssetService $media,
        private readonly MediaFolderService $folders,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = (string) $request->query('status', 'all');

        $assets = $user->mediaAssets()
            ->when($status === 'active', fn ($query) => $query->where('status', 'active'))
            ->when($status === 'archived', fn ($query) => $query->where('status', 'archived'))
            ->when(
                $request->query('folder_id') !== null,
                fn ($query) => $query->where(
                    'folder_id',
                    $request->query('folder_id') === 'root' ? null : (int) $request->query('folder_id'),
                ),
            )
            ->latest()
            ->get()
            ->map(fn (MediaAsset $asset): array => $this->data($asset, $user))
            ->values();

        return response()->json(['media' => $assets, 'folders' => $this->folders->tree($user)]);
    }

    public function adminIndex(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('media/index', [
            'media' => $user->mediaAssets()->latest()->get()->map(fn (MediaAsset $asset): array => [
                'id' => $asset->id,
                'folderId' => $asset->folder_id,
                'originalFilename' => $asset->original_filename,
                'mimeType' => $asset->mime_type,
                'fileSize' => $asset->file_size,
                'width' => $asset->width,
                'height' => $asset->height,
                'altText' => $asset->alt_text,
                'status' => $asset->status,
                'url' => $this->media->reference($user, $asset)->url,
                'uploadedAt' => $asset->created_at?->toISOString(),
            ])->values()->all(),
            'folders' => $this->folders->tree($user),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'folder_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ]);

        $file = $data['file'];
        $folder = isset($data['folder_id']) && $data['folder_id'] !== null
            ? MediaFolder::where('user_id', $request->user()->id)->findOrFail($data['folder_id'])
            : null;

        $asset = $this->media->store(
            $request->user(),
            $file->getClientOriginalName(),
            $file->getMimeType() ?: 'application/octet-stream',
            $file->get(),
            ['altText' => $data['alt_text'] ?? null],
            $folder,
        );

        return response()->json(['media' => $this->data($asset, $request->user())], 201);
    }

    public function show(Request $request, MediaAsset $asset): JsonResponse
    {
        Gate::authorize('view', $asset);

        return response()->json(['media' => $this->data($asset, $request->user())]);
    }

    public function update(Request $request, MediaAsset $asset): JsonResponse
    {
        $data = $request->validate([
            'original_filename' => ['sometimes', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'folder_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ]);

        $updated = $this->media->update($request->user(), $asset, $data);

        return response()->json(['media' => $this->data($updated, $request->user())]);
    }

    public function archive(Request $request, MediaAsset $asset): JsonResponse
    {
        Gate::authorize('delete', $asset);
        $this->media->archive($request->user(), $asset);

        return response()->json(['status' => 'archived']);
    }

    public function restore(Request $request, MediaAsset $asset): JsonResponse
    {
        $restored = $this->media->restore($request->user(), $asset);

        return response()->json(['media' => $this->data($restored, $request->user())]);
    }

    public function destroy(Request $request, MediaAsset $asset): JsonResponse
    {
        $this->media->destroy($request->user(), $asset);

        return response()->json(['status' => 'deleted']);
    }

    /** @return array<string, mixed> */
    private function data(MediaAsset $asset, User $user): array
    {
        return [
            'id' => $asset->id,
            'folderId' => $asset->folder_id,
            'originalFilename' => $asset->original_filename,
            'mimeType' => $asset->mime_type,
            'fileSize' => $asset->file_size,
            'width' => $asset->width,
            'height' => $asset->height,
            'altText' => $asset->alt_text,
            'status' => $asset->status,
            'url' => $this->media->reference($user, $asset)->url,
            'uploadedAt' => $asset->created_at?->toISOString(),
        ];
    }
}
