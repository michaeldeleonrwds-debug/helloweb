<?php

use App\Http\Controllers\BuilderPageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\ReusableComponentController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\WebsiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('preview/pages/{page}', [PublicSiteController::class, 'preview'])->name('preview.pages.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('websites', [WebsiteController::class, 'index'])->name('websites.index');
    Route::get('pages', [PageController::class, 'index'])->name('pages.index');
    Route::post('pages', [PageController::class, 'store'])->name('pages.store');
    Route::delete('pages/{page}', [PageController::class, 'destroy'])->name('pages.destroy');
    Route::post('pages/{page}/publish', [PageController::class, 'publish'])->name('pages.publish');
    Route::post('pages/{page}/unpublish', [PageController::class, 'unpublish'])->name('pages.unpublish');
    Route::get('templates', [TemplateController::class, 'adminIndex'])->name('templates.index');
    Route::get('media', [MediaAssetController::class, 'adminIndex'])->name('media.index');
    Route::get('reusable-components', [ReusableComponentController::class, 'adminIndex'])->name('reusable-components.index');

    Route::get('builder', [BuilderPageController::class, 'index'])->name('builder');
    Route::get('builder/pages/{page}', [BuilderPageController::class, 'show'])->name('builder.pages.show');
    Route::patch('builder/pages/{page}/document', [BuilderPageController::class, 'updateDocument'])->name('builder.pages.document.update');
    Route::post('builder/pages/{page}/publish', [BuilderPageController::class, 'publish'])->name('builder.pages.publish');
    Route::post('builder/pages/{page}/unpublish', [BuilderPageController::class, 'unpublish'])->name('builder.pages.unpublish');
    Route::post('builder/pages/{page}/revisions', [BuilderPageController::class, 'createRevision'])->name('builder.pages.revisions.store');
    Route::get('builder/pages/{page}/revisions', [BuilderPageController::class, 'revisions'])->name('builder.pages.revisions.index');
    Route::post('builder/pages/{page}/revisions/{revision}/restore', [BuilderPageController::class, 'restoreRevision'])->name('builder.pages.revisions.restore');
    Route::get('builder/templates', [TemplateController::class, 'index'])->name('builder.templates.index');
    Route::post('builder/templates', [TemplateController::class, 'store'])->name('builder.templates.store');
    Route::patch('builder/templates/{template}', [TemplateController::class, 'update'])->name('builder.templates.update');
    Route::post('builder/templates/{template}/archive', [TemplateController::class, 'archive'])->name('builder.templates.archive');
    Route::post('builder/templates/{template}/pages/{page}/instantiate', [TemplateController::class, 'instantiate'])->name('builder.templates.instantiate');
    Route::get('builder/reusable-components', [ReusableComponentController::class, 'index'])->name('builder.reusable.index');
    Route::post('builder/reusable-components', [ReusableComponentController::class, 'store'])->name('builder.reusable.store');
    Route::patch('builder/reusable-components/{component}', [ReusableComponentController::class, 'update'])->name('builder.reusable.update');
    Route::post('builder/reusable-components/{component}/archive', [ReusableComponentController::class, 'archive'])->name('builder.reusable.archive');
    Route::post('builder/reusable-components/{component}/pages/{page}/insert', [ReusableComponentController::class, 'insert'])->name('builder.reusable.insert');
    Route::get('builder/media', [MediaAssetController::class, 'index'])->name('builder.media.index');
    Route::post('builder/media', [MediaAssetController::class, 'store'])->name('builder.media.store');
    Route::get('builder/media/{asset}', [MediaAssetController::class, 'show'])->name('builder.media.show');
    Route::post('builder/media/{asset}/archive', [MediaAssetController::class, 'archive'])->name('builder.media.archive');

    Route::post('builder/import/analyze', [\App\Http\Controllers\ImportController::class, 'analyze'])->name('builder.import.analyze');
    Route::post('builder/import/component', [\App\Http\Controllers\ImportController::class, 'importComponent'])->name('builder.import.component');
    Route::post('builder/import/template', [\App\Http\Controllers\ImportController::class, 'importTemplate'])->name('builder.import.template');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Public dynamic page route (placed last to prevent collision with application routes)
Route::get('{slug}', [PublicSiteController::class, 'show'])
    ->where('slug', '^(?!dashboard|settings|websites|pages|templates|media|reusable-components|builder|login|register|logout|forgot-password|reset-password|verify-email|confirm-password|preview|up|api|storage)[a-zA-Z0-9_\-\/]+$')
    ->name('public.page');
