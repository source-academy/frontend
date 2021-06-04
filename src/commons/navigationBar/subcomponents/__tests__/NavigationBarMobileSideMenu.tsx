import { shallow } from 'enzyme';

import { Role } from '../../../application/ApplicationTypes';
import NavigationBarMobileSideMenu from '../NavigationBarMobileSideMenu';

test('NavigationBarMobileSideMenu renders "Not logged in" correctly', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {}
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly with student role', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    role: Role.Student,
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {}
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
