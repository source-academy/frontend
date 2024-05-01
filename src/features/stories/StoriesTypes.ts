import { Context } from 'js-slang';
import { DebuggerContext } from 'src/commons/workspace/WorkspaceTypes';

import { InterpreterOutput, StoriesRole } from '../../commons/application/ApplicationTypes';

// Auth-related actions
export const GET_STORIES_USER = 'GET_STORIES_USER';
export const CLEAR_STORIES_USER_AND_GROUP = 'CLEAR_STORIES_USER_AND_GROUP';
// TODO: Investigate possibility of combining the two actions
export const SET_CURRENT_STORIES_USER = 'SET_CURRENT_STORIES_USER';
export const SET_CURRENT_STORIES_GROUP = 'SET_CURRENT_STORIES_GROUP';

export type StoryMetadata = {
  authorId: number;
  authorName: string;
};

export type StoryData = {
  title: string;
  content: string;
  pinOrder: number | null;
};

export type StoryParams = StoryData;

export type StoryListView = StoryData &
  StoryMetadata & {
    id: number;
    isPinned: boolean;
  };

export type StoryView = StoryData &
  StoryMetadata & {
    id: number;
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

export type StoriesAuthState = {
  readonly userId?: number;
  readonly userName?: string;
  readonly groupId?: number;
  readonly groupName?: string;
  readonly role?: StoriesRole;
};

export type StoriesState = {
  readonly storyList: StoryListView[];
  readonly currentStoryId: number | null;
  readonly currentStory: StoryData | null;
  readonly envs: { [key: string]: StoriesEnvState };
} & StoriesAuthState;
