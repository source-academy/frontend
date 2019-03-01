import { reducer } from '../application';

const initialState = reducer(undefined!, { type: '*' });

test('initial state should match a snapshot', () => {
  expect(initialState).toMatchSnapshot();
});
