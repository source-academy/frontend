import { GameState } from 'src/reducers/states';
import { action } from 'typesafe-actions';
import * as actionTypes from './actionTypes';

export const fetchTestStories = () => action(actionTypes.FETCH_TEST_STORIES);
export const saveCanvas = (canvas: HTMLCanvasElement) => action(actionTypes.SAVE_CANVAS, canvas);
export const saveUserData = (gameState: GameState) =>
  action(actionTypes.SAVE_USER_STATE, gameState);
