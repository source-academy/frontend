import { defaultPlayground } from '../../../commons/application/ApplicationTypes';
import PlaygroundActions from '../PlaygroundActions';
import { PlaygroundReducer } from '../PlaygroundReducer';

test('CHANGE_QUERY_STRING sets queryString correctly ', () => {
  const action = {
    type: PlaygroundActions.changeQueryString.type,
    payload: 'hello world'
  } as const;
  expect(PlaygroundReducer(defaultPlayground, action)).toEqual({
    ...defaultPlayground,
    queryString: action.payload
  });
});
