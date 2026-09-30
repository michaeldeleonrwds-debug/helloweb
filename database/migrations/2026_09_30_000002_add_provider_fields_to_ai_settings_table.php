<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_settings', function (Blueprint $table): void {
            $table->string('ai_provider')->default('openai')->after('user_id');
            $table->text('ai_api_key')->nullable()->after('ai_provider');
            $table->string('ai_model')->default('gpt-4.1-mini')->after('ai_api_key');
            $table->boolean('ai_enabled')->default(false)->after('ai_model');
            $table->string('ai_status')->default('not_configured')->after('ai_enabled');
            $table->timestamp('ai_tested_at')->nullable()->after('ai_status');
        });
    }

    public function down(): void
    {
        Schema::table('ai_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'ai_provider',
                'ai_api_key',
                'ai_model',
                'ai_enabled',
                'ai_status',
                'ai_tested_at',
            ]);
        });
    }
};
