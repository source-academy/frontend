import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { assertType } from 'src/commons/utils/TypeHelper';

import { store } from '../../../pages/createStore';
import Assessment, { AssessmentProps } from '../Assessment';

// FIXME: Fix all the test cases
const defaultProps = assertType<AssessmentProps>()({
  // courseId: 1,
  assessmentConfiguration: {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  }
  // assessmentOverviews: undefined,
  // handleAcknowledgeNotifications: () => {},
  // handleAssessmentOverviewFetch: () => {},
  // handleSubmitAssessment: (id: number) => {},
  // isStudent: false,
  // ...mockRouterProps('/academy/missions', {})
});

const mockUndefinedAssessment = assertType<AssessmentProps>()({
  ...defaultProps
  // assessmentOverviews: undefined
});

const mockEmptyAssessment = assertType<AssessmentProps>()({
  ...defaultProps
  // assessmentOverviews: []
});

const mockPresentAssessment = assertType<AssessmentProps>()({
  ...defaultProps
  // assessmentOverviews: mockAssessmentOverviews
});

const mockPresentAssessmentForStudent = assertType<AssessmentProps>()({
  ...defaultProps
  // assessmentOverviews: mockAssessmentOverviews,
  // isStudent: true
});

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
