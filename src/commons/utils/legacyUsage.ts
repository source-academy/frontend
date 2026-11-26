import * as Sentry from '@sentry/react';

/**
 * The compatibility paths that keep old links and files working after the move to the language
 * directory (source-academy/frontend#4593).
 */
export type LegacyUsage =
  /** A share link from before the directory: it encodes a Source chapter in `chap`. */
  | 'share-link-chapter'
  /** A Google Drive file saved before the directory: its `appProperties` hold a `chapter`. */
  | 'drive-file-chapter';

/**
 * Counts one use of a compatibility path, so that it is visible when one has gone quiet and can be
 * removed. A counter, not an event: nothing is recorded about who or what was opened. Does nothing
 * when Sentry is not configured.
 */
export function recordLegacyUsage(kind: LegacyUsage): void {
  Sentry.metrics.count('legacy.usage', 1, { attributes: { kind } });
}
