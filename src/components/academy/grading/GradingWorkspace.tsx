import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

import GradingEditor from '../../../containers/academy/grading/GradingEditorContainer';
import ChatApp from '../../../containers/ChatContainer';
import { InterpreterOutput, IWorkspaceState } from '../../../reducers/states';
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
import { ControlBarProps } from '../../workspace/ControlBar';
import { SideContentProps } from '../../workspace/side-content';
import Autograder from '../../workspace/side-content/Autograder';
import { Grading, IAnsweredQuestion } from './gradingShape';

export type GradingWorkspaceProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  activeTab: number;
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
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeActiveTab: (activeTab: number) => void;
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
    this.checkWorkspaceReset(this.props);
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
      controlBarProps: this.controlBarProps(this.props, questionId),
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
   */
  private checkWorkspaceReset(props: GradingWorkspaceProps) {
    /* Don't reset workspace if grading not fetched yet. */
    if (this.props.grading === undefined) {
      return;
    }

    /* Reset grading if it has changed.*/
    const submissionId = this.props.submissionId;
    const questionId = this.props.questionId;

    if (
      this.props.storedSubmissionId === submissionId &&
      this.props.storedQuestionId === questionId
    ) {
      return;
    }
    const question = this.props.grading[questionId].question as IQuestion;

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

    this.props.handleEditorUpdateBreakpoints([]);
    this.props.handleUpdateCurrentSubmissionId(submissionId, questionId);
    this.props.handleResetWorkspace({
      autogradingResults,
      editorPrepend,
      editorValue,
      editorPostpend,
      editorTestcases
    });
    this.props.handleClearContext(question.library);
    this.props.handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      this.props.handleEditorValueChange(editorValue);
    }
  }

  /** Pre-condition: Grading has been loaded */
  private sideContentProps: (p: GradingWorkspaceProps, q: number) => SideContentProps = (
    props: GradingWorkspaceProps,
    questionId: number
  ) => ({
    activeTab: props.activeTab,
    handleChangeActiveTab: props.handleChangeActiveTab,
    tabs: [
      {
        label: `Grading: Question ${questionId}`,
        icon: IconNames.TICK,
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
          />
        )
      },
      {
        label: `Task ${questionId + 1}`,
        icon: IconNames.NINJA,
        body: <Markdown content={props.grading![questionId].question.content} />
      },
      {
        label: `Chat`,
        icon: IconNames.CHAT,
        body: USE_CHATKIT ? (
          <ChatApp
            roomId={props.grading![questionId].grade.comment}
            submissionId={this.props.submissionId}
          />
        ) : (
          <span>ChatKit disabled.</span>
        )
      },
      {
        label: `Autograder`,
        icon: IconNames.AIRPLANE,
        body: (
          <Autograder
            testcases={props.editorTestcases}
            autogradingResults={props.autogradingResults}
            handleTestcaseEval={this.props.handleTestcaseEval}
          />
        )
      }
    ]
  });

  /** Pre-condition: Grading has been loaded */
  private controlBarProps: (p: GradingWorkspaceProps, q: number) => ControlBarProps = (
    props: GradingWorkspaceProps,
    questionId: number
  ) => {
    const listingPath = `/academy/grading`;
    const gradingWorkspacePath = listingPath + `/${this.props.submissionId}`;
    return {
      handleChapterSelect: this.props.handleChapterSelect,
      handleEditorEval: this.props.handleEditorEval,
      handleInterruptEval: this.props.handleInterruptEval,
      handleReplEval: this.props.handleReplEval,
      handleReplOutputClear: this.props.handleReplOutputClear,
      handleDebuggerPause: this.props.handleDebuggerPause,
      handleDebuggerResume: this.props.handleDebuggerResume,
      handleDebuggerReset: this.props.handleDebuggerReset,
      hasChapterSelect: false,
      hasCollabEditing: false,
      hasEditorAutorunButton: false,
      hasSaveButton: false,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      isDebugging: this.props.isDebugging,
      enableDebugging: this.props.enableDebugging,
      onClickNext: () => history.push(gradingWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () => history.push(gradingWorkspacePath + `/${(questionId - 1).toString()}`),
      onClickReturn: () => history.push(listingPath),
      questionProgress: [questionId + 1, this.props.grading!.length],
      sourceChapter: this.props.grading![questionId].question.library.chapter
    };
  };
}

export default GradingWorkspace;
