<?php

namespace Tests\Unit;

use App\Builder\Persistence\DefaultTemplateFactory;
use App\Builder\Persistence\DocumentPersistenceValidator;
use App\Builder\Registry\BuiltInComponentDefinitions;
use Tests\TestCase;

class DefaultTemplateFactoryTest extends TestCase
{
    public function test_all_default_templates_pass_schema_validation(): void
    {
        $validator = new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $templates = DefaultTemplateFactory::defaultTemplates();

        $this->assertGreaterThanOrEqual(12, count($templates));

        foreach ($templates as $template) {
            $validated = $validator->validate($template['document']);
            $this->assertSame(1, $validated->schemaVersion());
            $this->assertNotEmpty($validated->toArray());
        }
    }

    public function test_default_templates_include_mobile_responsive_overrides(): void
    {
        foreach (DefaultTemplateFactory::defaultTemplates() as $template) {
            $root = $template['document']['root'];

            $this->assertTrue($this->hasMobileStyles($root), "{$template['slug']} has no mobile styles.");
            $this->assertMobileRowsCollapse($root, $template['slug']);
        }
    }

    public function test_floating_pill_header_is_out_of_normal_document_flow(): void
    {
        $document = DefaultTemplateFactory::defaultTemplates()[3]['document'];
        $navbar = $document['root']['children'][0];

        $this->assertSame('floating-pill-navbar', $navbar['id']);
        $this->assertSame('layout.navbar', $navbar['type']);
        $this->assertSame('absolute', $navbar['styles']['desktop']['position']);
        $this->assertSame('2rem', $navbar['styles']['desktop']['top']);
        $this->assertSame('1rem', $navbar['styles']['mobile']['left']);
        $this->assertSame('1rem', $navbar['styles']['mobile']['right']);
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function hasMobileStyles(array $node): bool
    {
        if (! empty($node['styles']['mobile'] ?? [])) {
            return true;
        }

        foreach (($node['children'] ?? []) as $child) {
            if (is_array($child) && $this->hasMobileStyles($child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function assertMobileRowsCollapse(array $node, string $slug): void
    {
        if (($node['type'] ?? null) === 'layout.row' && count($node['children'] ?? []) > 1) {
            $this->assertSame('column', $node['styles']['mobile']['flexDirection'] ?? null, "{$slug}: {$node['id']} does not stack on mobile.");
            $this->assertSame('100%', $node['styles']['mobile']['width'] ?? null, "{$slug}: {$node['id']} lacks mobile width.");
        }

        foreach (($node['children'] ?? []) as $child) {
            if (is_array($child)) {
                $this->assertMobileRowsCollapse($child, $slug);
            }
        }
    }
}
