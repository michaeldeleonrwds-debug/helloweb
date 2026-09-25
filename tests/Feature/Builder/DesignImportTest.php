<?php

namespace Tests\Feature\Builder;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;
use ZipArchive;

class DesignImportTest extends TestCase
{
    use RefreshDatabase;

    private function createZipArchive(array $files): string
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'test_zip_') . '.zip';
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach ($files as $name => $content) {
            $zip->addFromString($name, $content);
        }

        $zip->close();
        return $zipPath;
    }

    public function test_can_analyze_design_package_zip(): void
    {
        $user = User::factory()->create();

        $zipFile = $this->createZipArchive([
            'index.html' => '<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter"><link rel="stylesheet" href="styles.css"></head><body><section class="hero"><h1>Awesome Block</h1><p>Test description</p><a href="/signup" class="btn">Sign Up</a></section></body></html>',
            'styles.css' => '.hero { padding: 40px; background: #fff; }',
            'assets/icon.png' => 'fake_png_data',
        ]);

        $uploaded = new UploadedFile($zipFile, 'awesome-block.zip', 'application/zip', null, true);

        $response = $this->actingAs($user)->postJson(route('builder.import.analyze'), [
            'file' => $uploaded,
            'type' => 'component',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('analysis.name', 'Awesome Block');
        $response->assertJsonPath('analysis.type', 'component');
        $this->assertContains('Google Fonts', $response->json('analysis.detectedLibraries'));
        $this->assertNotEmpty($response->json('analysis.detectedProps'));

        @unlink($zipFile);
    }

    public function test_can_import_as_reusable_component(): void
    {
        $user = User::factory()->create();

        $zipFile = $this->createZipArchive([
            'index.html' => '<section class="pricing-card"><h2>Pro Plan</h2><p>$29/mo</p><button>Choose Plan</button></section>',
            'style.css' => '.pricing-card { border-radius: 12px; }',
        ]);

        $uploaded = new UploadedFile($zipFile, 'pricing-card.zip', 'application/zip', null, true);

        $response = $this->actingAs($user)->postJson(route('builder.import.component'), [
            'file' => $uploaded,
            'name' => 'Custom Pricing Block',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('component.name', 'Custom Pricing Block');

        $this->assertDatabaseHas('reusable_components', [
            'user_id' => $user->id,
            'name' => 'Custom Pricing Block',
            'status' => 'active',
        ]);

        @unlink($zipFile);
    }

    public function test_can_import_as_template(): void
    {
        $user = User::factory()->create();

        $zipFile = $this->createZipArchive([
            'index.html' => '<html><head><title>Portfolio</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></head><body><section><h1>Portfolio Home</h1></section></body></html>',
            'about.html' => '<html><body><section><h1>About Me</h1></section></body></html>',
            'style.css' => 'body { font-family: sans-serif; }',
        ]);

        $uploaded = new UploadedFile($zipFile, 'portfolio-website.zip', 'application/zip', null, true);

        $response = $this->actingAs($user)->postJson(route('builder.import.template'), [
            'file' => $uploaded,
            'name' => 'Portfolio Template',
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('template.name', 'Portfolio Template');

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'name' => 'Portfolio Template',
            'type' => 'website',
            'status' => 'active',
        ]);

        @unlink($zipFile);
    }
}
