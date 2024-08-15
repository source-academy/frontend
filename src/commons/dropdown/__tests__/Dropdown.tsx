import { Store } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { UserCourse } from 'src/commons/application/types/SessionTypes';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTree, renderTreeJson } from 'src/commons/utils/TestUtils';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';

import Profile from '../../profile/Profile';
import Dropdown from '../Dropdown';
import DropdownCourses from '../DropdownCourses';
import DropdownCreateCourse from '../DropdownCreateCourse';

const getMockedStore = ({
  name,
  courses,
  courseId
}: {
  name?: string;
  courses: UserCourse[];
  courseId: number;
}) =>
  mockInitialStore({
    session: {
      name,
      courses,
      courseId
    }
  });

const getElement = (mockStore: Store<OverallState>) => (
  <Provider store={mockStore}>
    <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}>
      <MemoryRouter>
        <Dropdown />
      </MemoryRouter>
    </WorkspaceSettingsContext.Provider>
  </Provider>
);

test('Dropdown does not mount Profile, DropdownCourses and DropdownCreateCourses components when a user is not logged in', async () => {
  const mockStore = getMockedStore({
    courses: [],
    courseId: 1
  });
  const app = getElement(mockStore);
  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  // Expect the Profile component to NOT be mounted
  const dropdown = await renderTree(app);
  expect(dropdown.root.findAllByType(Profile).length).toBe(0);
  expect(dropdown.root.findAllByType(DropdownCourses).length).toBe(0);
  expect(dropdown.root.findAllByType(DropdownCreateCourse).length).toBe(0);
});

test('Dropdown correctly mounts Profile, DropdownCourses, and DropdownCreateCourses components when a user is logged in', async () => {
  const mockStore = getMockedStore({
    name: 'Some user',
    courses: [],
    courseId: 1
  });
  const app = getElement(mockStore);
  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  // Expect the Profile component to be mounted
  const dropdown = await renderTree(app);
  expect(dropdown.root.findByType(Profile)).toBeTruthy();
  expect(dropdown.root.findByType(DropdownCourses)).toBeTruthy();
  expect(dropdown.root.findByType(DropdownCreateCourse)).toBeTruthy();
});
