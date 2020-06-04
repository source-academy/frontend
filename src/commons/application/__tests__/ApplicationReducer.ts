import { ApplicationReducer } from '../ApplicationReducer'; // EDITED

const initialState = ApplicationReducer(undefined!, { type: '*' });

test('initial state should match a snapshot', () => {
  expect(initialState).toMatchSnapshot();
});
