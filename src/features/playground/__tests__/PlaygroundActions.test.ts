import PlaygroundActions from '../PlaygroundActions';

test('generateLzString generates correct action object', () => {
  const action = PlaygroundActions.generateLzString();
  expect(action).toEqual({
    type: PlaygroundActions.generateLzString.type,
    payload: {}
  });
});

test('changeQueryString generates correct action object', () => {
  const queryString = 'test-query-string';
  const action = PlaygroundActions.changeQueryString(queryString);
  expect(action).toEqual({
    type: PlaygroundActions.changeQueryString.type,
    payload: queryString
  });
});
