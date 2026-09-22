<?php

namespace Tests\Unit\Builder;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;
use App\Builder\Document\BuilderDocumentValidator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class BuilderDocumentTest extends TestCase
{
    public function test_valid_minimal_document_passes(): void
    {
        $result = $this->validator()->validate($this->minimalDocument());

        $this->assertTrue($result->passes());
        $this->assertSame([], $result->errors());
    }

    public function test_missing_schema_version_fails(): void
    {
        $document = $this->minimalDocument();
        unset($document['schemaVersion']);

        $this->assertTrue($this->validator()->validate($document)->fails());
    }

    public function test_invalid_root_fails(): void
    {
        $document = $this->minimalDocument();
        $document['root'] = [];

        $this->assertTrue($this->validator()->validate($document)->fails());
    }

    public function test_node_without_id_fails(): void
    {
        $document = $this->minimalDocument();
        unset($document['root']['id']);

        $this->assertTrue($this->validator()->validate($document)->fails());
    }

    public function test_node_without_type_fails(): void
    {
        $document = $this->minimalDocument();
        unset($document['root']['type']);

        $this->assertTrue($this->validator()->validate($document)->fails());
    }

    public function test_invalid_children_structure_fails(): void
    {
        $document = $this->minimalDocument();
        $document['root']['children'] = ['not-a-node'];

        $this->assertTrue($this->validator()->validate($document)->fails());
    }

    public function test_invalid_document_structure_fails(): void
    {
        $this->assertTrue($this->validator()->validate('not-a-document')->fails());
    }

    public function test_valid_nested_nodes_pass(): void
    {
        $document = $this->minimalDocument([
            [
                'id' => 'node_section_1',
                'type' => 'layout.section',
                'props' => [],
                'styles' => [
                    'desktop' => ['paddingTop' => '4rem'],
                    'mobile' => ['paddingTop' => '2rem'],
                ],
                'children' => [
                    [
                        'id' => 'node_heading_1',
                        'type' => 'content.heading',
                        'props' => ['text' => 'Hello'],
                        'styles' => [
                            'desktop' => ['fontSize' => 48],
                            'tablet' => ['fontSize' => 36],
                            'mobile' => ['fontSize' => 28],
                        ],
                        'children' => [],
                        'metadata' => ['label' => 'Hero heading'],
                    ],
                ],
            ],
        ]);

        $this->assertTrue($this->validator()->validate($document)->passes());
    }

    public function test_serialization_deserialization_preserves_document(): void
    {
        $document = BuilderDocument::fromArray($this->minimalDocument());
        $json = $document->toJson();
        $restored = BuilderDocument::fromJson($json);

        $this->assertSame($document->toArray(), $restored->toArray());
    }

    public function test_schema_version_is_preserved(): void
    {
        $document = BuilderDocument::fromArray($this->minimalDocument());

        $this->assertSame(BuilderDocumentSchema::VERSION, $document->schemaVersion());
        $this->assertSame(BuilderDocumentSchema::VERSION, $document->toArray()['schemaVersion']);
    }

    public function test_builder_document_rejects_invalid_data(): void
    {
        $this->expectException(InvalidArgumentException::class);

        BuilderDocument::fromArray(['schemaVersion' => BuilderDocumentSchema::VERSION]);
    }

    private function validator(): BuilderDocumentValidator
    {
        return new BuilderDocumentValidator();
    }

    /**
     * @param list<array<string, mixed>> $children
     * @return array<string, mixed>
     */
    private function minimalDocument(array $children = []): array
    {
        return [
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'node_root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => $children,
                'metadata' => [],
            ],
            'metadata' => [],
        ];
    }
}
