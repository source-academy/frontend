import { defaultAcademy } from '../../../commons/application/ApplicationTypes';
import { LOG_OUT } from '../../../commons/application/types/CommonsTypes';
import { AcademyReducer } from '../AcademyReducer';
import { AcademyState } from '../AcademyTypes';

test('LOG_OUT works correctly on default academy', () => {
  const action = {
    type: LOG_OUT,
    payload: {}
  };
  const result: AcademyState = AcademyReducer(defaultAcademy, action);

  expect(result).toEqual(defaultAcademy);
});
