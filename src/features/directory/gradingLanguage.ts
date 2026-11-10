import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../commons/utils/Hooks';
import { selectConductorEnable } from '../conductor/flagConductorEnable';
import type { GradingQuery } from '../grading/GradingTypes';
import { deriveLanguageFromChapter } from './chapterLanguage';
import LanguageDirectoryActions from './LanguageDirectoryActions';

/**
 * The chapter of a graded submission: that of its first programming question (a submission does not
 * mix chapters), or `undefined` if it has none.
 */
export function gradingChapter(grading: GradingQuery | undefined): number | undefined {
  return grading?.answers
    .map(answer => ('library' in answer.question ? answer.question.library?.chapter : undefined))
    .find(chapter => chapter !== undefined);
}

/**
 * Selects the language of the graded submission that the grading workspace shows. The grading
 * workspace shares the global languageDirectory slice with the Playground, and the test cases of a
 * Python §4 Typed submission run under the typed evaluator only if that language is selected (see
 * testCaseLanguage.ts), not whatever was selected last.
 *
 * It follows the submission that is shown, cached or freshly fetched, so a slow or failed refresh,
 * or a response that arrives late, cannot leave another language selected. Without Conductor, or
 * for a submission without a programming question, the selection is left alone.
 */
export function useSelectGradingLanguage(grading: GradingQuery | undefined): void {
  const dispatch = useAppDispatch();
  const conductorEnabled = useAppSelector(selectConductorEnable);
  const languages = useAppSelector(state => state.languageDirectory.languages);
  const chapter = gradingChapter(grading);

  useEffect(() => {
    if (!conductorEnabled || chapter === undefined) {
      return;
    }
    const derived = deriveLanguageFromChapter(languages, chapter);
    if (!derived) {
      dispatch(LanguageDirectoryActions.clearSelectedLanguage());
      return;
    }
    dispatch(LanguageDirectoryActions.setSelectedLanguage(derived.languageId));
    dispatch(LanguageDirectoryActions.setSelectedEvaluator(derived.evaluatorId));
  }, [dispatch, conductorEnabled, languages, chapter]);
}
