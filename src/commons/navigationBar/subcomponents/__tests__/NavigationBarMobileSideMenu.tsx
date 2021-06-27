import { shallow } from 'enzyme';

import { Role } from '../../../application/ApplicationTypes';
import NavigationBarMobileSideMenu from '../NavigationBarMobileSideMenu';

test('NavigationBarMobileSideMenu renders "Not logged in" correctly', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    assessmentTypes: []
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly when logged in (no course selected)', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    name: 'Avenger',
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    assessmentTypes: []
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly when logged in (with course selected)', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    name: 'Avenger',
    role: Role.Student,
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
