import { shallow } from 'enzyme';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:8000/academy/game'
  })
}));

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    updateLatestViewedCourse: () => {},
    courses: [],
    assessmentTypes: []
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly for student with course', () => {
  const props = {
    handleLogOut: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    updateLatestViewedCourse: () => {},
    courses: [
      {
        courseId: 1,
        courseName: 'CS1101S Programming Methodology (AY20/21 Sem 1)',
        courseShortName: 'CS1101S',
        viewable: true
      }
    ],
    courseId: 1,
    courseShortName: 'CS1101S',
    enableAchievements: true,
    enableSourcecast: true,
    role: Role.Student,
    name: 'Bob',
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly for student without course', () => {
  const props = {
    handleLogOut: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    updateLatestViewedCourse: () => {},
    courses: [],
    name: 'Bob',
    assessmentTypes: []
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
