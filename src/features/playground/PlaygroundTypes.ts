import type { SALanguage } from 'src/commons/application/ApplicationTypes';

import type { GitHubSaveInfo } from '../github/GitHubTypes';
import type { PersistenceFile } from '../persistence/PersistenceTypes';

export type PlaygroundState = {
  readonly queryString?: string;
  readonly shortURL?: string;
  readonly persistenceFile?: PersistenceFile;
  readonly githubSaveInfo: GitHubSaveInfo;
  readonly languageConfig: SALanguage;
};
