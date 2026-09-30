<?php

use App\Builder\Persistence\DefaultTemplateFactory;
use App\Builder\Persistence\DocumentPersistenceValidator;
use App\Builder\Registry\BuiltInComponentDefinitions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->boolean('is_customized')->default(false)->after('is_platform');
        });

        $this->protectExistingCustomizations();
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn('is_customized');
        });
    }

    /**
     * One-time backfill: any platform template whose stored document already differs
     * from the factory default has been edited by hand and must survive the
     * ensureDefaultTemplates() refresh instead of being reverted.
     */
    private function protectExistingCustomizations(): void
    {
        $factoryBySlug = [];
        foreach (DefaultTemplateFactory::defaultTemplates() as $def) {
            $factoryBySlug[$def['slug']] = $def['document'];
        }

        if ($factoryBySlug === []) {
            return;
        }

        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());

        DB::table('templates')
            ->where('is_platform', true)
            ->whereIn('slug', array_keys($factoryBySlug))
            ->orderBy('id')
            ->chunkById(100, function ($templates) use ($factoryBySlug, $validator): void {
                foreach ($templates as $template) {
                    $factory = $factoryBySlug[$template->slug] ?? null;
                    if ($factory === null) {
                        continue;
                    }

                    $stored = json_decode((string) $template->document, true);
                    if (! is_array($stored)) {
                        continue;
                    }

                    $expected = $factory;
                    try {
                        $expected = $validator->validate($factory)->toArray();
                    } catch (\Throwable) {
                        // Fall back to the raw factory document when normalization fails.
                    }

                    if ($stored != $expected) {
                        DB::table('templates')->where('id', $template->id)->update(['is_customized' => true]);
                    }
                }
            });
    }
};
