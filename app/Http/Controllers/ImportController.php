<?php

namespace App\Http\Controllers;

use App\Builder\Import\DesignImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ImportController extends Controller
{
    public function __construct(
        private readonly DesignImportService $importService,
    ) {}

    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:zip', 'max:51200'], // 50MB max
            'type' => ['required', 'string', 'in:component,template'],
        ]);

        $file = $request->file('file');
        $type = $request->input('type');

        try {
            $analysis = $this->importService->analyze($file, $type);
            return response()->json([
                'success' => true,
                'analysis' => $analysis,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analysis failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function importComponent(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:zip', 'max:51200'],
            'name' => ['nullable', 'string', 'max:120'],
        ]);

        $file = $request->file('file');
        $name = $request->input('name');

        try {
            $component = $this->importService->importComponent($request->user(), $file, $name);
            return response()->json([
                'success' => true,
                'message' => "Component '{$component->name}' imported successfully!",
                'component' => [
                    'id' => $component->id,
                    'name' => $component->name,
                    'description' => $component->description,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function importTemplate(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:zip', 'max:51200'],
            'name' => ['nullable', 'string', 'max:120'],
        ]);

        $file = $request->file('file');
        $name = $request->input('name');

        try {
            $template = $this->importService->importTemplate($request->user(), $file, $name);
            return response()->json([
                'success' => true,
                'message' => "Template '{$template->name}' imported successfully!",
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'slug' => $template->slug,
                    'description' => $template->description,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 422);
        }
    }
}
