import { Context } from 'js-slang';
import { DebuggerContext } from 'src/commons/workspace/WorkspaceTypes';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { GitHubSaveInfo } from '../github/GitHubTypes';

export const ADD_STORY_ENV = 'ADD_STORY_ENV';
export const CLEAR_STORY_ENV = 'CLEAR_STORY_ENV';
export const EVAL_STORY = 'EVAL_STORY';
export const EVAL_STORY_ERROR = 'EVAL_STORY_ERROR';
export const EVAL_STORY_SUCCESS = 'EVAL_STORY_SUCCESS';
export const HANDLE_STORIES_CONSOLE_LOG = 'HANDLE_STORIES_CONSOLE_LOG';
export const NOTIFY_STORIES_EVALUATED = 'NOTIFY_STORIES_EVALUATED';
export const STORIES_UPDATE_GITHUB_SAVE_INFO = 'STORIES_UPDATE_GITHUB_SAVE_INFO';
export const TOGGLE_STORIES_USING_SUBST = 'TOGGLE_STORIES_USING_SUBST';
export const UPDATE_STORIES_CONTENT = 'UPDATE_STORIES_CONTENT';
// New actions post-refactor
export const GET_STORIES_LIST = 'GET_STORIES_LIST';
export const UPDATE_STORIES_LIST = 'UPDATE_STORIES_LIST';
export const FETCH_STORY = 'FETCH_STORY';
export const SET_CURRENT_STORY = 'SET_CURRENT_STORY';
export const CREATE_STORY = 'CREATE_STORY';
export const SAVE_STORY = 'SAVE_STORY';

export type StoryListView = {
  id: number;
  authorId: number;
  authorName: string;
  title: string;
  content: string;
  isPinned: boolean;
};

export type StoryView = {
  id: number;
  authorId: number;
  authorName: string;
  title: string;
  content: string;
};

export type StoriesEnvState = {
  readonly context: Context;
  readonly execTime: number;
  readonly isRunning: boolean;
  readonly output: InterpreterOutput[];
  readonly stepLimit: number;
  readonly globals: Array<[string, any]>;
  readonly usingSubst: boolean;
  readonly debuggerContext: DebuggerContext;
};

export type StoriesState = {
  readonly storyList: StoryListView[];
  readonly envs: { [key: string]: StoriesEnvState };
  readonly content: string; // TODO: Deprecate this
  readonly githubSaveInfo: GitHubSaveInfo;
};
