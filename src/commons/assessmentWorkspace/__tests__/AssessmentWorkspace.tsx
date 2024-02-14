import { render, screen } from '@testing-library/react';
import { require as acequire } from 'ace-builds';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { assertType } from 'src/commons/utils/TypeHelper';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';

import { mockAssessments } from '../../mocks/AssessmentMocks';
import AssessmentWorkspace, { AssessmentWorkspaceProps } from '../AssessmentWorkspace';

jest.mock('ace-builds', () => ({
  ...jest.requireActual('ace-builds'),
  require: jest.fn()
}));
const acequireMock = acequire as jest.Mock;

const defaultProps = assertType<AssessmentWorkspaceProps>()({
  assessmentId: 0,
  needsPassword: false,
  notAttempted: true,
  canSave: true,
  assessmentConfiguration: {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    displayInDashboard: true,
    hasTokenCounter: false,
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
          <WorkspaceSettingsContext.Provider
            value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}
          >
            <AssessmentWorkspace {...props} />
          </WorkspaceSettingsContext.Provider>
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

const renderElement = (props: AssessmentWorkspaceProps) =>
  render(createMemoryRouterWithRoutes(props));

const getEditor = () => screen.queryByTestId('Editor');
const getMCQChooser = () => screen.queryByTestId('MCQChooser');
const getQuestionNumberText = (curr: number, end: number) =>
  screen.queryByText(`Question ${curr} of ${end}`);
const getGradingResultTab = (tree: HTMLElement) => tree.querySelector('.GradingResult');
const getContestVotingTab = (tree: HTMLElement) => tree.querySelector('.ContestEntryVoting');

describe('AssessmentWorkspace', () => {
  beforeEach(() => {
    acequireMock.mockReturnValue({
      Mode: jest.fn(),
      setCompleters: jest.fn()
    });
  });

  test('AssessmentWorkspace page "loading" content renders correctly', () => {
    const app = createMemoryRouterWithRoutes(mockUndefinedAssessmentWorkspaceProps);
    const tree = renderTreeJson(app);
    expect(tree).toMatchSnapshot();

    render(app);
    screen.getByText('Getting mission ready...');
  });

  test('AssessmentWorkspace page with programming question renders correctly', () => {
    const { container } = renderElement(mockProgrammingAssessmentWorkspaceProps);

    expect(container).toMatchSnapshot();
    expect(getEditor()).toBeTruthy();
    expect(getMCQChooser()).toBeNull();
    expect(getQuestionNumberText(1, 5)).toBeTruthy();
    expect(getGradingResultTab(container)).toBeNull();
    expect(getContestVotingTab(container)).toBeNull();
  });

  test('AssessmentWorkspace page with overdue assessment renders correctly', () => {
    const { container } = renderElement(mockClosedProgrammingAssessmentWorkspaceProps);

    expect(container).toMatchSnapshot();
    expect(getEditor()).toBeTruthy();
    expect(getMCQChooser()).toBeNull();
    expect(getQuestionNumberText(1, 5)).toBeTruthy();
    expect(getGradingResultTab(container)).toBeNull();
    expect(getContestVotingTab(container)).toBeNull();
  });

  test('AssessmentWorkspace page with MCQ question renders correctly', () => {
    const { container } = renderElement(mockMcqAssessmentWorkspaceProps);

    expect(container).toMatchSnapshot();
    expect(getEditor()).toBeNull();
    expect(getMCQChooser()).toBeTruthy();
    expect(getQuestionNumberText(3, 5)).toBeTruthy();
    expect(getGradingResultTab(container)).toBeNull();
    expect(getContestVotingTab(container)).toBeNull();
  });

  test('AssessmentWorkspace page with ContestVoting question renders correctly', () => {
    const { container } = renderElement(mockContestVotingAssessmentWorkspaceProps);

    expect(container).toMatchSnapshot();
    expect(getEditor()).toBeTruthy();
    expect(getMCQChooser()).toBeNull();
    expect(getQuestionNumberText(1, 1)).toBeTruthy();
    expect(getGradingResultTab(container)).toBeNull();
    expect(getContestVotingTab(container)).toBeTruthy();
  });

  test('AssessmentWorkspace renders Grading tab correctly if the question has been graded', () => {
    const { container } = renderElement(mockGradedProgrammingAssessmentWorkspaceProps);

    expect(container).toMatchSnapshot();
    expect(getEditor()).toBeTruthy();
    expect(getMCQChooser()).toBeNull();
    expect(getQuestionNumberText(1, 2)).toBeTruthy();
    expect(getGradingResultTab(container)).toBeTruthy();
    expect(getContestVotingTab(container)).toBeNull();
  });
});
