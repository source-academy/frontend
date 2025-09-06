import { SALanguage } from 'src/commons/application/ApplicationTypes';
import { createActions } from 'src/commons/redux/utils';

import { IEvaluatorDefinition, ILanguageDefinition } from '../../commons/directory/language';
import { PersistenceFile } from '../persistence/PersistenceTypes';

const PlaygroundActions = createActions('playground', {
  generateLzString: () => ({}),
  shortenURL: (keyword: string) => keyword,
  updateShortURL: (shortURL: string) => shortURL,
  changeQueryString: (queryString: string) => queryString,
  playgroundUpdatePersistenceFile: (file?: PersistenceFile) => file,
  playgroundUpdateGitHubSaveInfo: (repoName: string, filePath: string, lastSaved: Date) => ({
    repoName,
    filePath,
    lastSaved
  }),
  playgroundConfigLanguage: (languageConfig: SALanguage) => languageConfig,
  playgroundConductorLanguage: (language: ILanguageDefinition) => language,
  playgroundConductorEvaluator: (evaluator: IEvaluatorDefinition | undefined) => evaluator
});

// For compatibility with existing code (reducer)
export const {
  generateLzString,
  shortenURL,
  updateShortURL,
  changeQueryString,
  playgroundUpdatePersistenceFile,
  playgroundUpdateGitHubSaveInfo,
  playgroundConfigLanguage,
  playgroundConductorLanguage,
  playgroundConductorEvaluator
} = PlaygroundActions;

// For compatibility with existing code (actions helper)
export default PlaygroundActions;
