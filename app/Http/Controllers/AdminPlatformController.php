<?php

namespace App\Http\Controllers;

use App\Builder\Persistence\TemplatePersistenceService;
use App\Builder\Persistence\ReusableComponentService;
use App\Models\ReusableComponent;
use App\Models\Template;
use App\Models\User;
use App\Models\Website;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AdminPlatformController extends Controller
{
    public function __construct(
        private readonly TemplatePersistenceService $templateService,
        private readonly ReusableComponentService $componentService,
    ) {}

    public function index(Request $request): Response
    {
        $this->templateService->ensureDefaultTemplates($request->user());
        $this->componentService->ensureDefaultComponents($request->user());

        $templates = Template::where('status', 'active')
            ->latest()
            ->get()
            ->map(fn (Template $template): array => [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'description' => $template->description,
                'type' => $template->type,
                'is_platform' => (bool) $template->is_platform,
                'user_id' => $template->user_id,
                'creator_name' => $template->user?->name ?? 'System',
                'status' => $template->status,
                'updatedAt' => $template->updated_at?->toISOString(),
            ])->values()->all();

        $components = ReusableComponent::where('status', 'active')
            ->latest()
            ->get()
            ->map(fn (ReusableComponent $component): array => [
                'id' => $component->id,
                'name' => $component->name,
                'description' => $component->description,
                'is_platform' => (bool) $component->is_platform,
                'user_id' => $component->user_id,
                'creator_name' => $component->user?->name ?? 'System',
                'status' => $component->status,
                'updatedAt' => $component->updated_at?->toISOString(),
            ])->values()->all();

        $stats = [
            'totalTemplates' => count($templates),
            'platformTemplates' => count(array_filter($templates, fn ($t) => $t['is_platform'])),
            'totalComponents' => count($components),
            'platformComponents' => count(array_filter($components, fn ($c) => $c['is_platform'])),
            'totalWebsites' => Website::count(),
            'totalUsers' => User::count(),
            'activeHeaders' => Template::where('is_platform', true)->where('type', 'header')->where('status', 'active')->count(),
            'activeFooters' => Template::where('is_platform', true)->where('type', 'footer')->where('status', 'active')->count(),
            'activePages' => Template::where('is_platform', true)->where('type', 'page')->where('status', 'active')->count(),
        ];

        return Inertia::render('admin/index', [
            'templates' => $templates,
            'components' => $components,
            'stats' => $stats,
        ]);
    }

    public function toggleTemplatePlatform(Request $request, Template $template): RedirectResponse|JsonResponse
    {
        $template->forceFill([
            'is_platform' => ! $template->is_platform,
        ])->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'is_platform' => (bool) $template->is_platform,
                'message' => "Template '{$template->name}' platform status updated.",
            ]);
        }

        return back()->with('status', "Template '{$template->name}' platform status updated.");
    }

    public function toggleComponentPlatform(Request $request, ReusableComponent $component): RedirectResponse|JsonResponse
    {
        $component->forceFill([
            'is_platform' => ! $component->is_platform,
        ])->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'is_platform' => (bool) $component->is_platform,
                'message' => "Component '{$component->name}' platform status updated.",
            ]);
        }

        return back()->with('status', "Component '{$component->name}' platform status updated.");
    }
}
