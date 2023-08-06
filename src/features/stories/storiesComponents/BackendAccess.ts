import Constants from 'src/commons/utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
import { request } from 'src/commons/utils/RequestHelper';
import { RemoveLast } from 'src/commons/utils/TypeHelper';

import { Tokens } from '../../../commons/application/types/SessionTypes';
import { NameUsernameRole } from '../../../pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { StoryListView, StoryView } from '../StoriesTypes';

type StoryRequestHelperParams = RemoveLast<Parameters<typeof request>>;
const requestStoryBackend = async (...[path, method, opts]: StoryRequestHelperParams) => {
  const resp = await request('', method, opts, `${Constants.storiesBackendUrl}${path}`);
  return resp;
};

export const getStoriesUser = async (
  tokens: Tokens
): Promise<{
  id: number;
  name: string;
  // TODO: Return role once permissions framework is implemented
} | null> => {
  const resp = await requestStoryBackend('/user', 'GET', { ...tokens });
  if (!resp) {
    return null;
  }
  const me = await resp.json();
  return me;
};

export const postNewStoriesUsers = async (
  tokens: Tokens,
  users: NameUsernameRole[],
  provider: string
): Promise<Response | null> => {
  const resp = await requestStoryBackend('/users/batch', 'POST', {
    // TODO: backend create params does not support roles yet, i.e.
    //       the role in NameUsernameRole is currently still unused
    body: { users: users.map(user => ({ ...user, provider })) },
    ...tokens
  });

  if (!resp) {
    showWarningMessage('Failed to add users');
    return null;
  }

  showSuccessMessage('Users added!');
  return resp;
  // TODO: Return response JSON directly.
};

export const getStories = async (tokens: Tokens): Promise<StoryListView[] | null> => {
  const resp = await requestStoryBackend('/stories', 'GET', { ...tokens });
  if (!resp) {
    return null;
  }
  const stories = await resp.json();
  return stories;
};

export const getStory = async (tokens: Tokens, storyId: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${storyId}`, 'GET', { ...tokens });
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};

export const postStory = async (
  tokens: Tokens,
  authorId: number,
  title: string,
  content: string,
  pinOrder: number | null
): Promise<StoryView | null> => {
  const resp = await requestStoryBackend('/stories', 'POST', {
    body: { authorId, title, content, pinOrder },
    ...tokens
  });
  if (!resp) {
    showWarningMessage('Failed to create story');
    return null;
  }
  showSuccessMessage('Story created');
  const story = await resp.json();
  return story;
};

export const updateStory = async (
  tokens: Tokens,
  id: number,
  title: string,
  content: string,
  pinOrder: number | null
): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${id}`, 'PUT', {
    body: { title, content, pinOrder },
    ...tokens
  });
  if (!resp) {
    showWarningMessage('Failed to save story');
    return null;
  }
  showSuccessMessage('Story saved');
  const updatedStory = await resp.json();
  return updatedStory;
};

// Returns the deleted story, or null if errors occur
export const deleteStory = async (tokens: Tokens, id: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${id}`, 'DELETE', { ...tokens });
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};
