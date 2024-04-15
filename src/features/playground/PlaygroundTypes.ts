import { SALanguage } from 'src/commons/application/ApplicationTypes';

import { GitHubSaveInfo } from '../github/GitHubTypes';
import { PersistenceFile } from '../persistence/PersistenceTypes';

export const PLAYGROUND_UPDATE_GITHUB_SAVE_INFO = 'PLAYGROUND_UPDATE_GITHUB_SAVE_INFO';
export const PLAYGROUND_UPDATE_PERSISTENCE_FILE = 'PLAYGROUND_UPDATE_PERSISTENCE_FILE';
export const PLAYGROUND_UPDATE_LANGUAGE_CONFIG = 'PLAYGROUND_UPDATE_LANGUAGE_CONFIG';

export type PlaygroundState = {
  readonly persistenceFile?: PersistenceFile;
  readonly githubSaveInfo: GitHubSaveInfo;
  readonly languageConfig: SALanguage;
};
