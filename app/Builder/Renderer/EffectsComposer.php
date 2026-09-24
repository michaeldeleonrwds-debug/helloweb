<?php

namespace App\Builder\Renderer;

final class EffectsComposer
{
    /**
     * @param  array<string, mixed>  $styles
     * @return array<string, mixed>
     */
    public function apply(array $styles): array
    {
        $next = $styles;

        $dropX = $this->takeNumber($next, 'dropShadowX');
        $dropY = $this->takeNumber($next, 'dropShadowY');
        $dropBlur = $this->takeNumber($next, 'dropShadowBlur');
        $dropSpread = $this->takeNumber($next, 'dropShadowSpread');
        $dropColor = $this->takeColor($next, 'dropShadowColor');
        $innerX = $this->takeNumber($next, 'innerShadowX');
        $innerY = $this->takeNumber($next, 'innerShadowY');
        $innerBlur = $this->takeNumber($next, 'innerShadowBlur');
        $innerSpread = $this->takeNumber($next, 'innerShadowSpread');
        $innerColor = $this->takeColor($next, 'innerShadowColor');
        $layerBlur = $this->takeNumber($next, 'layerBlur');
        $backgroundBlur = $this->takeNumber($next, 'backgroundBlur');
        $glassRefraction = $this->takeNumber($next, 'glassRefraction');
        $glassDepth = $this->takeNumber($next, 'glassDepth');
        $glassDispersion = $this->takeNumber($next, 'glassDispersion');
        $glassFrost = $this->takeNumber($next, 'glassFrost');
        $glassSplay = $this->takeNumber($next, 'glassSplay');
        $glassLightDegree = $this->takeNumber($next, 'glassLightDegree');
        $glassOpacity = $this->takeNumber($next, 'glassOpacity');

        $glassActive = $glassRefraction !== null || $glassDepth !== null || $glassDispersion !== null || $glassFrost !== null
            || $glassSplay !== null || $glassLightDegree !== null || $glassOpacity !== null;
        $dropActive = $dropX !== null || $dropY !== null || $dropBlur !== null || $dropSpread !== null || $dropColor !== null;
        $innerActive = $innerX !== null || $innerY !== null || $innerBlur !== null || $innerSpread !== null || $innerColor !== null;

        $shadowParts = [];

        if ($innerActive) {
            $shadowParts[] = sprintf(
                'inset %s %s %s %s %s',
                $this->px($innerX ?? 0),
                $this->px($innerY ?? 1),
                $this->px($innerBlur ?? 4),
                $this->px($innerSpread ?? 0),
                $innerColor ?? 'rgba(255,255,255,0.35)',
            );
        }

        if ($glassActive) {
            $depth = $glassDepth ?? 0;
            $splay = $glassSplay ?? 0;
            $light = $glassLightDegree ?? 135;
            if ($depth > 0 || $splay > 0) {
                $radians = $light * M_PI / 180;
                $lightOffset = sin($radians) * $depth * 0.12;
                $highlightAlpha = 0.15 + ($splay / 100) * 0.5;
                $shadowParts[] = sprintf('inset 0 %s %s rgba(255,255,255,%s)', $this->px($lightOffset), $this->px($depth * 0.4), number_format($highlightAlpha, 3, '.', ''));
                $shadowParts[] = sprintf('inset 0 %s %s rgba(15,23,42,%s)', $this->px(-$lightOffset * 0.6), $this->px($depth * 0.5), number_format($depth * 0.003, 3, '.', ''));
            }
            $dispersion = $glassDispersion ?? 0;
            if ($dispersion > 0) {
                $offset = $dispersion * 0.08;
                $alpha = number_format($dispersion * 0.004, 3, '.', '');
                $shadowParts[] = sprintf('inset %s 0 %s rgba(255,72,136,%s)', $this->px($offset), $this->px($offset), $alpha);
                $shadowParts[] = sprintf('inset %s 0 %s rgba(64,224,255,%s)', $this->px(-$offset), $this->px($offset), $alpha);
            }
        }

        if ($dropActive) {
            $shadowParts[] = sprintf(
                '%s %s %s %s %s',
                $this->px($dropX ?? 0),
                $this->px($dropY ?? 8),
                $this->px($dropBlur ?? 24),
                $this->px($dropSpread ?? 0),
                $dropColor ?? 'rgba(15,23,42,0.18)',
            );
        }

        $existingShadow = isset($next['boxShadow']) && is_string($next['boxShadow']) && $next['boxShadow'] !== 'none' ? $next['boxShadow'] : '';
        if ($shadowParts !== []) {
            $next['boxShadow'] = implode(', ', array_values(array_filter([...$shadowParts, $existingShadow], static fn (string $part): bool => $part !== '')));
        }

        if ($layerBlur !== null) {
            $base = isset($next['filter']) && is_string($next['filter']) && $next['filter'] !== 'none' ? $next['filter'] : '';
            $composed = sprintf('blur(%s)%s', $this->px($layerBlur), $base !== '' ? " {$base}" : '');
            if ($layerBlur === 0 && $base === '') {
                unset($next['filter']);
            } else {
                $next['filter'] = $composed;
            }
        }

        $backdropParts = [];
        if ($backgroundBlur !== null && $backgroundBlur > 0) {
            $backdropParts[] = sprintf('blur(%s)', $this->px($backgroundBlur));
        }
        if ($glassActive) {
            $frost = $glassFrost ?? 0;
            $refraction = $glassRefraction ?? 0;
            if ($frost > 0) {
                $backdropParts[] = sprintf('blur(%s)', $this->px($frost * 0.4));
            }
            if ($refraction > 0) {
                $backdropParts[] = sprintf('saturate(%d%%)', (int) round(100 + $refraction));
                $backdropParts[] = sprintf('contrast(%d%%)', (int) round(100 + $refraction * 0.4));
            }
        }
        if ($backdropParts !== []) {
            $base = isset($next['backdropFilter']) && is_string($next['backdropFilter']) && $next['backdropFilter'] !== 'none' ? $next['backdropFilter'] : '';
            $next['backdropFilter'] = implode(' ', array_values(array_filter([...$backdropParts, $base], static fn (string $part): bool => $part !== '')));
        }

        if ($glassActive) {
            $alpha = min(100, max(0, $glassOpacity ?? 16)) / 100;
            $degrees = $glassLightDegree ?? 135;
            $sheen = sprintf(
                'linear-gradient(%sdeg, rgba(255,255,255,%s), rgba(255,255,255,%s) 45%%, rgba(255,255,255,0))',
                rtrim(rtrim(number_format($degrees, 2, '.', ''), '0'), '.'),
                number_format($alpha, 3, '.', ''),
                number_format($alpha * 0.3, 3, '.', ''),
            );
            $existingImage = isset($next['backgroundImage']) && is_string($next['backgroundImage']) && $next['backgroundImage'] !== '' ? $next['backgroundImage'] : '';
            $next['backgroundImage'] = $existingImage !== '' ? "{$sheen}, {$existingImage}" : $sheen;
        }

        return $next;
    }

    /**
     * @param  array<string, mixed>  $styles
     */
    private function takeNumber(array &$styles, string $key): ?float
    {
        if (! array_key_exists($key, $styles)) {
            return null;
        }
        $value = $styles[$key];
        unset($styles[$key]);

        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }
        if (is_string($value) && is_numeric($value)) {
            return (float) $value;
        }

        return 0.0;
    }

    /**
     * @param  array<string, mixed>  $styles
     */
    private function takeColor(array &$styles, string $key): ?string
    {
        if (! array_key_exists($key, $styles)) {
            return null;
        }
        $value = $styles[$key];
        unset($styles[$key]);

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function px(float $value): string
    {
        $rounded = round($value * 100) / 100;

        return rtrim(rtrim(number_format($rounded, 2, '.', ''), '0'), '.').'px';
    }
}
