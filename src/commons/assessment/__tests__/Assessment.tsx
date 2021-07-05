import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { store } from '../../../pages/createStore';
import { mockAssessmentOverviews } from '../../mocks/AssessmentMocks';
import { mockRouterProps } from '../../mocks/ComponentMocks';
import Assessment, { AssessmentProps } from '../Assessment';

const defaultProps: AssessmentProps = {
  assessmentConfiguration: {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  assessmentOverviews: undefined,
  handleAcknowledgeNotifications: () => {},
  handleAssessmentOverviewFetch: () => {},
  handleSubmitAssessment: (id: number) => {},
  isStudent: false,
  ...mockRouterProps('/academy/missions', {})
};

const mockUndefinedAssessment: AssessmentProps = {
  ...defaultProps,
  assessmentOverviews: undefined
};

const mockEmptyAssessment: AssessmentProps = {
  ...defaultProps,
  assessmentOverviews: []
};

const mockPresentAssessment: AssessmentProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews
};

const mockPresentAssessmentForStudent: AssessmentProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews,
  isStudent: true
};

test('Assessment page "loading" content renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockUndefinedAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page with 0 missions renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockEmptyAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page with multiple loaded missions renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockPresentAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page does not show attempt Button for upcoming assessments for student user', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockPresentAssessmentForStudent} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
