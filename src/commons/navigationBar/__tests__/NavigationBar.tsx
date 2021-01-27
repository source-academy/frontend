import { shallow } from 'enzyme';
import { Role } from 'src/commons/application/ApplicationTypes';

import NavigationBar from '../NavigationBar';

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
