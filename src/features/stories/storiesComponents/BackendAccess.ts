import Constants from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { request } from 'src/commons/utils/RequestHelper';

import { StoryListView, StoryView } from '../StoriesTypes';

type RemoveLast<T extends any[]> = T extends [...infer U, any] ? U : T;
type StoryRequestHelperParams = RemoveLast<Parameters<typeof request>>;
const requestStoryBackend = async (...[path, method, opts]: StoryRequestHelperParams) => {
  const resp = await request('', method, opts, `${Constants.storiesBackendUrl}${path}`);
  return resp;
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

export const insertStory = async (
  authorId: number,
  title: string,
  content: string,
  pinOrder?: number
): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authorId: authorId,
        title: title,
        content: content,
        pinOrder: pinOrder
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

export const updateStory = async (
  id: number,
  title: string,
  content: string,
  pinOrder?: number
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
        pinOrder: pinOrder
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
export const deleteStory = async (id: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(`/stories/${id}`, 'DELETE', {});
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};
