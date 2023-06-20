import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { assertType } from 'src/commons/utils/TypeHelper';

import { EditorProps } from '../../editor/Editor';
import { mockAssessments } from '../../mocks/AssessmentMocks';
import AssessmentWorkspace, { AssessmentWorkspaceProps } from '../AssessmentWorkspace';
const MockEditor = (props: EditorProps) => <div id="mock-editor">{props.editorValue}</div>;
// mock editor for testing update
jest.mock('../../editor/Editor', () => (props: EditorProps) => (
  <MockEditor {...props}></MockEditor>
));

const defaultProps = assertType<AssessmentWorkspaceProps>()({
  assessmentId: 0,
  notAttempted: true,
  canSave: true,
  assessmentConfiguration: {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  questionId: 0
});

const mockUndefinedAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps
};

const mockProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessmentId: 1,
  questionId: 0
};

const mockClosedProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...mockProgrammingAssessmentWorkspaceProps,
  canSave: false
};

const mockGradedProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessmentId: 4,
  questionId: 0
};

const mockMcqAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessmentId: 1,
  questionId: 2
};

// set questionId to index 0 since contest voting only has 1 question
const mockContestVotingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessmentId: 7,
  questionId: 0
};

const mockStore = mockInitialStore({
  session: {
    assessments: new Map(mockAssessments.map(assessment => [assessment.id, assessment]))
  }
});

const createMemoryRouterWithRoutes = (props: AssessmentWorkspaceProps) => {
  const routes = [
    {
      path: '/courses/1/missions/1/0',
      element: (
        <Provider store={mockStore}>
          <AssessmentWorkspace {...props} />
        </Provider>
      )
    }
  ];
  return (
    <RouterProvider
      router={createMemoryRouter(routes, {
        initialEntries: ['/courses/1/missions/1/0'],
        initialIndex: 0
      })}
    />
  );
};

test('AssessmentWorkspace page "loading" content renders correctly', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockUndefinedAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with programming question renders correctly', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockProgrammingAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with overdue assessment renders correctly', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockClosedProgrammingAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with MCQ question renders correctly', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockMcqAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with ContestVoting question renders correctly', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockContestVotingAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace renders Grading tab correctly if the question has been graded', () => {
  const tree = mount(createMemoryRouterWithRoutes(mockGradedProgrammingAssessmentWorkspaceProps));
  expect(tree.debug()).toMatchSnapshot();
  // Uncomment when fixed
  // expect(tree.find('.grading-icon').hostNodes()).toHaveLength(1);
});
