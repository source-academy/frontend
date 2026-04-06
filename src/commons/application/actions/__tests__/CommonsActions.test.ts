import CommonsActions from '../CommonsActions';

test('logOut generates correct action object', () => {
  const action = CommonsActions.logOut();
  expect(action).toEqual({
    type: CommonsActions.logOut.type,
    payload: {}
  });
});
