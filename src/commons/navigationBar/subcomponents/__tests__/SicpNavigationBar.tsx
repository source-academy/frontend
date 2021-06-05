import { shallow } from 'enzyme';
import ReactRouter from 'react-router';

import SicpNavigationBar from '../SicpNavigationBar';

test('Navbar renders correctly', () => {
  jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });

  const navbar = <SicpNavigationBar />;
  const tree = shallow(navbar);
  expect(tree.debug()).toMatchSnapshot();
});
