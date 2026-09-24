<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->string('site_title')->nullable()->after('name');
            $table->string('tagline')->nullable()->after('site_title');
            $table->string('favicon_url')->nullable()->after('tagline');
            $table->foreignId('homepage_page_id')->nullable()->after('status')->constrained('pages')->nullOnDelete();
        });

        DB::table('websites')->orderBy('id')->each(function (object $website): void {
            $homepageId = DB::table('pages')->where('website_id', $website->id)->orderBy('id')->value('id');
            if ($homepageId !== null) {
                DB::table('websites')->where('id', $website->id)->update(['homepage_page_id' => $homepageId]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropForeign(['homepage_page_id']);
            $table->dropColumn(['site_title', 'tagline', 'favicon_url', 'homepage_page_id']);
        });
    }
};
