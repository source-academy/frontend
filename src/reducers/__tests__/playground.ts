import { CHANGE_QUERY_STRING, IAction, TOGGLE_USING_SUBST } from '../../actions/actionTypes';
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

test('TOGGLE_USING_SUBST sets usingSubst correctly ', () => {
  const action: IAction = {
    type: TOGGLE_USING_SUBST,
    payload: true
  };
  expect(reducer(defaultPlayground, action)).toEqual({
    ...defaultPlayground,
    usingSubst: true
  });
});
