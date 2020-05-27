import * as actionTypes from '../../types/ActionTypes';
import { logOut } from '../CommonsActions';

test('logOut generates correct action object', () => {
  const action = logOut();
  expect(action).toEqual({
    type: actionTypes.LOG_OUT
  });
});
