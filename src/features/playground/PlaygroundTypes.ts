import { SALanguage } from 'src/commons/application/ApplicationTypes';

import { GitHubSaveInfo } from '../github/GitHubTypes';
import { PersistenceFile } from '../persistence/PersistenceTypes';

export type PlaygroundState = {
  readonly queryString?: string;
  readonly shortURL?: string;
  readonly persistenceFile?: PersistenceFile;
  readonly githubSaveInfo: GitHubSaveInfo;
  readonly languageConfig: SALanguage;
};
