import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

import GradingEditor from '../../../containers/academy/grading/GradingEditorContainer';
import ChatApp from '../../../containers/ChatContainer';
import { InterpreterOutput, IWorkspaceState, SideContentType } from '../../../reducers/states';
import { USE_CHATKIT } from '../../../utils/constants';
import { history } from '../../../utils/history';
import {
  AutogradingResult,
  IMCQQuestion,
  IQuestion,
  ITestcase,
  Library,
  QuestionTypes
} from '../../assessment/assessmentShape';
import Markdown from '../../commons/Markdown';
import Workspace, { WorkspaceProps } from '../../workspace';
import { ControlBarProps } from '../../workspace/controlBar/ControlBar';
import {
  ClearButton,
  EvalButton,
  NextButton,
  PreviousButton,
  QuestionView,
  RunButton
} from '../../workspace/controlBar/index';
import { SideContentProps, SideContentTab } from '../../workspace/side-content';
import Autograder from '../../workspace/side-content/Autograder';
import ToneMatrix from '../../workspace/side-content/ToneMatrix';
import { Grading, IAnsweredQuestion } from './gradingShape';

export type GradingWorkspaceProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  autogradingResults: AutogradingResult[];
  grading?: Grading;
  editorPrepend: string;
  editorValue: string | null;
  editorPostpend: string;
  editorTestcases: ITestcase[];
  editorHeight?: number;
  editorWidth: string;
  breakpoints: string[];
  highlightedLines: number[][];
  hasUnsavedChanges: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  replValue: string;
  sideContentHeight?: number;
  storedSubmissionId?: number;
  storedQuestionId?: number;
};

export type OwnProps = {
  submissionId: number;
  questionId: number;
};

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: any, changeEvent: any) => void;
  handleClearContext: (library: Library) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleGradingFetch: (submissionId: number) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleResetWorkspace: (options: Partial<IWorkspaceState>) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

