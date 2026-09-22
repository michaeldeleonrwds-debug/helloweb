<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('revision_number');
            $table->json('document');
            $table->unsignedInteger('schema_version');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type')->default('checkpoint');
            $table->timestamps();

            $table->unique(['page_id', 'revision_number']);
            $table->index(['page_id', 'created_at']);
        });

        Schema::table('pages', function (Blueprint $table) {
            $table->foreign('current_revision_id')->references('id')->on('page_revisions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropForeign(['current_revision_id']);
        });

        Schema::dropIfExists('page_revisions');
    }
};
