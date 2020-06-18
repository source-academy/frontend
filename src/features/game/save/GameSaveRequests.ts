import { AccountInfo } from 'src/pages/academy/game/subcomponents/phaserGame';
import Constants from 'src/commons/utils/Constants';
import { FullSaveState } from './GameSaveTypes';

export async function saveData(accountInfo: AccountInfo, gameState: FullSaveState) {
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
    return;
  }
}

export async function loadData(accountInfo: AccountInfo): Promise<FullSaveState> {
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
