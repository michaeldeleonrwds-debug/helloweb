<?php

namespace App\Builder\Import;

final class DependencyDetector
{
    /**
     * Inspects DOM or raw HTML to detect external CDN links and scripts (Fonts, CSS libs, JS libs).
     *
     * @return array{
     *     headStylesheets: list<string>,
     *     headScripts: list<string>,
     *     footerScripts: list<string>,
     *     detectedLibraries: list<string>,
     *     unsupportedInteractions: list<string>
     * }
     */
    public function detect(string $html): array
    {
        $headStylesheets = [];
        $headScripts = [];
        $footerScripts = [];
        $detectedLibraries = [];
        $unsupportedInteractions = [];

        // Match Google Fonts, CDN stylesheets
        if (preg_match_all('/<link\b[^>]*href=["\']([^"\']+)["\'][^>]*>/i', $html, $linkMatches, PREG_SET_ORDER)) {
            foreach ($linkMatches as $match) {
                $fullTag = $match[0];
                $href = $match[1];

                // External CSS (fonts, cdnjs, unpkg, jsdelivr)
                if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://') || str_starts_with($href, '//')) {
                    $headStylesheets[] = $fullTag;
                    $libraryName = $this->identifyLibrary($href);
                    if ($libraryName && !in_array($libraryName, $detectedLibraries, true)) {
                        $detectedLibraries[] = $libraryName;
                    }
                }
            }
        }

        // Match external scripts
        if (preg_match_all('/<script\b[^>]*src=["\']([^"\']+)["\'][^>]*>\s*<\/script>/i', $html, $scriptMatches, PREG_SET_ORDER)) {
            foreach ($scriptMatches as $match) {
                $fullTag = $match[0];
                $src = $match[1];

                if (str_starts_with($src, 'http://') || str_starts_with($src, 'https://') || str_starts_with($src, '//')) {
                    $footerScripts[] = $fullTag;
                    $libraryName = $this->identifyLibrary($src);
                    if ($libraryName && !in_array($libraryName, $detectedLibraries, true)) {
                        $detectedLibraries[] = $libraryName;
                    }
                }
            }
        }

        // Detect potential interactive widgets in HTML or inline JS
        if (stripos($html, 'swiper') !== false) {
            $unsupportedInteractions[] = 'Swiper Slider / Carousel';
        }
        if (stripos($html, 'isotope') !== false) {
            $unsupportedInteractions[] = 'Isotope Filtering';
        }
        if (stripos($html, 'gsap') !== false || stripos($html, 'ScrollTrigger') !== false) {
            $unsupportedInteractions[] = 'GSAP / Scroll Animations';
        }
        if (stripos($html, 'chart.js') !== false || stripos($html, 'apexcharts') !== false) {
            $unsupportedInteractions[] = 'Interactive Chart Data';
        }

        return [
            'headStylesheets' => array_values(array_unique($headStylesheets)),
            'headScripts' => array_values(array_unique($headScripts)),
            'footerScripts' => array_values(array_unique($footerScripts)),
            'detectedLibraries' => array_values(array_unique($detectedLibraries)),
            'unsupportedInteractions' => array_values(array_unique($unsupportedInteractions)),
        ];
    }

    /**
     * Deduplicates and cleanly merges imported tags into existing global head/footer code.
     */
    public function mergeHeadCode(?string $existingHeadCode, array $newTags): string
    {
        $existing = trim($existingHeadCode ?? '');
        $merged = $existing;

        foreach ($newTags as $tag) {
            $trimmedTag = trim($tag);
            if ($trimmedTag === '') continue;

            // Extract href or src to see if already included
            if (preg_match('/(?:href|src)=["\']([^"\']+)["\']/i', $trimmedTag, $match)) {
                $url = $match[1];
                if (str_contains($merged, $url)) {
                    continue;
                }
            } elseif (str_contains($merged, $trimmedTag)) {
                continue;
            }

            $merged = ($merged === '') ? $trimmedTag : $merged . "\n" . $trimmedTag;
        }

        return $merged;
    }

    public function mergeFooterCode(?string $existingFooterCode, array $newTags): string
    {
        $existing = trim($existingFooterCode ?? '');
        $merged = $existing;

        foreach ($newTags as $tag) {
            $trimmedTag = trim($tag);
            if ($trimmedTag === '') continue;

            if (preg_match('/(?:src)=["\']([^"\']+)["\']/i', $trimmedTag, $match)) {
                $url = $match[1];
                if (str_contains($merged, $url)) {
                    continue;
                }
            } elseif (str_contains($merged, $trimmedTag)) {
                continue;
            }

            $merged = ($merged === '') ? $trimmedTag : $merged . "\n" . $trimmedTag;
        }

        return $merged;
    }

    private function identifyLibrary(string $url): ?string
    {
        $lower = strtolower($url);
        if (str_contains($lower, 'fonts.googleapis.com')) return 'Google Fonts';
        if (str_contains($lower, 'swiper')) return 'Swiper Slider';
        if (str_contains($lower, 'font-awesome') || str_contains($lower, 'fontawesome')) return 'Font Awesome';
        if (str_contains($lower, 'bootstrap')) return 'Bootstrap CSS/JS';
        if (str_contains($lower, 'tailwind')) return 'Tailwind CDN';
        if (str_contains($lower, 'gsap')) return 'GSAP Animation';
        if (str_contains($lower, 'aos.')) return 'AOS (Animate On Scroll)';
        if (str_contains($lower, 'animate.css')) return 'Animate.css';
        if (str_contains($lower, 'jquery')) return 'jQuery';

        return null;
    }
}
