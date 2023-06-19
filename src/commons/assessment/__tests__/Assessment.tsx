import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Store } from 'redux';
import { OverallState, Role } from 'src/commons/application/ApplicationTypes';
import { mockAssessmentOverviews } from 'src/commons/mocks/AssessmentMocks';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTree } from 'src/commons/utils/TestUtils';
import { assertType } from 'src/commons/utils/TypeHelper';

import Assessment, { AssessmentProps } from '../Assessment';
import { AssessmentOverview } from '../AssessmentTypes';

const mockAssessmentProps = assertType<AssessmentProps>()({
  assessmentConfiguration: {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  }
});

const getOverridedStore = ({
  assessmentOverviews,
  role
}: {
  assessmentOverviews?: AssessmentOverview[];
  role?: Role;
}) =>
  mockInitialStore({
    session: {
      assessmentOverviews,
      role
    }
  });

const createTestComponent = (mockStore: Store<OverallState>) => (
  <Provider store={mockStore}>
    <MemoryRouter>
      <Assessment {...mockAssessmentProps} />
    </MemoryRouter>
  </Provider>
);

test('Assessment page "loading" content renders correctly', () => {
  const mockStore = getOverridedStore({});
  const app = createTestComponent(mockStore);

  const tree = renderTree(app);
  expect(tree).toMatchSnapshot();

  render(app);
  screen.getByText('Fetching assessment...');
});

test('Assessment page with 0 missions renders correctly', () => {
  const mockStore = getOverridedStore({ assessmentOverviews: [] });
  const app = createTestComponent(mockStore);

  const tree = renderTree(app);
  expect(tree).toMatchSnapshot();

  render(app);
  screen.getByText('There are no assessments.');
});

test('Assessment page with multiple loaded missions renders correctly', async () => {
  const mockStore = getOverridedStore({
    assessmentOverviews: mockAssessmentOverviews,
    role: Role.Staff
  });
  const app = createTestComponent(mockStore);

  const tree = renderTree(app);
  expect(tree).toMatchSnapshot();

  render(app);
  expect(screen.getAllByTestId('Assessment-Attempt-Button').length).toBe(3);
});

test('Assessment page does not show attempt Button for upcoming assessments for student user', () => {
  const mockStore = getOverridedStore({
    assessmentOverviews: mockAssessmentOverviews,
    role: Role.Student
  });
  const app = createTestComponent(mockStore);

  const tree = renderTree(app);
  expect(tree).toMatchSnapshot();

  render(app);
  expect(screen.getAllByTestId('Assessment-Attempt-Button').length).toBe(2);
});
