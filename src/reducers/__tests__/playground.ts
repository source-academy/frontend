import { CHANGE_QUERY_STRING, IAction } from '../../actions/actionTypes';
import { reducer } from '../playground';
import { defaultPlayground } from '../states';

test('CHANGE_QUERY_STRING sets queryString correctly ', () => {
  const action: IAction = {
    type: CHANGE_QUERY_STRING,
    payload: 'hello world'
  };
  expect(reducer(defaultPlayground, action)).toEqual({
    ...defaultPlayground,
    queryString: action.payload
  });
});
