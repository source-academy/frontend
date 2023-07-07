import * as ReactRouter from 'react-router';
import { shallowRender } from 'src/commons/utils/TestUtils';

import SicpNavigationBar from '../SicpNavigationBar';

test('Navbar renders correctly', () => {
  jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });
  jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(jest.fn());

  const navbar = <SicpNavigationBar />;
  const tree = shallowRender(navbar);
  expect(tree).toMatchSnapshot();
});
