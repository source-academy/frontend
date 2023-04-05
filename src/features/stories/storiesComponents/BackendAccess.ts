import Constants from 'src/commons/utils/Constants';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

export const getStories = async (): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/api/story_list`);
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
  githubname: string,
  filename: string
): Promise<Response | null> => {
  try {
    const resp = await fetch(`${Constants.storiesBackendUrl}/api/insert_story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        story: {
          githubname: githubname,
          filename: filename
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
