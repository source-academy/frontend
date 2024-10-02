import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { OverallState, Role } from 'src/commons/application/ApplicationTypes';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { assertType, DeepPartial } from 'src/commons/utils/TypeHelper';

import { AssessmentConfiguration, AssessmentStatuses } from '../../assessment/AssessmentTypes';
import { mockAssessmentOverviews } from '../../mocks/AssessmentMocks';
import Profile, { ProfileProps } from '../Profile';

const mockNoClosedAssessmentOverviews = mockAssessmentOverviews.filter(
  item => item.status !== AssessmentStatuses.submitted
);

const assessmentConfigurations: AssessmentConfiguration[] = [
  'Missions',
  'Quests',
  'Paths',
  'Contests',
  'Others'
].map((c, i) => ({
  assessmentConfigId: i,
  type: c,
  isManuallyGraded: false,
  isGradingAutoPublished: false,
  displayInDashboard: false,
  hasTokenCounter: false,
  hasVotingFeatures: false,
  hoursBeforeEarlyXpDecay: 0,
  earlySubmissionXp: 0
}));

const createProfileWithStore = (storeOverrides?: DeepPartial<OverallState>) => {
  const props = assertType<ProfileProps>()({
    isOpen: true,
    onClose: () => {}
  });
  const mockStore = mockInitialStore(storeOverrides);

  return (
    <Provider store={mockStore}>
      <MemoryRouter>
        <Profile {...props} />
      </MemoryRouter>
    </Provider>
  );
};

test('Profile renders correctly when there are no closed assessments', async () => {
  const profile = createProfileWithStore({
    session: {
      name: 'yeet',
      role: Role.Student,
      courseId: 1,
      assessmentOverviews: mockNoClosedAssessmentOverviews,
      assessmentConfigurations
    }
  });
  await act(() => render(profile));

  // Expect the placeholder <div> to be rendered
  const placeholders = screen.getAllByTestId('profile-placeholder');
  expect(placeholders).toHaveLength(1);
  expect(placeholders[0].textContent).toEqual(
    'There are no closed assessments to render grade and XP of.'
  );

  // Expect none of the other wrapper HTML <div> elements to be rendered
  expect(screen.queryAllByTestId('profile-progress')).toHaveLength(0);
  expect(screen.queryAllByTestId('profile-callouts')).toHaveLength(0);
});

test('Profile renders correctly when there are closed and graded, or closed and not manually graded assessments', async () => {
  // Only closed and graded, and closed and not manually graded assessments will be rendered in the Profile
  const profile = createProfileWithStore({
    session: {
      name: 'yeeet',
      role: Role.Staff,
      courseId: 1,
      assessmentOverviews: mockAssessmentOverviews,
      assessmentConfigurations
    }
  });
  await act(() => render(profile));

  // Expect the placeholder <div> to NOT be rendered
  expect(screen.queryAllByTestId('profile-placeholder')).toHaveLength(0);

  // Expect the correct number of each of the other HTML elements to be rendered
  ['profile-spinner', 'profile-type', 'profile-total-value', 'profile-percentage'].forEach(
    testId => {
      expect(screen.queryAllByTestId(testId)).toHaveLength(1);
    }
  );

  const numProfileCards = mockAssessmentOverviews.filter(item => item.isGradingPublished).length;

  [
    'profile-summary-navlink',
    'profile-summary-callout',
    'profile-xp-details',
    'profile-title',
    'profile-value'
  ].forEach(testId => {
    expect(screen.queryAllByTestId(testId)).toHaveLength(numProfileCards);
  });

  // Including profile spinner
  expect(screen.queryAllByRole('progressbar')).toHaveLength(numProfileCards + 1);
});
