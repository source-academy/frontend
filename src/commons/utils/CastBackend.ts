import type { ExternalLibraryName } from '../application/types/ExternalTypes';
import type { Library } from '../assessment/AssessmentTypes';

/**
 * Casts a library returned by an API call to a
 * Library used in the frontend.
 */
export const castLibrary = (lib: any): Library => ({
  chapter: lib.chapter,
  // the ids of the language directory (source-academy/backend#1387); `null` for a question without
  language: lib.language == null ? undefined : lib.language,
  evaluator: lib.evaluator == null ? undefined : lib.evaluator,
  external: {
    /** external names are lowercase for API results */
    name: lib.external.name.toUpperCase() as ExternalLibraryName,
    symbols: lib.external.symbols,
  },
  // backend provides `null` if these fields are not set, but frontend wants undefined (for defaulting)
  execTimeMs: lib.execTimeMs == null ? undefined : lib.execTimeMs,
  /** globals are passed as an object, mapping symbol name -> value */
  globals: Object.entries(lib.globals as object).map(entry => {
    /** The value that is passed is evaluated into an actual JS value */
    try {
      entry[1] = (window as any).eval(entry[1]);
    } catch (e) {}
    return entry;
  }),
});
