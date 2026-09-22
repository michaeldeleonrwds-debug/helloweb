<?php

namespace App\Http\Controllers;

use App\Builder\Media\MediaAssetService;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class MediaAssetController extends Controller
{
    public function __construct(
        private readonly MediaAssetService $media,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['media' => $request->user()->mediaAssets()->where('status', 'active')->latest()->get()->map(fn (MediaAsset $asset): array => $this->data($asset, $request->user()))->values()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['file' => ['required', 'file', 'max:10240'], 'alt_text' => ['nullable', 'string', 'max:255']]);
        $file = $data['file'];
        $asset = $this->media->store($request->user(), $file->getClientOriginalName(), $file->getMimeType() ?: 'application/octet-stream', $file->get(), ['altText' => $data['alt_text'] ?? null]);

        return response()->json(['media' => $this->data($asset, $request->user())], 201);
    }

    public function show(Request $request, MediaAsset $asset): JsonResponse
    {
        Gate::authorize('view', $asset);

        return response()->json(['media' => $this->data($asset, $request->user())]);
    }

    public function archive(Request $request, MediaAsset $asset): JsonResponse
    {
        Gate::authorize('delete', $asset);
        $this->media->archive($request->user(), $asset);

        return response()->json(['status' => 'archived']);
    }

    /** @return array<string, mixed> */
    private function data(MediaAsset $asset, User $user): array
    {
        return ['id' => $asset->id, 'originalFilename' => $asset->original_filename, 'mimeType' => $asset->mime_type, 'fileSize' => $asset->file_size, 'width' => $asset->width, 'height' => $asset->height, 'altText' => $asset->alt_text, 'status' => $asset->status, 'url' => $this->media->reference($user, $asset)->url];
    }
}
