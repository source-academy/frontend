import { SALanguage } from 'src/commons/application/ApplicationTypes';
import { createActions } from 'src/commons/redux/utils';

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
  playgroundConfigLanguage: (languageConfig: SALanguage) => languageConfig
});

// For compatibility with existing code (reducer)
export const {
  generateLzString,
  shortenURL,
  updateShortURL,
  changeQueryString,
  playgroundUpdatePersistenceFile,
  playgroundUpdateGitHubSaveInfo,
  playgroundConfigLanguage
} = PlaygroundActions;

// For compatibility with existing code (actions helper)
export default PlaygroundActions;
