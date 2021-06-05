import { PersistenceFile } from '../persistence/PersistenceTypes';

export const CHANGE_QUERY_STRING = 'CHANGE_QUERY_STRING';
export const GENERATE_LZ_STRING = 'GENERATE_LZ_STRING';
export const SHORTEN_URL = 'SHORTEN_URL';
export const UPDATE_SHORT_URL = 'UPDATE_SHORT_URL';
export const PLAYGROUND_UPDATE_GITHUB_SAVE_INFO = 'PLAYGROUND_UPDATE_GITHUB_SAVE_INFO';
export const PLAYGROUND_UPDATE_PERSISTENCE_FILE = 'PLAYGROUND_UPDATE_PERSISTENCE_FILE';

export type PlaygroundState = {
  readonly queryString?: string;
  readonly shortURL?: string;
  readonly persistenceFile?: PersistenceFile;
  readonly githubSaveInfo: { repoName: string; filePath: string };
};
