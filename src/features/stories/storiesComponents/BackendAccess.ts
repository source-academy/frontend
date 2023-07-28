import Constants from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

import { Tokens } from '../../../commons/application/types/SessionTypes';
import { NameUsernameRole } from '../../../pages/academy/adminPanel/subcomponents/AddStoriesUserPanel';

export const putNewStoriesUsers = async (
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
        users: users
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

export const getStories = async (): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/stories`);
    if (!resp.ok) {
      showWarningMessage(
        `Error while communicating with stories backend: ${resp.status} ${resp.statusText}${
          resp.status === 401 || resp.status === 403
            ? '; try logging in again, after manually saving any work.'
            : ''
        }`
      );
      return null;
    }
    return resp;
  } catch (e) {
    console.log(e);
    showWarningMessage('Error while communicating with stories backend; check your network?');
    return null;
  }
};

export const getStory = async (storyId: number): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/stories/${storyId}`);
    if (!resp.ok) {
      showWarningMessage(
        `Error while communicating with stories backend: ${resp.status} ${resp.statusText}${
          resp.status === 401 || resp.status === 403
            ? '; try logging in again, after manually saving any work.'
            : ''
        }`
      );
      return null;
    }
    return resp;
  } catch (e) {
    console.log(e);
    showWarningMessage('Error while communicating with stories backend; check your network?');
    return null;
  }
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

export const deleteStory = async (id: number): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/stories/${id}`, {
      method: 'DELETE'
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
