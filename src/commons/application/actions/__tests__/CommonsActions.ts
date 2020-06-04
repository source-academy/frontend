import { LOG_OUT } from '../../types/CommonsTypes';
import { logOut } from '../CommonsActions';

test('logOut generates correct action object', () => {
  const action = logOut();
  expect(action).toEqual({
    type: LOG_OUT
  });
});
