import _ from 'lodash';
import { Cadet } from 'src/commons/api';

import SourceAcademyGame from '../SourceAcademyGame';
import { createEmptySaveState } from './GameSaveHelper';
import { FullSaveState } from './GameSaveTypes';

/**
 * This function saves data to the backend under user's game state.
 *
 * @param fullSaveState - the entire game data that needs to be saved, including game state and userstate
 */
export async function saveData(fullSaveState: FullSaveState) {
  const { role, accessToken, refreshToken } = SourceAcademyGame.getInstance().getAccountInfo();
  if (role !== 'student') {
    return;
  }

  const resp = await Cadet.user.updateGameStates(fullSaveState, { accessToken, refreshToken });

  if (resp.ok) {
    return resp;
  }
  return;
}

/**
 * This function fetches data from the backend.
 */
export async function loadData(): Promise<FullSaveState> {
  const { accessToken, refreshToken } = SourceAcademyGame.getInstance().getAccountInfo();

  const resp = await Cadet.user.index({ accessToken, refreshToken });
  const gameStates = resp.data.game_states;

  // TODO: add FullSaveState to backend Swagger API?
  return _.isEmpty(gameStates) ? createEmptySaveState() : (gameStates as FullSaveState);
}
