import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import Constants from 'src/commons/utils/Constants';

export async function saveData(accountInfo: AccountInfo, gameState: any) {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accountInfo.accessToken}`);
  headers.append('Content-Type', 'application/json');

  console.log(gameState);

  const options = {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      gameStates: {
        collectibles: gameState,
        completed_quests: []
      }
    })
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/save`, options);

  if (resp && resp.ok) {
    console.log('Game saved!');
    return;
  }

  console.log('game not saved');
}
