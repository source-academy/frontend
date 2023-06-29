import { useSelector } from 'react-redux';
import { deepFilter, shallowRender } from 'src/commons/utils/TestUtils';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));
const useSelectorMock = useSelector as jest.Mock;

const assessmentTypes = ['Missions', 'Quests', 'Paths', 'Contests', 'Others'];
const staffRoutes = ['grading', 'groundcontrol', 'sourcereel', 'storysimulator', 'dashboard'];
const adminRoutes = ['adminpanel', 'xpcalculation'];
const courseId = 0;
const createCoursePath = (path: string) => `/courses/${courseId}/${path}`;

const assessmentPaths = assessmentTypes.map(e => e.toLowerCase()).map(createCoursePath);
const staffPaths = staffRoutes.map(createCoursePath);
const adminPaths = adminRoutes.map(createCoursePath);

const createMatchFn = (to: string) => (e: React.ReactElement) => e.props.to === to;
const getChildren = (e: React.ReactElement) => e.props.children;

const validateAssessmentPaths = (tree: React.ReactElement, exist: boolean = true) =>
  assessmentPaths.forEach(path => {
    expect(deepFilter(tree, createMatchFn(path), getChildren).length).toBe(exist ? 1 : 0);
  });

const validateStaffPaths = (tree: React.ReactElement, exist: boolean = true) =>
  staffPaths.forEach(path => {
    expect(deepFilter(tree, createMatchFn(path), getChildren).length).toBe(exist ? 1 : 0);
  });

const validateAdminPaths = (tree: React.ReactElement, exist: boolean = true) =>
  adminPaths.forEach(path => {
    expect(deepFilter(tree, createMatchFn(path), getChildren).length).toBe(exist ? 1 : 0);
  });

const mockProps = {
  assessmentTypes
};
const element = <AcademyNavigationBar {...mockProps} />;

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading and AdminPanel NavLinks do NOT render for Role.Student', () => {
  useSelectorMock.mockReturnValue({
    role: Role.Student,
    courseId
  });

  const tree = shallowRender(element);
  expect(tree).toMatchSnapshot();

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, false);
  validateAdminPaths(tree, false);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard and Grading NavLinks render for Role.Staff', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Staff,
    courseId
  });

  const tree = shallowRender(element);
  expect(tree).toMatchSnapshot();

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, false);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading, XP Calculation and AdminPanel NavLinks render for Role.Admin', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId
  });

  const tree = shallowRender(element);
  expect(tree).toMatchSnapshot();

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, true);
});
