import { Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';
import SideContentToneMatrix from 'src/commons/sideContent/SideContentToneMatrix';

import {
  defaultWorkspaceManager,
  InterpreterOutput
} from '../../../../commons/application/ApplicationTypes';
import {
  AutogradingResult,
  IMCQQuestion,
  Library,
  Question,
  QuestionTypes,
  Testcase
} from '../../../../commons/assessment/AssessmentTypes';
import { ControlBarProps } from '../../../../commons/controlBar/ControlBar';
import { ControlBarClearButton } from '../../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../../commons/controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../../../../commons/controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../../../../commons/controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../../../../commons/controlBar/ControlBarQuestionViewButton';
import { ControlBarRunButton } from '../../../../commons/controlBar/ControlBarRunButton';
import { convertEditorTabStateToProps } from '../../../../commons/editor/EditorContainer';
import { Position } from '../../../../commons/editor/EditorTypes';
import Markdown from '../../../../commons/Markdown';
import { SideContentProps } from '../../../../commons/sideContent/SideContent';
import SideContentAutograder from '../../../../commons/sideContent/SideContentAutograder';
import { SideContentTab, SideContentType } from '../../../../commons/sideContent/SideContentTypes';
import { history } from '../../../../commons/utils/HistoryHelper';
import Workspace, { WorkspaceProps } from '../../../../commons/workspace/Workspace';
import { EditorTabState, WorkspaceState } from '../../../../commons/workspace/WorkspaceTypes';
import { AnsweredQuestion, Grading } from '../../../../features/grading/GradingTypes';
import GradingEditor from './GradingEditorContainer';

type GradingWorkspaceProps = DispatchProps & OwnProps & StateProps;

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleClearContext: (library: Library, shouldInitLibrary: boolean) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleSetActiveEditorTabIndex: (activeEditorTabIndex: number | null) => void;
  handleRemoveEditorTabByIndex: (editorTabIndex: number) => void;
  handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => void;
  handleGradingFetch: (submissionId: number) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleResetWorkspace: (options: Partial<WorkspaceState>) => void;
  handleChangeExecTime: (execTimeMs: number) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleRunAllTestcases: () => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
};

export type OwnProps = {
  submissionId: number;
  questionId: number;
};

export type StateProps = {
  autogradingResults: AutogradingResult[];
  grading?: Grading;
  isFolderModeEnabled: boolean;
  activeEditorTabIndex: number | null;
  editorTabs: EditorTabState[];
  editorTestcases: Testcase[];
  hasUnsavedChanges: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  replValue: string;
  sideContentHeight?: number;
  storedSubmissionId?: number;
  storedQuestionId?: number;
  courseId?: number;
};

type State = {
  selectedTab: SideContentType;
};

class GradingWorkspace extends React.Component<GradingWorkspaceProps, State> {
  public constructor(props: GradingWorkspaceProps) {
    super(props);

    this.state = {
      selectedTab: SideContentType.grading
    };

    this.handleEval = this.handleEval.bind(this);
  }

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

