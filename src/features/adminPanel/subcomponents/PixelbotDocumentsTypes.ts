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
      categoryId: number;
      s3Key: string;
      filename: string;
      mediaType: string;
      title: string;
      description: string;
      releaseDate: string | null;
    }
  | {
      status: 'error';
      categoryId: number;
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

export type PixelbotDocumentStatus = 'Live' | 'Scheduled';

export function pixelbotDocumentStatus(releaseDate: string | null): PixelbotDocumentStatus {
  if (!releaseDate) {
    return 'Live';
  }
  const today = new Date().toISOString().slice(0, 10);
  return releaseDate <= today ? 'Live' : 'Scheduled';
}

export function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${releaseDate}T00:00:00Z`));
}
