import { applicationReducer } from '../../redux/ApplicationRedux'

const initialState = applicationReducer(undefined!, { type: '*' });

test('initial state should match a snapshot', () => {
  expect(initialState).toMatchSnapshot();
});
