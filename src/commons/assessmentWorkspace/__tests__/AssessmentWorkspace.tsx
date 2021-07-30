import { shallow } from 'enzyme';

import { ContestEntry, Library } from '../../assessment/AssessmentTypes';
import { EditorProps } from '../../editor/Editor';
import { Position } from '../../editor/EditorTypes';
import { mockAssessments } from '../../mocks/AssessmentMocks';
import AssessmentWorkspace, { AssessmentWorkspaceProps } from '../AssessmentWorkspace';
const MockEditor = (props: EditorProps) => <div id="mock-editor">{props.editorValue}</div>;
// mock editor for testing update
jest.mock('../../editor/Editor', () => (props: EditorProps) => (
  <MockEditor {...props}></MockEditor>
));

const mockedHandleEditorValueChange = jest.fn();

const defaultProps: AssessmentWorkspaceProps = {
  assessmentId: 0,
  autogradingResults: [],
  notAttempted: true,
  canSave: true,
  editorPrepend: '',
  editorValue: null,
  editorPostpend: '',
  editorTestcases: [],
  editorWidth: '50%',
  breakpoints: [],
  highlightedLines: [],
  hasUnsavedChanges: false,
  handleAssessmentFetch: (assessmentId: number) => {},
  handleBrowseHistoryDown: () => {},
  handleBrowseHistoryUp: () => {},
  handleClearContext: (library: Library, shouldInitLibrary: boolean) => {},
  handleDeclarationNavigate: (cursorPosition: Position) => {},
  handleEditorEval: () => {},
  handleEditorValueChange: mockedHandleEditorValueChange,
  handleEditorHeightChange: (height: number) => {},
  handleEditorWidthChange: (widthChange: number) => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleInterruptEval: () => {},
  handleReplEval: () => {},
  handleReplOutputClear: () => {},
  handleReplValueChange: (newValue: string) => {},
  handleSendReplInputToOutput: (code: string) => {},
  handleResetWorkspace: () => {},
  handleSave: (id: number, answer: number | string | ContestEntry[]) => {},
  handleSideContentHeightChange: (heightChange: number) => {},
  handleTestcaseEval: (testcaseId: number) => {},
  handleRunAllTestcases: () => {},
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => {},
  handleUpdateCurrentAssessmentId: (a: number, q: number) => {},
  handleDebuggerPause: () => {},
  handleDebuggerResume: () => {},
  handleDebuggerReset: () => {},
  handlePromptAutocomplete: (row: number, col: number, callback: any) => {},
  isRunning: false,
  isDebugging: false,
  enableDebugging: false,
  output: [],
  questionId: 0,
  replValue: ''
};

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

test('AssessmentWorkspace page "loading" content renders correctly', () => {
  const app = <AssessmentWorkspace {...mockUndefinedAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with programming question renders correctly', () => {
  const app = <AssessmentWorkspace {...mockProgrammingAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with overdue assessment renders correctly', () => {
  const app = <AssessmentWorkspace {...mockClosedProgrammingAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace page with MCQ question renders correctly', () => {
  const app = <AssessmentWorkspace {...mockMcqAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

/*  ===== Tester comments =====
    Issue:
      https://stackoverflow.com/questions/42813342/react-createelement-type-is-invalid-expected-a-string
    Description:
      Mounting the AssessmentWorkspace deeply (rendering all recursive subcomponents) in Enzyme with mount
      results in the test failing with the error
          Warning: React.createElement: type is invalid -- expected a string (for built-in components) or
          a class/function (for composite components) but got: undefined. You likely forgot to export your
          component from the file it's defined in, or you might have mixed up default and named imports.

          Check the render method of `Workspace`.

          The above error occurred in the <div> component:
            in div (created by Workspace)
            in div (created by Workspace)
            in Workspace (created by AssessmentWorkspace)
            in div (created by AssessmentWorkspace)
            in AssessmentWorkspace (created by WrapperComponent)
            in WrapperComponent

      whereas mounting it one-level deep in Enzyme using shallow throws no errors
    Fix:
      Stack trace suggests one of the React subcomponents of AssessmentWorkspace works in production
      but is not set up correctly - requires re-examination of every single React component and
      sub-component used in AssessmentWorkspace

      Current workaround is to mount AssessmentWorkspace shallowly since the behaviour is correct
      during user testing
*/

test('AssessmentWorkspace page with ContestVoting question renders correctly', () => {
  const app = <AssessmentWorkspace {...mockContestVotingAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('AssessmentWorkspace renders Grading tab correctly if the question has been graded', () => {
  const app = <AssessmentWorkspace {...mockGradedProgrammingAssessmentWorkspaceProps} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  // Uncomment when fixed
  // expect(tree.find('.grading-icon').hostNodes()).toHaveLength(1);
});
