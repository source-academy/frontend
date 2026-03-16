import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

const assessmentTypes = ['Missions', 'Quests', 'Paths', 'Contests', 'Others'];
const staffRoutes = ['grading', 'sourcereel', 'gamesimulator', 'dashboard', 'teamformation'];
const adminRoutes = ['groundcontrol', 'adminpanel'];
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

const mockProps = {
  assessmentTypes
};

const renderNav = (role: Role) => {
  const store = mockInitialStore({
    session: {
      role,
      courseId
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
  const tree = renderNav(Role.Student);
  expect(tree.asFragment()).toMatchSnapshot();

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, false);
  validateAdminPaths(hrefs, false);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Team Formation and Grading NavLinks render for Role.Staff', () => {
  const tree = renderNav(Role.Staff);
  expect(tree.asFragment()).toMatchSnapshot();

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, false);
});

test('MissionControl, GroundControl, Sourcereel, GameSimulator, Dashboard, Grading, Team Formation and AdminPanel NavLinks render for Role.Admin', () => {
  const tree = renderNav(Role.Admin);
  expect(tree.asFragment()).toMatchSnapshot();

  const hrefs = getHrefs(tree.container);
  validateAssessmentPaths(hrefs, true);
  validateStaffPaths(hrefs, true);
  validateAdminPaths(hrefs, true);
});
