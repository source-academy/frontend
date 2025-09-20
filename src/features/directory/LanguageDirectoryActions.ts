import { ILanguageDefinition } from 'language-directory/dist/types';
import { createActions } from 'src/commons/redux/utils';

const LanguageDirectoryActions = createActions('conductor/languageDirectory', {
  /** Fetch languages (saga) */
  fetchLanguages: null,
  /** Set languages list */
  setLanguages: (languages: ILanguageDefinition[]) => ({ languages }),
  /** Set selected language; evaluatorId optional (defaults to first available) */
  setSelectedLanguage: (languageId: string, evaluatorId?: string) => ({ languageId, evaluatorId }),
  /** Set selected evaluator explicitly */
  setSelectedEvaluator: (evaluatorId: string) => ({ evaluatorId })
});

export default LanguageDirectoryActions;
