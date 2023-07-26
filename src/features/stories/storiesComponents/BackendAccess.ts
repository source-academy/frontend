import Constants from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

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
        story: {
          authorId: authorId,
          title: title,
          content: content,
          pinOrder: pinOrder
        }
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
        story: {
          title: title,
          content: content,
          pinOrder: pinOrder
        }
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
