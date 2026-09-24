<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WebsiteController extends Controller
{
    public function index(Request $request): Response
    {
        $websites = $request->user()->websites()->withCount('pages')->latest()->get();

        return Inertia::render('websites/index', [
            'websites' => $websites->map(fn ($website): array => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'status' => $website->status,
                'homepageId' => $website->homepage_page_id,
                'pagesCount' => $website->pages_count,
                'updatedAt' => $website->updated_at?->toISOString(),
            ])->values()->all(),
        ]);
    }
}
