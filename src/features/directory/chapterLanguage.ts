import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

/**
 * An assessment's `library.chapter` is a 1-based index into the language directory's
 * `languages` array (python1=1, python2=2, python3=3, python4=4, pythonFull=5, scheme=6) once
 * Conductor is enabled - Source is no longer used, so there is no other meaning to distinguish
 * from. This mirrors the backend's PROGRAMMINGLANGUAGE `interpreter` attribute, which is stored
 * verbatim into `chapter` with no translation.
 *
 * Picks the Py2JS evaluator when the language has one (python1-python4); languages without a
 * Py2JS option (pythonFull, scheme) fall back to their only/first evaluator.
 */
export function deriveLanguageFromChapter(
  languages: ILanguageDefinition[],
  chapter: number | undefined,
): { languageId: string; evaluatorId: string } | undefined {
  if (!chapter) {
    return undefined;
  }
  const language = languages[chapter - 1];
  if (!language) {
    return undefined;
  }
  const evaluator =
    language.evaluators.find(e => e.id.toLowerCase().endsWith('py2js')) ?? language.evaluators[0];
  if (!evaluator) {
    return undefined;
  }
  return { languageId: language.id, evaluatorId: evaluator.id };
}
