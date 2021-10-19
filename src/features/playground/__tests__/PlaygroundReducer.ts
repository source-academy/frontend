import { defaultPlayground } from '../../../commons/application/ApplicationTypes';
import { PlaygroundReducer } from '../PlaygroundReducer';
import { CHANGE_QUERY_STRING } from '../PlaygroundTypes';

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
