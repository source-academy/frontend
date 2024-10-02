import { Store } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { OverallState, Role } from 'src/commons/application/ApplicationTypes';
import { mockAssessmentOverviews } from 'src/commons/mocks/AssessmentMocks';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import Assessment from '../Assessment';
import { AssessmentConfiguration, AssessmentOverview } from '../AssessmentTypes';

const mockAssessmentConfig: AssessmentConfiguration = {
  assessmentConfigId: 1,
  type: 'Missions',
  isManuallyGraded: true,
  isGradingAutoPublished: false,
  displayInDashboard: true,
  hasTokenCounter: false,
  hasVotingFeatures: false,
  hoursBeforeEarlyXpDecay: 48,
  earlySubmissionXp: 200
};

const getOverriddenStore = ({
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

const createTestComponent = (mockStore: Store<OverallState>) => {
  const router = createMemoryRouter(
    [{ path: '/assessment', element: <Assessment />, loader: () => mockAssessmentConfig }],
    { initialEntries: ['/assessment'] }
  );
  return (
    <Provider store={mockStore}>
      <RouterProvider router={router} />
    </Provider>
  );
};

test('Assessment page "loading" content renders correctly', async () => {
  const mockStore = getOverriddenStore({});
  const app = createTestComponent(mockStore);

  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  render(app);
  screen.getByText('Fetching assessment...');
});

test('Assessment page with 0 missions renders correctly', async () => {
  const mockStore = getOverriddenStore({ assessmentOverviews: [] });
  const app = createTestComponent(mockStore);

  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));
  screen.getByText('There are no assessments.');
});

test('Assessment page with multiple loaded missions renders correctly', async () => {
  const mockStore = getOverriddenStore({
    assessmentOverviews: mockAssessmentOverviews,
    role: Role.Staff
  });
  const app = createTestComponent(mockStore);

  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));
  expect(screen.getAllByTestId('Assessment-Attempt-Button').length).toBe(3);
});

test('Assessment page does not show attempt Button for upcoming assessments for student user', async () => {
  const mockStore = getOverriddenStore({
    assessmentOverviews: mockAssessmentOverviews,
    role: Role.Student
  });
  const app = createTestComponent(mockStore);

  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();

  await act(() => render(app));
  expect(screen.getAllByTestId('Assessment-Attempt-Button').length).toBe(2);
});
