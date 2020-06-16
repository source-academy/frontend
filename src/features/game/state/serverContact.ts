import { AccountInfo } from '../storyChapterSelect/StoryChapterSelect';
import Constants from 'src/commons/utils/Constants';

export async function saveData(
  accountInfo: AccountInfo,
  gameStates: any
): Promise<Response | null> {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accountInfo.accessToken}`);
  headers.append('Content-Type', 'application/json');

  const options = {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      gameStates: JSON.stringify({
        collectibles: { HAHA: 'HAHA.png' },
        completed_quests: ['haha']
      })
    })
  };

  console.log(Constants.backendUrl);

  return fetch(`${Constants.backendUrl}/v1/user/game_states/save`, options);
}
