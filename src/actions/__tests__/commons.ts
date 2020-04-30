import * as actionTypes from '../actionTypes';
import { logOut } from '../commons';

test('logOut generates correct action object', () => {
  const action = logOut();
  expect(action).toEqual({
    type: actionTypes.LOG_OUT
  });
});
