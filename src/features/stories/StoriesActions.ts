import { Chapter, Context, SourceError, Value, Variant } from 'js-slang/dist/types';
import { action } from 'typesafe-actions';

import {
  ADD_STORY_ENV,
  CLEAR_STORY_ENV,
  EVAL_STORY,
  EVAL_STORY_ERROR,
  EVAL_STORY_SUCCESS,
  HANDLE_STORIES_CONSOLE_LOG,
  NOTIFY_STORIES_EVALUATED,
  STORIES_UPDATE_GITHUB_SAVE_INFO,
  TOGGLE_STORIES_USING_SUBST,
  UPDATE_STORIES_CONTENT
} from './StoriesTypes';

export const addStoryEnv = (env: string, chapter: Chapter, variant: Variant) =>
  action(ADD_STORY_ENV, { env, chapter, variant });

export const clearStoryEnv = (env?: string) => action(CLEAR_STORY_ENV, { env });

export const evalStory = (env: string, code: string) => action(EVAL_STORY, { env, code });

export const evalStoryError = (errors: SourceError[], env: string) =>
  action(EVAL_STORY_ERROR, { type: 'errors', errors, env });

export const evalStorySuccess = (value: Value, env: string) =>
  action(EVAL_STORY_SUCCESS, { type: 'result', value, env });

export const handleStoriesConsoleLog = (env: String, ...logString: string[]) =>
  action(HANDLE_STORIES_CONSOLE_LOG, { logString, env });

export const notifyStoriesEvaluated = (
  result: any,
  lastDebuggerResult: any,
  code: string,
  context: Context,
  env: string
) =>
  action(NOTIFY_STORIES_EVALUATED, {
    result,
    lastDebuggerResult,
    code,
    context,
    env
  });

export const storiesUpdateGitHubSaveInfo = (repoName: string, filePath: string, lastSaved: Date) =>
  action(STORIES_UPDATE_GITHUB_SAVE_INFO, { repoName, filePath, lastSaved });

export const toggleStoriesUsingSubst = (usingSubst: boolean, env: String) =>
  action(TOGGLE_STORIES_USING_SUBST, { usingSubst, env });

export const updateStoriesContent = (content: string) => action(UPDATE_STORIES_CONTENT, content);
