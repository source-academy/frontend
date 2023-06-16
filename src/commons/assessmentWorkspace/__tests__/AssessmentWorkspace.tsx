import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { assertType } from 'src/commons/utils/TypeHelper';

import { ContestEntry } from '../../assessment/AssessmentTypes';
import { EditorProps } from '../../editor/Editor';
import { mockAssessments } from '../../mocks/AssessmentMocks';
import AssessmentWorkspace, { AssessmentWorkspaceProps } from '../AssessmentWorkspace';
const MockEditor = (props: EditorProps) => <div id="mock-editor">{props.editorValue}</div>;
// mock editor for testing update
jest.mock('../../editor/Editor', () => (props: EditorProps) => (
  <MockEditor {...props}></MockEditor>
));

const mockedHandleEditorValueChange = jest.fn();

const defaultProps = assertType<AssessmentWorkspaceProps>()({
  assessmentId: 0,
  autogradingResults: [],
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
  programPrependValue: '',
  programPostpendValue: '',
  editorTestcases: [],
  hasUnsavedChanges: false,
  handleEditorValueChange: mockedHandleEditorValueChange,
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => {},
  handleReplEval: () => {},
  handleSave: (id: number, answer: number | string | ContestEntry[]) => {},
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => {},
  isRunning: false,
  isDebugging: false,
  enableDebugging: false,
  output: [],
  questionId: 0,
  replValue: ''
});

const mockUndefinedAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps
};

const mockProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessment: mockAssessments[0],
  assessmentId: 0,
  questionId: 0
};

const mockClosedProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...mockProgrammingAssessmentWorkspaceProps,
  canSave: false
};

const mockGradedProgrammingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessment: mockAssessments[3],
  assessmentId: 4,
  questionId: 0
};

const mockMcqAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessment: mockAssessments[0],
  assessmentId: 0,
  questionId: 2
};

// set questionId to index 0 since contest voting only has 1 question
const mockContestVotingAssessmentWorkspaceProps: AssessmentWorkspaceProps = {
  ...defaultProps,
  assessment: mockAssessments[6],
  assessmentId: 7,
  questionId: 0
};

const mockStore = mockInitialStore();

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
