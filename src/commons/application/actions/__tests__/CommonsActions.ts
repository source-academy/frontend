import * as actionTypes from 'src/commons/application/types/ActionTypes';
import { logOut } from 'src/commons/application/actions/CommonsActions';

test('logOut generates correct action object', () => {
  const action = logOut();
  expect(action).toEqual({
    type: actionTypes.LOG_OUT
  });
});
