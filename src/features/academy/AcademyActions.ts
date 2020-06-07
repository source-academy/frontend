import { action } from 'typesafe-actions';

import { SAVE_CANVAS } from './AcademyTypes';

export const saveCanvas = (canvas: HTMLCanvasElement) => action(SAVE_CANVAS, canvas);
