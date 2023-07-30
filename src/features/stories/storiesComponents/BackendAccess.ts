import Constants from 'src/commons/utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
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

export const getStories = async (): Promise<StoryListView[] | null> => {
  const resp = await requestStoryBackend('/stories', 'GET', {});
  if (!resp) {
    return null;
  }
  const stories = await resp.json();
  return stories;
};

export const getStory = async (storyId: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${storyId}`, 'GET', {});
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
  pinOrder: number | null
): Promise<StoryView | null> => {
  const resp = await requestStoryBackend('/stories', 'POST', {
    body: { authorId, title, content, pinOrder }
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
  id: number,
  title: string,
  content: string,
  pinOrder: number | null
): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${id}`, 'PUT', {
    body: { title, content, pinOrder }
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
export const deleteStory = async (id: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${id}`, 'DELETE', {});
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};
