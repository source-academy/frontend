import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';

import { Role } from '../../application/ApplicationTypes';
import { AssessmentStatuses } from '../../assessment/AssessmentTypes';
import { mockAssessmentOverviews } from '../../mocks/AssessmentMocks';
import Profile from '../Profile';

const mockNoClosedAssessmentOverviews = mockAssessmentOverviews.filter(
  item => item.status !== AssessmentStatuses.submitted
);

/*  ===== Tester comments =====
  Issue:
    https://github.com/airbnb/enzyme/issues/1112
  Description:
    react-router's <NavLink> component is used in ProfileCard to render a navigation link to an
    assessment when its condensed assessment card is clicked - this NavLink relies on React context
    to work; mounting the component normally will result in the following exception being thrown:
      | Invariant Violation: You should not use <Route> or withRouter() outside a <Router>
  Fix:
    For testing purposes, wrap any components containing <NavLink> components with a dummy react-router
    <MemoryRouter> component, prior to mounting with Enzyme
    -- recommendation from https://reacttraining.com/react-router/web/guides/testing
*/

test('Profile renders correctly when there are no closed assessments', () => {
  const props = {
    name: 'yeet',
    role: Role.Student,
    assessmentOverviews: mockNoClosedAssessmentOverviews,
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others'],
    isOpen: true,
    handleAssessmentOverviewFetch: () => {},
    onClose: () => {}
  };
  const tree = mount(
    <MemoryRouter initialEntries={['/']}>
      <Profile {...props} />
    </MemoryRouter>
  );
  expect(tree.debug()).toMatchSnapshot();
  // Expect the placeholder <div> to be rendered
  const placeholders = tree.find('.profile-placeholder').hostNodes();
  expect(placeholders).toHaveLength(1);
  expect(placeholders.getDOMNode().textContent).toEqual(
    'There are no closed assessments to render grade and XP of.'
  );
  // Expect none of the other wrapper HTML <div> elements to be rendered
  expect(tree.find('.profile-progress').hostNodes().exists()).toEqual(false);
  expect(tree.find('.profile-callouts').hostNodes().exists()).toEqual(false);
});

test('Profile renders correctly when there are closed and graded, or closed and not manually graded assessments', () => {
  // Only closed and graded, and closed and not manually graded assessments will be rendered in the Profile
  const props = {
    name: 'yeeet',
    role: Role.Staff,
    assessmentOverviews: mockAssessmentOverviews,
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others'],
    isOpen: true,
    handleAssessmentOverviewFetch: () => {},
    onClose: () => {}
  };
  const tree = mount(
    <MemoryRouter initialEntries={['/']}>
      <Profile {...props} />
    </MemoryRouter>
  );
  expect(tree.debug()).toMatchSnapshot();
  // Expect the placeholder <div> to NOT be rendered
  expect(tree.find('.profile-placeholder').hostNodes().exists()).toEqual(false);

  // Expect the correct number of each of the other HTML elements to be rendered
  ['.profile-spinner', '.type', '.total-value', '.percentage'].forEach(className => {
    expect(tree.find(className).hostNodes()).toHaveLength(1);
  });

  const numProfileCards = mockAssessmentOverviews.filter(
    item =>
      item.status === AssessmentStatuses.submitted &&
      (item.gradingStatus === 'graded' || item.gradingStatus === 'excluded')
  ).length;
  expect(tree.find('.profile-summary-navlink').hostNodes()).toHaveLength(numProfileCards);
  expect(tree.find('.profile-summary-callout').hostNodes()).toHaveLength(numProfileCards);
  expect(tree.find('.xp-details').hostNodes()).toHaveLength(numProfileCards);
  ['.title', '.value', '.value-bar'].forEach(className => {
    expect(tree.find(className).hostNodes()).toHaveLength(numProfileCards);
  });
});
