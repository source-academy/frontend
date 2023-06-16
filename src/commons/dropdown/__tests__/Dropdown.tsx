import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';

import Profile from '../../profile/Profile';
import Dropdown from '../Dropdown';
import DropdownCourses from '../DropdownCourses';
import DropdownCreateCourse from '../DropdownCreateCourse';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));
const useSelectorMock = useSelector as jest.Mock;

const mockStore = mockInitialStore();
test('Dropdown does not mount Profile, DropdownCourses and DropdownCreateCourses components when a user is not logged in', () => {
  useSelectorMock.mockReturnValue({
    courses: [],
    courseId: 1
  });
  const app = (
    <Provider store={mockStore}>
      <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}>
        <Dropdown />
      </WorkspaceSettingsContext.Provider>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect the Profile component to NOT be mounted
  expect(tree.find(Profile)).toHaveLength(0);
  expect(tree.find(DropdownCourses)).toHaveLength(0);
  expect(tree.find(DropdownCreateCourse)).toHaveLength(0);
});

test('Dropdown correctly mounts Profile, DropdownCourses, and DropdownCreateCourses components when a user is logged in', () => {
  useSelectorMock.mockReturnValue({
    name: 'Some user',
    courses: [],
    courseId: 1
  });
  const app = (
    <Provider store={mockStore}>
      <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}>
        <MemoryRouter>
          <Dropdown />
        </MemoryRouter>
      </WorkspaceSettingsContext.Provider>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  // Expect the Profile component to be mounted
  expect(tree.find(Profile)).toHaveLength(1);
  expect(tree.find(DropdownCourses)).toHaveLength(1);
  expect(tree.find(DropdownCreateCourse)).toHaveLength(1);
});