class GradingWorkspace extends React.Component<GradingWorkspaceProps> {
  /**
   * After mounting (either an older copy of the grading
   * or a loading screen), try to fetch a newer grading.
   */
  public componentDidMount() {
    this.props.handleGradingFetch(this.props.submissionId);

    if (!this.props.grading) {
      return;
    }

    let questionId = this.props.questionId;
    if (this.props.questionId >= this.props.grading.length) {
      questionId = this.props.grading.length - 1;
    }

    const question: IAnsweredQuestion = this.props.grading[questionId].question;
    let answer: string = '';

    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = question.answer as string;
      } else {
        answer = question.solutionTemplate || '';
      }
    }

    this.props.handleEditorValueChange(answer);
  }

  /**
   * Once there is an update (due to the grading being fetched), check
   * if a workspace reset is needed.
   */
  public componentDidUpdate() {
    /* Don't reset workspace if grading not fetched yet. */
    if (this.props.grading === undefined) {
      return;
    }
    const questionId = this.props.questionId;

    /**
     * Check if questionId is out of bounds, if it is, redirect to the
     * grading overview page
     *
     * This occurs if the grading is submitted on the last question,
     * as the function to move to the next question does not check
     * if that question exists
     */
    if (this.props.grading[questionId] === undefined) {
      history.push('/academy/grading');
    } else {
      this.checkWorkspaceReset(this.props);
    }
  }

  public render() {
    if (this.props.grading === undefined) {
      return (
        <NonIdealState
          className={classNames('WorkspaceParent', Classes.DARK)}
          description="Getting assessment ready..."
          icon={<Spinner size={Spinner.SIZE_LARGE} />}
        />
      );
    }

    /* If questionId is out of bounds, set it to the max. */
    const questionId =
      this.props.questionId >= this.props.grading.length
        ? this.props.grading.length - 1
        : this.props.questionId;
    /* Get the question to be graded */
    const question = this.props.grading[questionId].question as IQuestion;
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorSessionId: '',
              editorValue: this.props.editorValue!,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              breakpoints: this.props.breakpoints,
              highlightedLines: this.props.highlightedLines,
              handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
              isEditorAutorun: false
            }
          : undefined,
      editorHeight: this.props.editorHeight,
      editorWidth: this.props.editorWidth,
      handleEditorHeightChange: this.props.handleEditorHeightChange,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      mcqProps: {
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (i: number) => {}
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: this.sideContentProps(this.props, questionId),
      replProps: {
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange,
        output: this.props.output,
        replValue: this.props.replValue
      }
    };
    return (
      <div className={classNames('WorkspaceParent', Classes.DARK)}>
        <Workspace {...workspaceProps} />
      </div>
    );
  }

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   *
   * Assumes that 'props.grading' is defined
   */
  private checkWorkspaceReset(props: GradingWorkspaceProps) {
    /* Reset grading if it has changed.*/
    const submissionId = props.submissionId;
    const questionId = props.questionId;

    if (props.storedSubmissionId === submissionId && props.storedQuestionId === questionId) {
      return;
    }
    const question = props.grading![questionId].question as IQuestion;

    let autogradingResults: AutogradingResult[] = [];
    let editorValue: string = '';
    let editorPrepend: string = '';
    let editorPostpend: string = '';
    let editorTestcases: ITestcase[] = [];

    if (question.type === QuestionTypes.programming) {
      const questionData = question as IAnsweredQuestion;
      autogradingResults = questionData.autogradingResults;
      editorPrepend = questionData.prepend;
      editorPostpend = questionData.postpend;
      editorTestcases = questionData.testcases;

      editorValue = questionData.answer as string;
      if (!editorValue) {
        editorValue = questionData.solutionTemplate!;
      }
    }

    props.handleEditorUpdateBreakpoints([]);
    props.handleUpdateCurrentSubmissionId(submissionId, questionId);
    props.handleResetWorkspace({
      autogradingResults,
      editorPrepend,
      editorValue,
      editorPostpend,
      editorTestcases
    });
    props.handleClearContext(question.library);
    props.handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      props.handleEditorValueChange(editorValue);
    }
  }

  /** Pre-condition: Grading has been loaded */
  private sideContentProps: (p: GradingWorkspaceProps, q: number) => SideContentProps = (
    props: GradingWorkspaceProps,
    questionId: number
  ) => {
    const tabs: SideContentTab[] = [
      {
        label: `Grading: Question ${questionId + 1}`,
        iconName: IconNames.TICK,
        /* Render an editor with the xp given to the current question. */
        body: (
          <GradingEditor
            solution={props.grading![questionId].question.solution}
            questionId={props.grading![questionId].question.id}
            submissionId={props.submissionId}
            initialGrade={props.grading![questionId].grade.grade}
            gradeAdjustment={props.grading![questionId].grade.gradeAdjustment}
            maxGrade={props.grading![questionId].question.maxGrade}
            initialXp={props.grading![questionId].grade.xp}
            xpAdjustment={props.grading![questionId].grade.xpAdjustment}
            maxXp={props.grading![questionId].question.maxXp}
            studentName={props.grading![questionId].student.name}
            comments={props.grading![questionId].grade.comments!}
            graderName={
              props.grading![questionId].grade.grader
                ? props.grading![questionId].grade.grader!.name
                : undefined
            }
            gradedAt={
              props.grading![questionId].grade.grader
                ? props.grading![questionId].grade.gradedAt!
                : undefined
            }
          />
        ),
        id: SideContentType.grading
      },
      {
        label: `Task ${questionId + 1}`,
        iconName: IconNames.NINJA,
        body: <Markdown content={props.grading![questionId].question.content} />,
        id: SideContentType.questionOverview
      },
      {
        label: `Chat`,
        iconName: IconNames.CHAT,
        body: USE_CHATKIT ? (
          <ChatApp
            roomId={props.grading![questionId].grade.roomId}
            submissionId={this.props.submissionId}
          />
        ) : (
          <span>Chatkit disabled.</span>
        ),
        id: SideContentType.chat,
        disabled: !USE_CHATKIT
      },
      {
        label: `Autograder`,
        iconName: IconNames.AIRPLANE,
        body: (
          <Autograder
            testcases={props.editorTestcases}
            autogradingResults={props.autogradingResults}
            handleTestcaseEval={this.props.handleTestcaseEval}
          />
        ),
        id: SideContentType.autograder
      }
    ];

    const functionsAttached = props.grading![questionId].question.library.external.symbols;
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        iconName: IconNames.GRID_VIEW,
        body: <ToneMatrix />,
        id: SideContentType.toneMatrix
      });
    }

    const sideContentProps: SideContentProps = {
      handleActiveTabChange: props.handleActiveTabChange,
      tabs
    };

    return sideContentProps;
  };

  /** Pre-condition: Grading has been loaded */
  private controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/academy/grading`;
    const gradingWorkspacePath = listingPath + `/${this.props.submissionId}`;
    const questionProgress: [number, number] = [questionId + 1, this.props.grading!.length];

    const onClickPrevious = () =>
      history.push(gradingWorkspacePath + `/${(questionId - 1).toString()}`);
    const onClickNext = () =>
      history.push(gradingWorkspacePath + `/${(questionId + 1).toString()}`);
    const onClickReturn = () => history.push(listingPath);

    const clearButton = (
      <ClearButton handleReplOutputClear={this.props.handleReplOutputClear} key="clear_repl" />
    );

    const evalButton = (
      <EvalButton
        handleReplEval={this.props.handleReplEval}
        isRunning={this.props.isRunning}
        key="eval_repl"
      />
    );

    const nextButton = (
      <NextButton
        onClickNext={onClickNext}
        onClickReturn={onClickReturn}
        questionProgress={questionProgress}
        key="next_question"
      />
    );

    const previousButton = (
      <PreviousButton
        onClick={onClickPrevious}
        questionProgress={questionProgress}
        key="previous_question"
      />
    );

    const questionView = <QuestionView questionProgress={questionProgress} key="question_view" />;

    const runButton = <RunButton handleEditorEval={this.props.handleEditorEval} key="run" />;

    return {
      editorButtons: [runButton],
      flowButtons: [previousButton, questionView, nextButton],
      replButtons: [evalButton, clearButton]
    };
  };
}

export default GradingWorkspace;
