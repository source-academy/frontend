import Constants from 'src/commons/utils/Constants';
import {
  AccountInfo,
  getSourceAcademyGame
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import { createEmptySaveState } from './GameSaveHelper';
import { FullSaveState } from './GameSaveTypes';

/**
 * This function saves data to the backend.
 * Currently saves the entire game data in the "collectibles" field
 * just because that is the format accepted by the backend
 *
 * TODO: Change backend endpoint to accept fullSaveState
 *
 * @param fullSaveState - the entire game data that needs to be saved, including game state and userstate
 * @param accountInfo - the account information of the student
 */
export async function saveData(accountInfo: AccountInfo, fullSaveState: FullSaveState) {
  const options = {
    method: 'PUT',
    headers: createHeaders(accountInfo.accessToken),
    body: JSON.stringify({
      gameStates: {
        collectibles: fullSaveState,
        completed_quests: []
      }
    })
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/save`, options);
  if (resp && resp.ok) {
    return resp;
  }
  return;
}

/**
 * This function loads data to the backend.
 * Currently saves the loads game data from the "collectibles" field
 * just because that is the format stored by the backend
 *
 * TODO: Change backend endpoint to store fullSaveState
 *
 * @param accountInfo - the account information of the student
 */
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

/**
 * This function clears the entire game object from the database
 *
 * @param accountInfo - the account information of the student
 */
export async function clearData(accountInfo: AccountInfo) {
  const options = {
    method: 'PUT',
    headers: createHeaders(accountInfo.accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/clear`, options);

  if (resp && resp.ok) {
    alert('Game cleared!');
    return;
  }
}

/**
 * This function resets the data in the backend to a fresh user state
 * which includes default user settings
 *
 * @param accountInfo - the account information of the student
 */
export async function resetData() {
  const resp = await saveData(getSourceAcademyGame().getAccountInfo(), createEmptySaveState());
  if (resp && resp.ok) {
    alert('Game data reset!');
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
