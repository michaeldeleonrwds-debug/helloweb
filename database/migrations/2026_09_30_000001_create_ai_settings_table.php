<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('openai_api_key')->nullable();
            $table->string('openai_model')->default('gpt-4.1-mini');
            $table->boolean('openai_enabled')->default(false);
            $table->string('openai_status')->default('not_configured');
            $table->timestamp('openai_tested_at')->nullable();
            $table->boolean('mcp_enabled')->default(false);
            $table->json('mcp_configuration')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
    }
};
