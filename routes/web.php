<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BuilderPageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\ReusableComponentController;
use App\Http\Controllers\TemplateController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('builder', [BuilderPageController::class, 'index'])->name('builder');
    Route::get('builder/pages/{page}', [BuilderPageController::class, 'show'])->name('builder.pages.show');
    Route::patch('builder/pages/{page}/document', [BuilderPageController::class, 'updateDocument'])->name('builder.pages.document.update');
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
