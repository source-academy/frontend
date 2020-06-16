import { AccountInfo } from '../scenes/chapterSelect/ChapterSelect';
import Constants from 'src/commons/utils/Constants';
import { FullGameState } from './JsonifyGameState';

export async function saveData(accountInfo: AccountInfo, gameState: FullGameState) {
  const options = {
    method: 'PUT',
    headers: createHeaders(accountInfo.accessToken),
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
}

export async function loadData(accountInfo: AccountInfo): Promise<FullGameState> {
  const options = {
    method: 'GET',
    headers: createHeaders(accountInfo.accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/`, options);
  const message = await resp.text();
  const json = JSON.parse(message);

  return json.gameStates.collectibles;
}

export async function clearData(accountInfo: AccountInfo) {
  const options = {
    method: 'PUT',
    headers: createHeaders(accountInfo.accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/clear`, options);

  if (resp && resp.ok) {
    console.log('Game cleared!');
    return;
  }
}

function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Content-Type', 'application/json');
  return headers;
}
