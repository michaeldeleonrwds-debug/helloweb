<?php

namespace App\Builder\Import;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;
use DOMXPath;
use Illuminate\Support\Str;

final class HtmlDomNormalizer
{
    private function formatStyles(array $styles): array
    {
        return empty($styles) ? [] : ['desktop' => $styles];
    }
    /**
     * Parse HTML and convert into a native BuilderComponentNode hierarchy.
     *
     * @param array<string, string> $assetUrlMap Map of relative paths to stored asset URLs
     * @param string|null $componentScopeId Unique component ID for scoped CSS attribute if Component mode
     * @return array{
     *     rootNode: array,
     *     detectedProps: array<string, mixed>,
     *     detectedInteractions: list<string>
     * }
     */
    public function normalize(string $html, array $assetUrlMap = [], ?string $componentScopeId = null): array
    {
        $dom = new DOMDocument();
        // Suppress warnings for HTML5 elements like <section>, <nav>, <header>
        libxml_use_internal_errors(true);
        $encodedHtml = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
        $dom->loadHTML($encodedHtml, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        // Find the main body or container
        $body = $xpath->query('//body')->item(0);
        $rootContainer = $body ?? $dom->documentElement;

        $detectedProps = [];
        $detectedInteractions = [];

        // Check for interactive attributes
        $nodesWithScripts = $xpath->query('//script | //*[@onclick] | //*[@data-toggle] | //*[@data-bs-toggle]');
        if ($nodesWithScripts->length > 0) {
            $detectedInteractions[] = 'Interactive attributes/scripts detected (handled safely via code containers)';
        }

        // Build native Section nodes
        $sections = [];
        if ($rootContainer !== null) {
            foreach ($rootContainer->childNodes as $child) {
                if ($child instanceof DOMElement) {
                    $tag = strtolower($child->tagName);
                    if (in_array($tag, ['script', 'style', 'meta', 'link'])) {
                        continue;
                    }

                    // Convert top-level elements to Section nodes
                    $section = $this->elementToSection($child, $assetUrlMap, $detectedProps, $componentScopeId);
                    if ($section !== null) {
                        $sections[] = $section;
                    }
                }
            }
        }

        // If no sections were extracted, fallback to a single Section with custom code
        if (empty($sections)) {
            $sections[] = [
                'id' => 'section-' . Str::uuid(),
                'type' => 'layout.section',
                'props' => [],
                'styles' => [
                    'desktop' => [
                        'padding' => '4rem 1.5rem',
                        'width' => '100%',
                    ],
                ],
                'children' => [
                    [
                        'id' => 'code-' . Str::uuid(),
                        'type' => 'code.customcode',
                        'props' => ['code' => $html],
                        'styles' => [],
                        'children' => [],
                    ],
                ],
            ];
        }

        $root = [
            'id' => 'root',
            'type' => 'layout.root',
            'props' => [],
            'styles' => [],
            'children' => $sections,
        ];

        return [
            'rootNode' => $root,
            'detectedProps' => $detectedProps,
            'detectedInteractions' => $detectedInteractions,
        ];
    }

    private function elementToSection(DOMElement $element, array $assetUrlMap, array &$detectedProps, ?string $componentScopeId): ?array
    {
        $tag = strtolower($element->tagName);

        // Map navbar or header
        if ($tag === 'nav' || $tag === 'header') {
            $navNode = $this->elementToNode($element, $assetUrlMap, $detectedProps, $componentScopeId);
            return [
                'id' => 'section-' . Str::uuid(),
                'type' => 'layout.section',
                'props' => [],
                'styles' => [
                    'desktop' => [
                        'width' => '100%',
                        'padding' => '0',
                    ],
                ],
                'children' => [$navNode],
            ];
        }

        // If it's already a <section> or container <div>
        $children = [];
        foreach ($element->childNodes as $child) {
            if ($child instanceof DOMElement) {
                $childTag = strtolower($child->tagName);
                if (in_array($childTag, ['script', 'style', 'meta', 'link'])) {
                    continue;
                }
                $node = $this->elementToNode($child, $assetUrlMap, $detectedProps, $componentScopeId);
                if ($node !== null) {
                    $children[] = $node;
                }
            } elseif ($child instanceof DOMText && trim($child->textContent) !== '') {
                $children[] = [
                    'id' => 'text-' . Str::uuid(),
                    'type' => 'content.text',
                    'props' => ['text' => trim($child->textContent)],
                    'styles' => [],
                    'children' => [],
                ];
            }
        }

        $styles = $this->extractInlineStyles($element);
        if ($componentScopeId !== null) {
            $element->setAttribute('data-hw-component', $componentScopeId);
        }

        return [
            'id' => 'section-' . Str::uuid(),
            'type' => 'layout.section',
            'props' => [],
            'styles' => [
                'desktop' => array_merge([
                    'width' => '100%',
                    'padding' => '3rem 1.5rem',
                ], $styles),
            ],
            'children' => $children,
            'metadata' => $componentScopeId ? ['componentScopeId' => $componentScopeId] : [],
        ];
    }

    private function elementToNode(DOMElement $element, array $assetUrlMap, array &$detectedProps, ?string $componentScopeId): ?array
    {
        $tag = strtolower($element->tagName);
        $styles = $this->extractInlineStyles($element);

        // 1. Headings (h1 - h6)
        if (in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
            $level = (int) substr($tag, 1);
            $text = trim($element->textContent);
            $propKey = 'heading_' . substr(Str::slug($text), 0, 20);
            $detectedProps[$propKey] = $text;

            return [
                'id' => 'heading-' . Str::uuid(),
                'type' => 'content.heading',
                'props' => [
                    'text' => $text,
                    'level' => $level,
                ],
                'styles' => $this->formatStyles($styles),
                'children' => [],
            ];
        }

        // 2. Images (<img>)
        if ($tag === 'img') {
            $src = $element->getAttribute('src');
            $alt = $element->getAttribute('alt') ?: 'Imported Image';
            $resolvedSrc = $this->resolveAssetUrl($src, $assetUrlMap);

            $propKey = 'image_' . substr(Str::slug($alt), 0, 20);
            $detectedProps[$propKey] = $resolvedSrc;

            return [
                'id' => 'image-' . Str::uuid(),
                'type' => 'media.image',
                'props' => [
                    'src' => $resolvedSrc,
                    'alt' => $alt,
                ],
                'styles' => $this->formatStyles($styles),
                'children' => [],
            ];
        }

        // 3. Buttons (<button> or <a class="btn|button">)
        $class = $element->getAttribute('class');
        if ($tag === 'button' || ($tag === 'a' && (str_contains($class, 'btn') || str_contains($class, 'button')))) {
            $text = trim($element->textContent);
            $href = $element->getAttribute('href') ?: '#';
            $propKey = 'button_' . substr(Str::slug($text), 0, 20);
            $detectedProps[$propKey] = ['label' => $text, 'href' => $href];

            return [
                'id' => 'button-' . Str::uuid(),
                'type' => 'content.button',
                'props' => [
                    'text' => $text,
                    'href' => $href,
                ],
                'styles' => $this->formatStyles($styles),
                'children' => [],
            ];
        }

        // 4. Regular Links (<a>)
        if ($tag === 'a') {
            $text = trim($element->textContent);
            $href = $element->getAttribute('href') ?: '#';

            return [
                'id' => 'link-' . Str::uuid(),
                'type' => 'content.link',
                'props' => [
                    'text' => $text,
                    'href' => $href,
                ],
                'styles' => $this->formatStyles($styles),
                'children' => [],
            ];
        }

        // 5. Paragraphs (<p>)
        if ($tag === 'p') {
            $text = trim($element->textContent);
            $propKey = 'text_' . substr(Str::slug(substr($text, 0, 20)), 0, 20);
            $detectedProps[$propKey] = $text;

            return [
                'id' => 'text-' . Str::uuid(),
                'type' => 'content.text',
                'props' => [
                    'text' => $text,
                ],
                'styles' => $this->formatStyles($styles),
                'children' => [],
            ];
        }

        // 6. Generic Container / Card / Flex / Grid
        $children = [];
        foreach ($element->childNodes as $child) {
            if ($child instanceof DOMElement) {
                $childTag = strtolower($child->tagName);
                if (in_array($childTag, ['script', 'style', 'meta', 'link'])) {
                    continue;
                }
                $cNode = $this->elementToNode($child, $assetUrlMap, $detectedProps, $componentScopeId);
                if ($cNode !== null) {
                    $children[] = $cNode;
                }
            } elseif ($child instanceof DOMText && trim($child->textContent) !== '') {
                $children[] = [
                    'id' => 'text-' . Str::uuid(),
                    'type' => 'content.text',
                    'props' => ['text' => trim($child->textContent)],
                    'styles' => [],
                    'children' => [],
                ];
            }
        }

        // Detect if Card
        $isCard = str_contains($class, 'card') || str_contains($class, 'pricing-box') || str_contains($class, 'testimonial');
        $nodeType = $isCard ? 'marketing.card' : 'layout.container';

        return [
            'id' => ($isCard ? 'card-' : 'container-') . Str::uuid(),
            'type' => $nodeType,
            'props' => [],
            'styles' => $this->formatStyles($styles),
            'children' => $children,
        ];
    }

    private function resolveAssetUrl(string $rawSrc, array $assetUrlMap): string
    {
        $rawSrc = trim($rawSrc);
        if (str_starts_with($rawSrc, 'http://') || str_starts_with($rawSrc, 'https://') || str_starts_with($rawSrc, '//') || str_starts_with($rawSrc, 'data:')) {
            return $rawSrc;
        }

        $normalized = ltrim(str_replace('\\', '/', $rawSrc), './');
        $basename = basename($normalized);

        if (isset($assetUrlMap[$normalized])) {
            return $assetUrlMap[$normalized];
        }
        if (isset($assetUrlMap[$basename])) {
            return $assetUrlMap[$basename];
        }

        return $rawSrc;
    }

    /**
     * Extracts styles from style="" attribute.
     */
    private function extractInlineStyles(DOMElement $element): array
    {
        $styleAttr = $element->getAttribute('style');
        if (empty($styleAttr)) {
            return [];
        }

        $styles = [];
        $rules = explode(';', $styleAttr);
        foreach ($rules as $rule) {
            $parts = explode(':', $rule, 2);
            if (count($parts) === 2) {
                $key = Str::camel(trim($parts[0]));
                $value = trim($parts[1]);
                if ($key !== '' && $value !== '') {
                    $styles[$key] = $value;
                }
            }
        }

        return $styles;
    }
}
