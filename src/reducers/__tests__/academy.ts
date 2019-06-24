import { IAction, LOG_OUT, SAVE_CANVAS } from '../../actions/actionTypes';
import { reducer } from '../academy';
import { defaultAcademy, IAcademyState } from '../states';

function createContext(width: number, height: number): HTMLCanvasElement {
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

test('LOG_OUT works correctly on default academy', () => {
  const action: IAction = {
    type: LOG_OUT,
    payload: {}
  };
  const result: IAcademyState = reducer(defaultAcademy, action);

  expect(result).toEqual(defaultAcademy);
});

test('SAVE_CANVAS works correctly on default academy', () => {
  const payloadCanvas: HTMLCanvasElement = createContext(42, 42);

  const action: IAction = {
    type: SAVE_CANVAS,
    payload: payloadCanvas
  };
  const result: IAcademyState = reducer(defaultAcademy, action);

  expect(result).toEqual({
    ...defaultAcademy,
    gameCanvas: payloadCanvas
  });
});
