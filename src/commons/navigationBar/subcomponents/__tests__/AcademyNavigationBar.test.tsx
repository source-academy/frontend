import { useTypedSelector } from 'src/commons/utils/Hooks';
import { deepFilter, shallowRender } from 'src/commons/utils/TestUtils';
import { Mock, vi } from 'vitest';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

vi.mock('react-redux', async importOriginal => ({
  ...(await importOriginal()),
  useSelector: vi.fn()
}));
const useSelectorMock = useTypedSelector as Mock;

const assessmentTypes = ['Missions', 'Quests', 'Paths', 'Contests', 'Others'];
const staffRoutes = ['grading', 'sourcereel', 'gamesimulator', 'dashboard', 'teamformation'];
const adminRoutes = ['groundcontrol', 'llmstats', 'adminpanel'];
const adminRoutesWithoutLlmStats = ['groundcontrol', 'adminpanel'];
const courseId = 0;
const createCoursePath = (path: string) => `/courses/${courseId}/${path}`;

const assessmentPaths = assessmentTypes.map(e => e.toLowerCase()).map(createCoursePath);
const staffPaths = staffRoutes.map(createCoursePath);
const adminPaths = adminRoutes.map(createCoursePath);

const createMatchFn = (to: string) => (e: React.ReactElement) =>
  e.props.to === to && !e.props.disabled;
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

const validateSpecificPaths = (tree: React.ReactElement, paths: string[], exist: boolean = true) =>
  paths.forEach(path => {
    expect(deepFilter(tree, createMatchFn(path), getChildren).length).toBe(exist ? 1 : 0);
  });

const mockProps = {
  assessmentTypes
};
const element = <AcademyNavigationBar {...mockProps} />;

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Grading, Team Formation and AdminPanel NavLinks do NOT render for Role.Student', () => {
  useSelectorMock.mockReturnValue({
    role: Role.Student,
    courseId,
    enableLlmGrading: false,
    hasLlmContent: false
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, false);
  validateAdminPaths(tree, false);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Team Formation and Grading NavLinks render for Role.Staff', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Staff,
    courseId,
    enableLlmGrading: false,
    hasLlmContent: false
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, false);
});

test('MissionControl, GroundControl and AdminPanel render for Role.Admin when LLM grading is disabled, but LLM Statistics does not', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId,
    enableLlmGrading: false,
    hasLlmContent: false
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateSpecificPaths(tree, adminRoutesWithoutLlmStats.map(createCoursePath), true);
  validateSpecificPaths(tree, [createCoursePath('llmstats')], false);
});

test('MissionControl, GroundControl and LLM Statistics render for Role.Admin when LLM grading is enabled even if there is no LLM content', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId,
    enableLlmGrading: true,
    hasLlmContent: false
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, true);
});

test('MissionControl, GroundControl and LLM Statistics render for Role.Admin when LLM grading is enabled and hasLlmContent is still loading', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId,
    enableLlmGrading: true,
    hasLlmContent: undefined
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, true);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Grading, Team Formation and AdminPanel NavLinks render for Role.Admin', () => {
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId,
    enableLlmGrading: true,
    hasLlmContent: true
  });

  const tree = shallowRender(element);

  validateAssessmentPaths(tree, true);
  validateStaffPaths(tree, true);
  validateAdminPaths(tree, true);
});
