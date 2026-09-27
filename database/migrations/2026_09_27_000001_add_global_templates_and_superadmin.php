<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->foreignId('header_template_id')->nullable()->after('homepage_page_id')->constrained('templates')->nullOnDelete();
            $table->foreignId('footer_template_id')->nullable()->after('header_template_id')->constrained('templates')->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_superadmin')->default(false)->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropForeign(['header_template_id']);
            $table->dropForeign(['footer_template_id']);
            $table->dropColumn(['header_template_id', 'footer_template_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_superadmin');
        });
    }
};
