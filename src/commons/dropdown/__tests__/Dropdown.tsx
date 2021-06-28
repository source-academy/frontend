import { shallow } from 'enzyme';

import ProfileContainer from '../../profile/ProfileContainer';
import Dropdown from '../Dropdown';
import DropdownCourses from '../DropdownCourses';
import DropdownCreateCourse from '../DropdownCreateCourse';

test('Dropdown does not mount Profile, DropdownCourses and DropdownCreateCourses components when a user is not logged in', () => {
  const props = {
    handleLogOut: () => {},
    updateLatestViewedCourse: () => {},
    handleCreateCourse: () => {},
    courses: [],
    isAboutOpen: false,
    isHelpOpen: false,
    isProfileOpen: false
  };
  const app = <Dropdown {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect the Profile component to NOT be mounted
  expect(tree.find(ProfileContainer)).toHaveLength(0);
  expect(tree.find(DropdownCourses)).toHaveLength(0);
  expect(tree.find(DropdownCreateCourse)).toHaveLength(0);
});

test('Dropdown correctly mounts Profile, DropdownCourses, and DropdownCreateCourses components when a user is logged in', () => {
  const props = {
    handleLogOut: () => {},
    updateLatestViewedCourse: () => {},
    handleCreateCourse: () => {},
    courses: [],
    isAboutOpen: false,
    isHelpOpen: false,
    isProfileOpen: false,
    name: 'Some user'
  };
  const app = <Dropdown {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect the Profile component to be mounted
  expect(tree.find(ProfileContainer)).toHaveLength(1);
  expect(tree.find(DropdownCourses)).toHaveLength(1);
  expect(tree.find(DropdownCreateCourse)).toHaveLength(1);
});
