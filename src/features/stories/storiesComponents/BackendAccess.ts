import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { courseIdWithoutPrefix } from 'src/commons/sagas/RequestsSaga';
import Constants from 'src/commons/utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
import { request } from 'src/commons/utils/RequestHelper';
import { RemoveLast } from 'src/commons/utils/TypeHelper';
import { store } from 'src/pages/createStore';

import { Tokens } from '../../../commons/application/types/SessionTypes';
import { NameUsernameRole } from '../../../pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';
import { AdminPanelStoriesUser, StoryListView, StoryView } from '../StoriesTypes';

// Helpers

type StoryRequestHelperParams = RemoveLast<Parameters<typeof request>>;
const requestStoryBackend = async (...[path, method, opts]: StoryRequestHelperParams) => {
  const resp = await request('', method, opts, `${Constants.storiesBackendUrl}${path}`);
  return resp;
};

const getStoriesGroupId: () => string = () => {
  const id = store.getState().stories.groupId;
  if (id) {
    return `${id}`;
  } else {
    // TODO: Rewrite this logic
    showWarningMessage('Stories not available!', 1000);
    throw new Error('Stories not available');
  }
};

// API-related functions

export const getStoriesUser = async (
  tokens: Tokens
): Promise<{
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  role: StoriesRole;
} | null> => {
  const resp = await requestStoryBackend(`/user?course=${courseIdWithoutPrefix()}`, 'GET', {
    ...tokens
  });
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
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/users/batch`, 'POST', {
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
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/stories`, 'GET', {
    ...tokens
  });
  if (!resp) {
    return null;
  }
  const stories = await resp.json();
  return stories;
};

export const getStory = async (tokens: Tokens, storyId: number): Promise<StoryView | null> => {
  const resp = await requestStoryBackend(
    `/groups/${getStoriesGroupId()}/stories/${storyId}`,
    'GET',
    { ...tokens }
  );
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
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/stories`, 'POST', {
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
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/stories/${id}`, 'PUT', {
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
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/stories/${id}`, 'DELETE', {
    ...tokens
  });
  if (!resp) {
    return null;
  }
  const story = await resp.json();
  return story;
};

export const getAdminPanelStoriesUsers = async (
  tokens: Tokens
): Promise<AdminPanelStoriesUser[] | null> => {
  const resp = await requestStoryBackend(`/groups/${getStoriesGroupId()}/users`, 'GET', {
    ...tokens
  });
  if (!resp) {
    return null;
  }
  const users = await resp.json();
  return users;
};

export const putStoriesUserRole = async (
  tokens: Tokens,
  userId: number,
  role: StoriesRole
): Promise<Response | null> => {
  const resp = await requestStoryBackend(
    `/groups/${getStoriesGroupId()}/users/${userId}/role`,
    'PUT',
    {
      ...tokens,
      body: { role }
    }
  );

  if (!resp) {
    showWarningMessage("Failed to update stories user's role");
    return null;
  }
  const user = await resp.json();
  return user;
};

export const deleteUserUserGroups = async (
  tokens: Tokens,
  userId: number
): Promise<Response | null> => {
  const resp = await requestStoryBackend(
    `/groups/${getStoriesGroupId()}/users/${userId}`,
    'DELETE',
    {
      ...tokens
    }
  );

  if (!resp) {
    showWarningMessage('Failed to delete stories user');
    return null;
  }
  const user = await resp.json();
  return user;
};
