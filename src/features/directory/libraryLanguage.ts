import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import type { Library } from '../../commons/assessment/AssessmentTypes';
import { deriveLanguageFromChapter } from './chapterLanguage';

/**
 * The language and evaluator that a library (of a question: the user's, or the frontend grader's)
 * names, as ids of the language directory.
 *
 * A library names them by `language` and `evaluator` (source-academy/backend#1387): the language
 * must be in the directory, and so must the evaluator if one is named (without one, the language's
 * first evaluator is meant). Nothing is guessed for a name that the directory does not know: the
 * answer is `undefined`, not another language. A library without a language, as in a question saved
 * before the ids, has only its `chapter`, which is a position in the directory
 * (see `deriveLanguageFromChapter`).
 */
export function resolveLibraryLanguage(
  languages: ILanguageDefinition[],
  library: Pick<Library, 'chapter' | 'language' | 'evaluator'> | undefined,
): { languageId: string; evaluatorId: string } | undefined {
  if (!library) {
    return undefined;
  }
  if (!library.language) {
    return deriveLanguageFromChapter(languages, library.chapter);
  }
  const language = languages.find(l => l.id === library.language);
  const evaluator = library.evaluator
    ? language?.evaluators.find(e => e.id === library.evaluator)
    : language?.evaluators[0];
  return language && evaluator ? { languageId: language.id, evaluatorId: evaluator.id } : undefined;
}
