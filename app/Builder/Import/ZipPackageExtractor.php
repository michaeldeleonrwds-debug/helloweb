<?php

namespace App\Builder\Import;

use InvalidArgumentException;
use ZipArchive;

final class ZipPackageExtractor
{
    /**
     * Extracts an uploaded zip file into a temporary directory and indexes its structure.
     *
     * @return array{
     *     tempDir: string,
     *     htmlFiles: list<string>,
     *     cssFiles: list<string>,
     *     jsFiles: list<string>,
     *     assetFiles: list<string>
     * }
     */
    public function extract(string $zipFilePath): array
    {
        if (!file_exists($zipFilePath)) {
            throw new InvalidArgumentException("ZIP file does not exist: {$zipFilePath}");
        }

        $zip = new ZipArchive();
        $status = $zip->open($zipFilePath);
        if ($status !== true) {
            throw new InvalidArgumentException("Unable to open ZIP archive (code: {$status})");
        }

        $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'hw_import_' . uniqid('', true);
        if (!mkdir($tempDir, 0755, true) && !is_dir($tempDir)) {
            $zip->close();
            throw new InvalidArgumentException("Failed to create temporary extraction directory.");
        }

        $htmlFiles = [];
        $cssFiles = [];
        $jsFiles = [];
        $assetFiles = [];

        // Safe extraction avoiding zip-slip
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            if ($filename === false) {
                continue;
            }

            // Normalize slashes
            $normalizedName = str_replace('\\', '/', $filename);

            // Skip dangerous path traversal or hidden files (__MACOSX, .DS_Store)
            if (
                str_contains($normalizedName, '../') ||
                str_starts_with($normalizedName, '/') ||
                str_contains($normalizedName, '__MACOSX') ||
                str_ends_with($normalizedName, '.DS_Store')
            ) {
                continue;
            }

            $targetPath = $tempDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalizedName);

            // If it's a directory
            if (str_ends_with($normalizedName, '/')) {
                if (!is_dir($targetPath)) {
                    mkdir($targetPath, 0755, true);
                }
                continue;
            }

            $parentDir = dirname($targetPath);
            if (!is_dir($parentDir)) {
                mkdir($parentDir, 0755, true);
            }

            $content = $zip->getFromIndex($i);
            if ($content !== false) {
                file_put_contents($targetPath, $content);

                $ext = strtolower(pathinfo($normalizedName, PATHINFO_EXTENSION));
                if (in_array($ext, ['html', 'htm'])) {
                    $htmlFiles[] = $normalizedName;
                } elseif ($ext === 'css') {
                    $cssFiles[] = $normalizedName;
                } elseif (in_array($ext, ['js', 'mjs'])) {
                    $jsFiles[] = $normalizedName;
                } elseif (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'ico', 'woff', 'woff2', 'ttf', 'otf', 'mp4', 'webm'])) {
                    $assetFiles[] = $normalizedName;
                }
            }
        }

        $zip->close();

        // Sort html files so index.html comes first
        usort($htmlFiles, function (string $a, string $b) {
            $baseA = strtolower(basename($a));
            $baseB = strtolower(basename($b));
            if ($baseA === 'index.html' || $baseA === 'index.htm') return -1;
            if ($baseB === 'index.html' || $baseB === 'index.htm') return 1;
            return strcmp($a, $b);
        });

        return [
            'tempDir' => $tempDir,
            'htmlFiles' => $htmlFiles,
            'cssFiles' => $cssFiles,
            'jsFiles' => $jsFiles,
            'assetFiles' => $assetFiles,
        ];
    }

    /**
     * Recursively delete extraction directory.
     */
    public function cleanup(string $tempDir): void
    {
        if (!is_dir($tempDir)) {
            return;
        }

        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($tempDir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                @rmdir($item->getRealPath());
            } else {
                @unlink($item->getRealPath());
            }
        }

        @rmdir($tempDir);
    }
}
