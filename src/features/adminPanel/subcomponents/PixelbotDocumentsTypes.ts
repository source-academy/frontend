export type PixelbotCategory = {
  id: number;
  name: string;
};

export type PixelbotDocument = {
  id: number;
  categoryId: number;
  docKey: string;
  title: string;
  description: string;
  releaseDate: string | null;
  filename: string;
  mediaType: string;
};

export type PixelbotDocumentsIndex = {
  categories: PixelbotCategory[];
  documents: PixelbotDocument[];
};

export type PixelbotDocumentUploadEntry =
  | {
      status: 'ready';
      s3Key: string;
      filename: string;
      mediaType: string;
      title: string;
      description: string;
      releaseDate: string | null;
    }
  | {
      status: 'error';
      filename: string;
      error: string;
    };

export type PixelbotDocumentSaveEntry = {
  id?: number;
  categoryId: number;
  title: string;
  description: string;
  releaseDate: string | null;
  s3Key?: string;
  filename?: string;
  mediaType?: string;
};

export const pixelbotDocumentStatus = (releaseDate: string | null) =>
  !releaseDate || releaseDate <= new Date().toISOString().slice(0, 10) ? 'Live' : 'Scheduled';

export const formatReleaseDate = (releaseDate: string | null) => releaseDate ?? '—';
