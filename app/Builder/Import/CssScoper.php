<?php

namespace App\Builder\Import;

final class CssScoper
{
    /**
     * Scopes raw CSS rules so they only apply within elements matching `[data-hw-component="{scopeId}"]`.
     * Also rewrites relative url(...) to match resolved asset URLs.
     *
     * @param array<string, string> $assetUrlMap Map of relative paths to stored asset URLs
     */
    public function scope(string $css, string $scopeId, array $assetUrlMap = []): string
    {
        // Replace asset URLs in CSS
        $css = $this->rewriteUrls($css, $assetUrlMap);

        // Remove comments
        $css = preg_replace('/\/\*[\s\S]*?\*\//', '', $css);
        if ($css === null) {
            return '';
        }

        $scopeSelector = "[data-hw-component=\"{$scopeId}\"]";
        $output = '';

        // Match media queries or regular rules
        $tokens = preg_split('/(@media[^{]+|\{[^}]*\})/', $css, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        if (!$tokens) {
            return $css;
        }

        $currentMedia = null;
        $currentSelector = null;

        for ($i = 0; $i < count($tokens); $i++) {
            $token = trim($tokens[$i]);
            if (empty($token)) continue;

            if (str_starts_with($token, '@media') || str_starts_with($token, '@supports')) {
                // If it's an @-rule block
                $output .= $token . ' { ';
                continue;
            }

            if ($token === '}') {
                $output .= "}\n";
                continue;
            }

            if (str_starts_with($token, '{') && str_ends_with($token, '}')) {
                // It's the declarations body for $currentSelector
                if ($currentSelector !== null) {
                    $scoped = $this->scopeSelectorGroup($currentSelector, $scopeSelector);
                    if (!empty($scoped)) {
                        $output .= "{$scoped} {$token}\n";
                    }
                    $currentSelector = null;
                }
            } else {
                // Selector
                $currentSelector = $token;
            }
        }

        return trim($output);
    }

    /**
     * Scopes comma-separated selectors.
     */
    private function scopeSelectorGroup(string $selectorGroup, string $scopeSelector): string
    {
        $selectors = explode(',', $selectorGroup);
        $scoped = [];

        foreach ($selectors as $sel) {
            $sel = trim($sel);
            if (empty($sel)) continue;

            // Skip @keyframes, @font-face, etc.
            if (str_starts_with($sel, '@')) {
                $scoped[] = $sel;
                continue;
            }

            // If selector targets :root, html, or body, map to $scopeSelector
            if ($sel === ':root' || $sel === 'html' || $sel === 'body') {
                $scoped[] = $scopeSelector;
            } elseif (str_starts_with($sel, 'body ') || str_starts_with($sel, 'html ')) {
                $scoped[] = "{$scopeSelector} " . substr($sel, 5);
            } else {
                $scoped[] = "{$scopeSelector} {$sel}";
            }
        }

        return implode(', ', $scoped);
    }

    /**
     * Rewrites url(...) in CSS with uploaded assets.
     */
    public function rewriteUrls(string $css, array $assetUrlMap): string
    {
        if (empty($assetUrlMap)) {
            return $css;
        }

        return preg_replace_callback('/url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)/i', function ($matches) use ($assetUrlMap) {
            $rawPath = trim($matches[1]);
            // If already absolute or data url, keep it
            if (str_starts_with($rawPath, 'http://') || str_starts_with($rawPath, 'https://') || str_starts_with($rawPath, '//') || str_starts_with($rawPath, 'data:')) {
                return $matches[0];
            }

            $normalized = ltrim(str_replace('\\', '/', $rawPath), './');
            $basename = basename($normalized);

            // Try exact match or basename match in assetUrlMap
            if (isset($assetUrlMap[$normalized])) {
                return 'url("' . $assetUrlMap[$normalized] . '")';
            }
            if (isset($assetUrlMap[$basename])) {
                return 'url("' . $assetUrlMap[$basename] . '")';
            }

            return $matches[0];
        }, $css);
    }
}
