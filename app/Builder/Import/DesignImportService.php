<?php

namespace App\Builder\Import;

use App\Builder\Document\BuilderDocument;
use App\Builder\Media\MediaAssetService;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\ReusableComponentService;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Models\MediaAsset;
use App\Models\Page;
use App\Models\ReusableComponent;
use App\Models\Template;
use App\Models\User;
use App\Models\Website;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

final class DesignImportService
{
    public function __construct(
        private readonly ZipPackageExtractor $extractor,
        private readonly HtmlDomNormalizer $normalizer,
        private readonly CssScoper $cssScoper,
        private readonly DependencyDetector $dependencyDetector,
        private readonly MediaAssetService $mediaService,
        private readonly ReusableComponentService $reusableService,
        private readonly TemplatePersistenceService $templateService,
        private readonly BuilderPagePersistenceService $pagePersistenceService,
    ) {}

    /**
     * Inspects an uploaded ZIP package without committing changes to disk.
     *
     * @return array{
     *     type: 'component'|'template',
     *     name: string,
     *     htmlFiles: list<string>,
     *     cssFiles: list<string>,
     *     jsFiles: list<string>,
     *     assetFiles: list<string>,
     *     detectedLibraries: list<string>,
     *     unsupportedInteractions: list<string>,
     *     detectedProps: array<string, mixed>,
     *     pagesCount: int
     * }
     */
    public function analyze(UploadedFile $file, string $targetType): array
    {
        $package = $this->extractor->extract($file->getRealPath());

        try {
            $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $name = ucwords(str_replace(['-', '_'], ' ', $name));

            // Read the primary HTML file
            $primaryHtml = '';
            if (!empty($package['htmlFiles'])) {
                $primaryHtmlPath = $package['tempDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $package['htmlFiles'][0]);
                if (file_exists($primaryHtmlPath)) {
                    $primaryHtml = file_get_contents($primaryHtmlPath) ?: '';
                }
            }

            $deps = $this->dependencyDetector->detect($primaryHtml);

            // Mock asset map for dry-run analysis
            $mockAssetMap = [];
            foreach ($package['assetFiles'] as $assetRelPath) {
                $mockAssetMap[$assetRelPath] = '/storage/mock/' . basename($assetRelPath);
            }

            $normalized = $this->normalizer->normalize($primaryHtml, $mockAssetMap, $targetType === 'component' ? 'preview' : null);

            return [
                'type' => $targetType === 'template' ? 'template' : 'component',
                'name' => $name,
                'htmlFiles' => $package['htmlFiles'],
                'cssFiles' => $package['cssFiles'],
                'jsFiles' => $package['jsFiles'],
                'assetFiles' => $package['assetFiles'],
                'detectedLibraries' => $deps['detectedLibraries'],
                'unsupportedInteractions' => array_values(array_unique(array_merge($deps['unsupportedInteractions'], $normalized['detectedInteractions']))),
                'detectedProps' => $normalized['detectedProps'],
                'pagesCount' => max(1, count($package['htmlFiles'])),
            ];
        } finally {
            $this->extractor->cleanup($package['tempDir']);
        }
    }

    /**
     * Imports as a COMPONENT:
     * - Ingests images into MediaAsset
     * - Scopes CSS to [data-hw-component="{id}"]
     * - Converts HTML into BuilderComponentNode tree
     * - Creates ReusableComponent entry
     */
    public function importComponent(User $user, UploadedFile $file, ?string $customName = null): ReusableComponent
    {
        $package = $this->extractor->extract($file->getRealPath());

        try {
            $name = $customName ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $name = ucwords(str_replace(['-', '_'], ' ', $name));
            $scopeId = 'hw-' . Str::slug($name) . '-' . substr(Str::uuid(), 0, 6);

            // 1. Ingest assets into Media Library
            $assetUrlMap = $this->ingestAssets($user, $package['tempDir'], $package['assetFiles']);

            // 2. Read and scope CSS
            $scopedCss = '';
            foreach ($package['cssFiles'] as $cssRelPath) {
                $fullPath = $package['tempDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $cssRelPath);
                if (file_exists($fullPath)) {
                    $rawCss = file_get_contents($fullPath) ?: '';
                    $scopedCss .= "\n" . $this->cssScoper->scope($rawCss, $scopeId, $assetUrlMap);
                }
            }

            // 3. Read primary HTML
            $primaryHtml = '';
            if (!empty($package['htmlFiles'])) {
                $primaryHtmlPath = $package['tempDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $package['htmlFiles'][0]);
                if (file_exists($primaryHtmlPath)) {
                    $primaryHtml = file_get_contents($primaryHtmlPath) ?: '';
                }
            }

            // 4. Normalize DOM to native document tree
            $normalized = $this->normalizer->normalize($primaryHtml, $assetUrlMap, $scopeId);

            // Attach scoped CSS to metadata
            $documentArray = [
                'schemaVersion' => 1,
                'root' => $normalized['rootNode'],
                'metadata' => [
                    'componentScopeId' => $scopeId,
                    'scopedCss' => trim($scopedCss),
                    'detectedProps' => $normalized['detectedProps'],
                ],
            ];

            return $this->reusableService->create($user, $name, $documentArray, "Imported component {$name}");
        } finally {
            $this->extractor->cleanup($package['tempDir']);
        }
    }

    /**
     * Imports as a TEMPLATE:
     * - Ingests assets into Media Library
     * - Merges external dependencies into globalHeadCode / globalFooterCode
     * - Generates multi-page Website or Template
     */
    public function importTemplate(User $user, UploadedFile $file, ?string $customName = null): Template
    {
        $package = $this->extractor->extract($file->getRealPath());

        try {
            $name = $customName ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $name = ucwords(str_replace(['-', '_'], ' ', $name));

            // 1. Ingest assets into Media Library
            $assetUrlMap = $this->ingestAssets($user, $package['tempDir'], $package['assetFiles']);

            // 2. Read primary HTML for dependencies
            $primaryHtml = '';
            if (!empty($package['htmlFiles'])) {
                $primaryHtmlPath = $package['tempDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $package['htmlFiles'][0]);
                if (file_exists($primaryHtmlPath)) {
                    $primaryHtml = file_get_contents($primaryHtmlPath) ?: '';
                }
            }

            $deps = $this->dependencyDetector->detect($primaryHtml);

            // Read CSS to combine into global head
            $globalCss = '';
            foreach ($package['cssFiles'] as $cssRelPath) {
                $fullPath = $package['tempDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $cssRelPath);
                if (file_exists($fullPath)) {
                    $rawCss = file_get_contents($fullPath) ?: '';
                    $globalCss .= "\n" . $this->cssScoper->rewriteUrls($rawCss, $assetUrlMap);
                }
            }

            $headCode = implode("\n", $deps['headStylesheets']);
            if (trim($globalCss) !== '') {
                $headCode .= "\n<style>\n" . trim($globalCss) . "\n</style>";
            }

            $footerCode = implode("\n", $deps['footerScripts']);

            // 3. Normalize primary page
            $normalized = $this->normalizer->normalize($primaryHtml, $assetUrlMap);

            $documentArray = [
                'schemaVersion' => 1,
                'root' => $normalized['rootNode'],
                'metadata' => [
                    'globalHeadCode' => trim($headCode),
                    'globalFooterCode' => trim($footerCode),
                    'detectedLibraries' => $deps['detectedLibraries'],
                ],
            ];

            return $this->templateService->create(
                user: $user,
                name: $name,
                document: $documentArray,
                slug: Str::slug($name),
                description: "Imported full website template: {$name}",
                type: 'website'
            );
        } finally {
            $this->extractor->cleanup($package['tempDir']);
        }
    }

    /**
     * Stores extracted assets in Media Library and returns map of relative paths to public URLs.
     *
     * @param list<string> $assetRelPaths
     * @return array<string, string>
     */
    private function ingestAssets(User $user, string $tempDir, array $assetRelPaths): array
    {
        $map = [];

        foreach ($assetRelPaths as $relPath) {
            $fullPath = $tempDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
            if (!file_exists($fullPath)) {
                continue;
            }

            $filename = basename($relPath);
            $mimeType = mime_content_type($fullPath) ?: 'application/octet-stream';
            $contents = file_get_contents($fullPath) ?: '';

            try {
                $asset = $this->mediaService->store($user, $filename, $mimeType, $contents, [
                    'importedPath' => $relPath,
                ]);
                $reference = $this->mediaService->reference($user, $asset);
                $map[$relPath] = $reference->url;
                $map[$filename] = $reference->url;
                $map[ltrim($relPath, './')] = $reference->url;
            } catch (\Throwable) {
                // If media storage fails for one asset, continue with others
            }
        }

        return $map;
    }
}
