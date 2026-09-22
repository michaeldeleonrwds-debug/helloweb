import type { BuilderPageDocument, ReusableComponentReference } from './document';

export interface BuilderTemplate {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    type: string;
    schemaVersion: number;
    document: BuilderPageDocument;
}

export interface MediaAsset {
    id: number;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    width?: number | null;
    height?: number | null;
    altText?: string | null;
    status: 'active' | 'archived';
    url?: string;
}

export interface MediaReference {
    type: 'media-asset';
    id: number;
    mimeType: string;
    url: string;
    altText?: string | null;
}

export interface ReusableComponent {
    id: number;
    name: string;
    description?: string | null;
    schemaVersion: number;
    document: BuilderPageDocument;
}

export type ReusableInstanceReference = ReusableComponentReference;

export interface BuilderDocumentSaveResponse {
    document: BuilderPageDocument;
    version: number;
}
