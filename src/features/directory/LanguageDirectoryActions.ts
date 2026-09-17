import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';

import { createActions } from '../../commons/redux/utils';

const LanguageDirectoryActions = createActions('directory/languages', {
  /** Fetch languages (saga) */
  fetchLanguages: null,
  /** Set languages list */
  setLanguages: (languages: ILanguageDefinition[]) => ({ languages }),
  /**
   * Set selected language; evaluatorId optional (defaults to first available).
   *
   * `isDefault` marks the selection as a default that a later default may replace (see
   * `LanguageDirectoryState.isDefaultSelection`). Callers acting on a deliberate choice — the
   * language dropdown, a share link, a textbook route, an assessment — leave it unset.
   */
  setSelectedLanguage: (languageId: string, evaluatorId?: string, isDefault: boolean = false) => ({
    languageId,
    evaluatorId,
    isDefault,
  }),
  /** Set selected evaluator explicitly */
  setSelectedEvaluator: (evaluatorId: string) => ({ evaluatorId }),
  /** Clear the selected language and evaluator, falling back to js-slang */
  clearSelectedLanguage: null,
});

export default LanguageDirectoryActions;
