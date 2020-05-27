import { defaultPlayground } from '../../../commons/application/ApplicationTypes';
import { PlaygroundReducer } from '../PlaygroundReducer';
import { CHANGE_QUERY_STRING, TOGGLE_USING_SUBST } from '../PlaygroundTypes';

test('CHANGE_QUERY_STRING sets queryString correctly ', () => {
  const action = {
    type: CHANGE_QUERY_STRING,
    payload: 'hello world'
  };
  expect(PlaygroundReducer(defaultPlayground, action)).toEqual({
    ...defaultPlayground,
    queryString: action.payload
  });
});

test('TOGGLE_USING_SUBST sets usingSubst correctly ', () => {
  const action = {
    type: TOGGLE_USING_SUBST,
    payload: true
  };
  expect(PlaygroundReducer(defaultPlayground, action)).toEqual({
    ...defaultPlayground,
    usingSubst: true
  });
});
