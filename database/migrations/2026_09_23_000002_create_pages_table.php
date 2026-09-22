<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('status')->default('draft');
            $table->json('draft_document');
            $table->unsignedInteger('document_schema_version');
            $table->unsignedBigInteger('document_version')->default(0);
            $table->unsignedBigInteger('current_revision_id')->nullable();
            $table->timestamps();

            $table->unique(['website_id', 'slug']);
            $table->index(['website_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
