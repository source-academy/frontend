import { shallowRender } from 'src/commons/utils/TestUtils';

import SicpNavigationBar from '../SicpNavigationBar';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ section: 'index' }),
  useNavigate: jest.fn().mockReturnValue(jest.fn())
}));

test('Navbar renders correctly', () => {
  const navbar = <SicpNavigationBar />;
  const tree = shallowRender(navbar);
  expect(tree).toMatchSnapshot();
});
