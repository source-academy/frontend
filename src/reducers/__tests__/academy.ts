import { IAction, LOG_OUT, SAVE_CANVAS } from '../../actions/actionTypes';
import { reducer } from '../academy';
import { defaultAcademy, IAcademyState } from '../states';

test('LOG_OUT works correctly on default academy', () => {
  const action: IAction = {
    type: LOG_OUT,
    payload: {}
  };
  const result: IAcademyState = reducer(defaultAcademy, action);

  expect(result).toEqual(defaultAcademy);
});

test('SAVE_CANVAS works correctly on default academy', () => {
  const action: IAction = {
    type: SAVE_CANVAS,
    payload: null
  };
  const result: IAcademyState = reducer(defaultAcademy, action);

  expect(result).toEqual({
    ...defaultAcademy,
    gameCanvas: null
  });
});
