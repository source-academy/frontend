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
  /** ISO date string (yyyy-mm-dd), or null if the document has no scheduled release. */
  releaseDate: string | null;
  filename: string;
  mediaType: string;
};

export type PixelbotDocumentsIndex = {
  categories: PixelbotCategory[];
  documents: PixelbotDocument[];
};

/**
 * One file's worth of AI-proposed metadata, returned by the upload endpoint. Nothing behind
 * this shape has been saved to the DB yet - it only becomes a PixelbotDocument once included
 * in a savePixelbotDocuments call.
 */
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

/**
 * A single entry sent to savePixelbotDocuments. Entries with no `id` are new (from an upload,
 * carrying s3Key/filename/mediaType); entries with an `id` are edits to an already-saved
 * document (title/description/releaseDate only - editing never touches s3Key).
 */
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

/**
 * `release_date <= today ? "Live" : "Scheduled"` - there is no separate Draft status. A null
 * release_date is "Live": the backend's release-date filter (`is_nil(release_date) or
 * release_date <= today`) already serves undated documents unconditionally, so the status
 * label must agree with what Pixel actually does, not read "Scheduled" for something that's
 * already being answered from.
 */
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
  const [y, m, d] = releaseDate.split('-').map(Number);
  const month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][m - 1];
  return `${month} ${d}, ${y}`;
}
