import { shallow } from 'enzyme';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/'
  })
}));

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly with student role', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy',
    role: Role.Student
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
