<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocument;
use App\Builder\Document\BuilderDocumentSchema;

final class DefaultBuilderDocumentFactory
{
    public function create(): BuilderDocument
    {
        return BuilderDocument::fromArray([
            'schemaVersion' => BuilderDocumentSchema::VERSION,
            'root' => [
                'id' => 'root',
                'type' => 'layout.root',
                'props' => [],
                'styles' => [],
                'children' => [[
                    'id' => 'section-default',
                    'type' => 'layout.section',
                    'props' => [],
                    'styles' => [
                        'desktop' => [
                            'paddingTop' => ['value' => 10, 'unit' => 'px'],
                            'paddingBottom' => ['value' => 10, 'unit' => 'px'],
                        ],
                    ],
                    'children' => [[
                        'id' => 'row-default',
                        'type' => 'layout.row',
                        'props' => [],
                        'styles' => [],
                        'children' => [[
                            'id' => 'column-default',
                            'type' => 'layout.column',
                            'props' => [],
                            'styles' => [],
                            'children' => [[
                                'id' => 'heading-default',
                                'type' => 'content.heading',
                                'props' => ['text' => 'Welcome', 'level' => 1],
                                'styles' => [],
                                'children' => [],
                            ]],
                        ]],
                    ]],
                ]],
            ],
        ]);
    }
}