    const question: AnsweredQuestion = this.props.grading[questionId].question;
    let answer: string = '';

    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = question.answer as string;
      } else {
        answer = question.solutionTemplate || '';
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    this.props.handleEditorValueChange(0, answer);
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
      history.push(`/courses/${this.props.courseId}/grading`);
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
          icon={<Spinner size={SpinnerSize.LARGE} />}
        />
      );
    }

    /* If questionId is out of bounds, set it to the max. */
    const questionId =
      this.props.questionId >= this.props.grading.length
        ? this.props.grading.length - 1
        : this.props.questionId;
    /* Get the question to be graded */
    const question = this.props.grading[questionId].question as Question;
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(questionId),
      editorContainerProps:
        question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
          ? {
              editorVariant: 'normal',
              isFolderModeEnabled: this.props.isFolderModeEnabled,
              activeEditorTabIndex: this.props.activeEditorTabIndex,
              setActiveEditorTabIndex: this.props.handleSetActiveEditorTabIndex,
              removeEditorTabByIndex: this.props.handleRemoveEditorTabByIndex,
              editorTabs: this.props.editorTabs.map(convertEditorTabStateToProps),
              editorSessionId: '',
              handleDeclarationNavigate: this.props.handleDeclarationNavigate,
              handleEditorEval: this.handleEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
              handlePromptAutocomplete: this.props.handlePromptAutocomplete,
              isEditorAutorun: false,
              sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
              sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
              externalLibraryName: question?.library?.external?.name || 'NONE'
            }
          : undefined,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      mcqProps: {
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (i: number) => {}
      },
      sideBarProps: {
        tabs: []
      },
      sideContentHeight: this.props.sideContentHeight,
      sideContentProps: this.sideContentProps(this.props, questionId),
      replProps: {
        handleBrowseHistoryDown: this.props.handleBrowseHistoryDown,
        handleBrowseHistoryUp: this.props.handleBrowseHistoryUp,
        handleReplEval: this.props.handleReplEval,
        handleReplValueChange: this.props.handleReplValueChange,
        output: this.props.output,
        replValue: this.props.replValue,
        sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
        sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
        externalLibrary: question?.library?.external?.name || 'NONE',
        replButtons: this.replButtons()
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
    const question = props.grading![questionId].question as Question;

    let autogradingResults: AutogradingResult[] = [];
    let editorValue: string = '';
    let programPrependValue: string = '';
    let programPostpendValue: string = '';
    let editorTestcases: Testcase[] = [];

    if (question.type === QuestionTypes.programming) {
      const questionData = question as AnsweredQuestion;
      autogradingResults = questionData.autogradingResults;
      programPrependValue = questionData.prepend;
      programPostpendValue = questionData.postpend;
      editorTestcases = questionData.testcases;

      editorValue = questionData.answer as string;
      if (!editorValue) {
        editorValue = questionData.solutionTemplate!;
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorUpdateBreakpoints(0, []);
    props.handleUpdateCurrentSubmissionId(submissionId, questionId);
    props.handleResetWorkspace({
      autogradingResults,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorTabs: [
        {
          value: editorValue,
          highlightedLines: [],
          breakpoints: []
        }
      ],
      programPrependValue,
      programPostpendValue,
      editorTestcases
    });
    props.handleChangeExecTime(
      question.library.execTimeMs ?? defaultWorkspaceManager.grading.execTime
    );
    props.handleClearContext(question.library, true);
    props.handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      props.handleEditorValueChange(0, editorValue);
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
            initialXp={props.grading![questionId].grade.xp}
            xpAdjustment={props.grading![questionId].grade.xpAdjustment}
            maxXp={props.grading![questionId].question.maxXp}
            studentName={props.grading![questionId].student.name}
            comments={props.grading![questionId].grade.comments ?? ''}
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
        label: `Question ${questionId + 1}`,
        iconName: IconNames.NINJA,
        body: <Markdown content={props.grading![questionId].question.content} />,
        id: SideContentType.questionOverview
      },
      {
        label: `Autograder`,
        iconName: IconNames.AIRPLANE,
        body: (
          <SideContentAutograder
            testcases={props.editorTestcases}
            autogradingResults={props.autogradingResults}
            handleTestcaseEval={this.props.handleTestcaseEval}
            workspaceLocation="grading"
          />
        ),
        id: SideContentType.autograder
      }
    ];
    const externalLibrary = props.grading![questionId].question.library.external;
    const functionsAttached = externalLibrary.symbols;
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        iconName: IconNames.GRID_VIEW,
        body: <SideContentToneMatrix />,
        id: SideContentType.toneMatrix
      });
    }

    const sideContentProps: SideContentProps = {
      onChange: (
        newTabId: SideContentType,
        prevTabId: SideContentType,
        event: React.MouseEvent<HTMLElement>
      ) => {
        if (newTabId === prevTabId) {
          return;
        }
        this.setState({ selectedTab: newTabId });
      },
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: 'grading'
    };

    return sideContentProps;
  };

  /** Pre-condition: Grading has been loaded */
  private controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${this.props.courseId}/grading`;
    const gradingWorkspacePath = listingPath + `/${this.props.submissionId}`;
    const questionProgress: [number, number] = [questionId + 1, this.props.grading!.length];

    const onClickPrevious = () =>
      history.push(gradingWorkspacePath + `/${(questionId - 1).toString()}`);
    const onClickNext = () =>
      history.push(gradingWorkspacePath + `/${(questionId + 1).toString()}`);
    const onClickReturn = () => history.push(listingPath);

    const nextButton = (
      <ControlBarNextButton
        onClickNext={onClickNext}
        onClickReturn={onClickReturn}
        questionProgress={questionProgress}
        key="next_question"
      />
    );

    const previousButton = (
      <ControlBarPreviousButton
        onClick={onClickPrevious}
        questionProgress={questionProgress}
        key="previous_question"
      />
    );

    const questionView = (
      <ControlBarQuestionViewButton questionProgress={questionProgress} key="question_view" />
    );

    const runButton = (
      <ControlBarRunButton
        isEntrypointFileDefined={this.props.activeEditorTabIndex !== null}
        handleEditorEval={this.handleEval}
        key="run"
      />
    );

    return {
      editorButtons: [runButton],
      flowButtons: [previousButton, questionView, nextButton]
    };
  };

  private replButtons() {
    const clearButton = (
      <ControlBarClearButton
        handleReplOutputClear={this.props.handleReplOutputClear}
        key="clear_repl"
      />
    );

    const evalButton = (
      <ControlBarEvalButton
        handleReplEval={this.props.handleReplEval}
        isRunning={this.props.isRunning}
        key="eval_repl"
      />
    );

    return [evalButton, clearButton];
  }

  private handleEval() {
    this.props.handleEditorEval();

    // Run testcases when the autograder tab is selected
    if (this.state.selectedTab === SideContentType.autograder) {
      this.props.handleRunAllTestcases();
    }
  }
}

export default GradingWorkspace;
