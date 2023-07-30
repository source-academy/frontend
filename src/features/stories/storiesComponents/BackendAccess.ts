import Constants from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { request } from 'src/commons/utils/RequestHelper';

import { Tokens } from '../../../commons/application/types/SessionTypes';
import { NameUsernameRole } from '../../../pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { StoryListView, StoryView } from '../StoriesTypes';

type RemoveLast<T extends any[]> = T extends [...infer U, any] ? U : T;
type StoryRequestHelperParams = RemoveLast<Parameters<typeof request>>;
const requestStoryBackend = async (...[path, method, opts]: StoryRequestHelperParams) => {
  const resp = await request('', method, opts, `${Constants.storiesBackendUrl}${path}`);
  return resp;
};

// TODO: Refactor to use requestStoryBackend
export const postNewStoriesUsers = async (
  tokens: Tokens,
  users: NameUsernameRole[],
  provider: string
): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // TODO: backend create params does not support roles yet (aka) the role in NameUsernameRole is currently still unused
        users: users.map(user => {
          return {
            name: user.name,
            username: user.username,
            provider: provider
          };
        })
      })
    });
    if (!resp.ok) {
      showWarningMessage(
        `Error while communicating with backend: ${resp.status} ${resp.statusText}${
          resp.status === 401 || resp.status === 403
            ? '; try logging in again, after manually saving any work.'
            : ''
        }`
      );
      return null;
    }
    return resp;
  } catch (e) {
    showWarningMessage('Error while communicating with backend; check your network?');

    return null;
  }
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
  authorId: number,
  title: string,
  content: string,
  pinOrder?: number
): Promise<StoryView | null> => {
  const resp = await requestStoryBackend('/stories', 'POST', {
    body: { authorId, title, content, pinOrder }
  });
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};

// TODO: Refactor to use requestStoryBackend
export const updateStory = async (
  id: number,
  title: string,
  content: string,
  pinOrder?: number | null
): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/stories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        content: content,
        pinOrder: pinOrder ?? null
      })
    });
    if (!resp.ok) {
      showWarningMessage(
        `Error while communicating with backend: ${resp.status} ${resp.statusText}${
          resp.status === 401 || resp.status === 403
            ? '; try logging in again, after manually saving any work.'
            : ''
        }`
      );
      return null;
    }
    return resp;
  } catch (e) {
    showWarningMessage('Error while communicating with backend; check your network?');

    return null;
  }
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
