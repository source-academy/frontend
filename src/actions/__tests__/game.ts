import * as actionTypes from '../actionTypes';
import { saveCanvas } from '../game';

test('saveCanvas generates correct action object', () => {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const action = saveCanvas(canvas);
  expect(action).toEqual({
    type: actionTypes.SAVE_CANVAS,
    payload: canvas
  });
});
