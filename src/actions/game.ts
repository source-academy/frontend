import { ActionCreator } from 'redux';
import * as actionTypes from './actionTypes';

export const saveCanvas: ActionCreator<actionTypes.IAction> = (canvas: HTMLCanvasElement) => ({
  type: actionTypes.SAVE_CANVAS,
  payload: canvas
});
