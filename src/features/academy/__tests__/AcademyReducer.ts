import { defaultAcademy } from '../../../commons/application/ApplicationTypes';
import { LOG_OUT } from '../../../commons/application/types/CommonsTypes';
import { AcademyReducer } from '../AcademyReducer';
import { AcademyState, SAVE_CANVAS } from '../AcademyTypes';

function createContext(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

test('LOG_OUT works correctly on default academy', () => {
  const action = {
    type: LOG_OUT,
    payload: {}
  };
  const result: AcademyState = AcademyReducer(defaultAcademy, action);

  expect(result).toEqual(defaultAcademy);
});

test('SAVE_CANVAS works correctly on default academy', () => {
  const payloadCanvas: HTMLCanvasElement = createContext(42, 42);

  const action = {
    type: SAVE_CANVAS,
    payload: payloadCanvas
  };
  const result: AcademyState = AcademyReducer(defaultAcademy, action);

  expect(result).toEqual({
    ...defaultAcademy,
    gameCanvas: payloadCanvas
  });
});
