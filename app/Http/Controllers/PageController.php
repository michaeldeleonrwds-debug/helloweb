<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $pages = Page::query()
            ->whereHas('website', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('website')
            ->latest()
            ->get();

        return Inertia::render('pages/index', [
            'pages' => $pages->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'websiteName' => $page->website->name,
                'updatedAt' => $page->updated_at?->toISOString(),
            ])->values()->all(),
        ]);
    }
}
