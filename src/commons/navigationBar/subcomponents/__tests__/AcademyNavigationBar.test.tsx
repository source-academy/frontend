import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

const assessmentTypes = ['Missions', 'Quests', 'Paths', 'Contests', 'Others'];
const staffRoutes = ['grading', 'sourcereel', 'gamesimulator', 'dashboard', 'teamformation'];
const adminRoutes = ['groundcontrol', 'llmstats', 'adminpanel'];
const adminRoutesWithoutLlmStats = ['groundcontrol', 'adminpanel'];
const courseId = 0;
const createCoursePath = (path: string) => `/courses/${courseId}/${path}`;

const assessmentPaths = assessmentTypes.map(e => e.toLowerCase()).map(createCoursePath);
const staffPaths = staffRoutes.map(createCoursePath);
const adminPaths = adminRoutes.map(createCoursePath);

const getHrefs = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll('a')).map(a => a.getAttribute('href') || '');
};

const validateAssessmentPaths = (hrefs: string[], exist: boolean = true) =>
  assessmentPaths.forEach(path => {
    expect(hrefs.includes(path)).toBe(exist);
  });

const validateStaffPaths = (hrefs: string[], exist: boolean = true) =>
  staffPaths.forEach(path => {
    expect(hrefs.includes(path)).toBe(exist);
  });

const validateAdminPaths = (hrefs: string[], exist: boolean = true) =>
  adminPaths.forEach(path => {
    expect(hrefs.includes(path)).toBe(exist);
  });

const validateSpecificPaths = (hrefs: string[], paths: string[], exist: boolean = true) =>
  paths.forEach(path => {
    expect(hrefs.includes(path)).toBe(exist);
  });

const mockProps = {
  assessmentTypes
};

const renderNav = (
  role: Role,
  options?: { enableLlmGrading?: boolean; hasLlmContent?: boolean }
) => {
  const store = mockInitialStore({
    session: {
      role,
      courseId,
      enableLlmGrading: options?.enableLlmGrading,
      hasLlmContent: options?.hasLlmContent
    }
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AcademyNavigationBar {...mockProps} />
      </MemoryRouter>
    </Provider>
  );
};

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Grading, Team Formation and AdminPanel NavLinks do NOT render for Role.Student', () => {
  const tree = renderNav(Role.Student, { enableLlmGrading: false, hasLlmContent: false });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, false);
  validateAdminPaths(hrefs, false);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Team Formation and Grading NavLinks render for Role.Staff', () => {
  const tree = renderNav(Role.Staff, { enableLlmGrading: false, hasLlmContent: false });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, false);
});

test('MissionControl, GroundControl and AdminPanel render for Role.Admin when LLM grading is disabled, but LLM Statistics does not', () => {
  const tree = renderNav(Role.Admin, { enableLlmGrading: false, hasLlmContent: false });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateSpecificPaths(hrefs, adminRoutesWithoutLlmStats.map(createCoursePath), true);
  validateSpecificPaths(hrefs, [createCoursePath('llmstats')], false);
});

test('MissionControl, GroundControl and LLM Statistics render for Role.Admin when LLM grading is enabled even if there is no LLM content', () => {
  const tree = renderNav(Role.Admin, { enableLlmGrading: true, hasLlmContent: false });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, true);
});

test('MissionControl, GroundControl and LLM Statistics render for Role.Admin when LLM grading is enabled and hasLlmContent is still loading', () => {
  const tree = renderNav(Role.Admin, { enableLlmGrading: true, hasLlmContent: undefined });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, true);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Grading, Team Formation and AdminPanel NavLinks render for Role.Admin', () => {
  const tree = renderNav(Role.Admin, { enableLlmGrading: true, hasLlmContent: true });

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, true);
});
