import { shallow } from 'enzyme';
import * as ReactRouter from 'react-router';

import SicpNavigationBar from '../SicpNavigationBar';

test('Navbar renders correctly', () => {
  jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });
  jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(jest.fn());

  const navbar = <SicpNavigationBar />;
  const tree = shallow(navbar);
  expect(tree.debug()).toMatchSnapshot();
});
