import { shallowRender } from 'src/commons/utils/TestUtils';
import { vi } from 'vitest';

import SicpNavigationBar from '../SicpNavigationBar';

vi.mock('react-router', () => ({
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
  useNavigate: vi.fn().mockReturnValue(vi.fn())
}));

test('Navbar renders correctly', () => {
  const navbar = <SicpNavigationBar />;
  const tree = shallowRender(navbar);
  expect(tree).toMatchSnapshot();
});
