<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->json('published_document')->nullable()->after('draft_document');
            $table->timestamp('published_at')->nullable()->after('status');
        });

        DB::table('pages')->where('status', 'published')->update([
            'published_document' => DB::raw('draft_document'),
            'published_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['published_document', 'published_at']);
        });
    }
};
