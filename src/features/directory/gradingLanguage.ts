import { useEffect } from 'react';

import type { Library } from '../../commons/assessment/AssessmentTypes';
import { useAppDispatch, useAppSelector } from '../../commons/utils/Hooks';
import type { GradingQuery } from '../grading/GradingTypes';
import LanguageDirectoryActions from './LanguageDirectoryActions';
import { resolveLibraryLanguage } from './libraryLanguage';

/**
 * The library of a graded submission: that of its first programming question (a submission does not
 * mix languages), or `undefined` if it has none.
 */
export function gradingLibrary(grading: GradingQuery | undefined): Library | undefined {
  return grading?.answers
    .map(answer => ('library' in answer.question ? answer.question.library : undefined))
    .find(library => library !== undefined);
}

/**
 * Selects the language of the graded submission that the grading workspace shows. The grading
 * workspace shares the global languageDirectory slice with the Playground, and the test cases of a
 * Python §4 Typed submission run under the typed evaluator only if that language is selected (see
 * testCaseLanguage.ts), not whatever was selected last.
 *
 * It follows the submission that is shown, cached or freshly fetched, so a slow or failed refresh,
 * or a response that arrives late, cannot leave another language selected. For a submission
 * without a programming question, the selection is left alone.
 */
export function useSelectGradingLanguage(grading: GradingQuery | undefined): void {
  const dispatch = useAppDispatch();
  const languages = useAppSelector(state => state.languageDirectory.languages);
  const library = gradingLibrary(grading);
  // primitives, so that the effect runs when the language changes, not when the response object does
  const { chapter, language, evaluator } = library ?? {};

  useEffect(() => {
    if (chapter === undefined) {
      return;
    }
    const derived = resolveLibraryLanguage(languages, {
      chapter,
      language,
      evaluator,
    });
    if (!derived) {
      dispatch(LanguageDirectoryActions.clearSelectedLanguage());
      return;
    }
    dispatch(LanguageDirectoryActions.setSelectedLanguage(derived.languageId));
    dispatch(LanguageDirectoryActions.setSelectedEvaluator(derived.evaluatorId));
  }, [dispatch, languages, chapter, language, evaluator]);
}
