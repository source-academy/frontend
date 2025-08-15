import { createActions } from 'src/commons/redux/utils';

export default createActions('conductor/languageDirectory', {
  /** Set selected language; evaluatorId optional (defaults to first available) */
  setSelectedLanguage: (languageId: string, evaluatorId?: string) => ({ languageId, evaluatorId }),
  /** Set selected evaluator explicitly */
  setSelectedEvaluator: (evaluatorId: string) => ({ evaluatorId })
});


