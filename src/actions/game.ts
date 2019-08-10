import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';

export const saveCanvas = (canvas: HTMLCanvasElement) => action(actionTypes.SAVE_CANVAS, canvas);
