import _ from 'lodash';
import Constants from 'src/commons/utils/Constants';

import SourceAcademyGame from '../SourceAcademyGame';
import { courseId } from '../utils/GameUtils';
import { createEmptySaveState } from './GameSaveHelper';
import { FullSaveState } from './GameSaveTypes';

/**
 * This function saves data to the backend under user's game state.
 *
 * @param fullSaveState - the entire game data that needs to be saved, including game state and userstate
 */
export async function saveData(fullSaveState: FullSaveState) {
  const options = {
    method: 'PUT',
    headers: createHeaders(SourceAcademyGame.getInstance().getAccountInfo().accessToken),
    body: JSON.stringify({
      gameStates: fullSaveState
    })
  };

  const resp = await fetch(
    `${Constants.backendUrl}/v2/courses/${courseId()}/user/game_states`,
    options
  );

  if (resp && resp.ok) {
    return resp;
  }
  return;
}

/**
 * This function fetches data from the backend.
 */
export async function loadData(): Promise<FullSaveState> {
  const options = {
    method: 'GET',
    headers: createHeaders(SourceAcademyGame.getInstance().getAccountInfo().accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v2/user`, options);
  const message = await resp.text();

  const json = JSON.parse(message).courseRegistration?.gameStates;
  return _.isEmpty(json) ? createEmptySaveState() : json;
}

/**
 * Format a header object.
 *
 * @param accessToken access token to be used
 */
function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Content-Type', 'application/json');
  return headers;
}
