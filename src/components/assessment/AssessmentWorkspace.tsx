import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Dialog,
  Intent,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import ChatApp from '../../containers/ChatContainer';
import { InterpreterOutput, IWorkspaceState } from '../../reducers/states';
import { USE_CHATKIT } from '../../utils/constants';
import { beforeNow } from '../../utils/dateHelpers';
import { history } from '../../utils/history';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { controlButton } from '../commons';
import Markdown from '../commons/Markdown';
import Workspace, { WorkspaceProps } from '../workspace';
import { ControlBarProps } from '../workspace/ControlBar';
import { SideContentProps } from '../workspace/side-content';
import Autograder from '../workspace/side-content/Autograder';
import ToneMatrix from '../workspace/side-content/ToneMatrix';
import {
  AutogradingResult,
  IAssessment,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  ITestcase,
  Library,
  QuestionTypes
} from './assessmentShape';
import GradingResult from './GradingResult';

export type AssessmentWorkspaceProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  activeTab: number;
  assessment?: IAssessment;
  autogradingResults: AutogradingResult[];
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
  storedAssessmentId?: number;
  storedQuestionId?: number;
};

export type OwnProps = {
  assessmentId: number;
  questionId: number;
  notAttempted: boolean;
  closeDate: string;
};

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void;
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
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleResetWorkspace: (options: Partial<IWorkspaceState>) => void;
  handleSave: (id: number, answer: number | string) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
};

class AssessmentWorkspace extends React.Component<
  AssessmentWorkspaceProps,
  { showOverlay: boolean; showResetTemplateOverlay: boolean }
> {
  public constructor(props: AssessmentWorkspaceProps) {
    super(props);
    this.state = {
      showOverlay: false,
      showResetTemplateOverlay: false
    };
    this.props.handleEditorValueChange('');
  }

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  public componentDidMount() {
    this.props.handleAssessmentFetch(this.props.assessmentId);
    if (this.props.questionId === 0 && this.props.notAttempted) {
      this.setState({ showOverlay: true });
    }
    if (!this.props.assessment) {
      return;
    }

    let questionId = this.props.questionId;
    if (this.props.questionId >= this.props.assessment.questions.length) {
      questionId = this.props.assessment.questions.length - 1;
    }

    const question: IQuestion = this.props.assessment.questions[questionId];

    let answer = '';
    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = (question as IProgrammingQuestion).answer as string;
      } else {
        answer = (question as IProgrammingQuestion).solutionTemplate;
      }
    }

    this.props.handleEditorValueChange(answer);
  }

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  public componentDidUpdate() {
    this.checkWorkspaceReset(this.props);
  }

  public render() {
    if (this.props.assessment === undefined || this.props.assessment.questions.length === 0) {
      return (
        <NonIdealState
          className={classNames('WorkspaceParent', Classes.DARK)}
          description="Getting mission ready..."
          icon={<Spinner size={Spinner.SIZE_LARGE} />}
        />
      );
    }
    const overlay = (
      <Dialog className="assessment-briefing" isOpen={this.state.showOverlay}>
        <Card>
          <Markdown content={this.props.assessment.longSummary} />
          <Button
            className="assessment-briefing-button"
            // tslint:disable-next-line jsx-no-lambda
            onClick={() => this.setState({ showOverlay: false })}
            text="Continue"
          />
        </Card>
      </Dialog>
    );

    const resetTemplateOverlay = (
      <Dialog
        className="assessment-reset"
        icon={IconNames.ERROR}
        isCloseButtonShown={false}
        isOpen={this.state.showResetTemplateOverlay}
        title="Confirmation: Reset editor?"
      >
        <div className={Classes.DIALOG_BODY}>
          <Markdown content="Are you sure you want to reset the template?" />
          <Markdown content="*Note this will not affect the saved copy of your code, unless you save over it.*" />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonGroup>
            {controlButton(
              'Cancel',
              null,
              () => this.setState({ showResetTemplateOverlay: false }),
              {
                minimal: false
              }
            )}
            {controlButton(
              'Confirm',
              null,
              () => {
                this.setState({ showResetTemplateOverlay: false });
                this.props.handleEditorValueChange(
                  (this.props.assessment!.questions[questionId] as IProgrammingQuestion)
                    .solutionTemplate
                );
                this.props.handleUpdateHasUnsavedChanges(true);
              },
              { minimal: false, intent: Intent.DANGER }
            )}
          </ButtonGroup>
        </div>
      </Dialog>
    );
    /* If questionId is out of bounds, set it to the max. */
    const questionId =
      this.props.questionId >= this.props.assessment.questions.length
        ? this.props.assessment.questions.length - 1
        : this.props.questionId;
    const question: IQuestion = this.props.assessment.questions[questionId];
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props, questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorSessionId: '',
              editorValue: this.props.editorValue!,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              handleUpdateHasUnsavedChanges: this.props.handleUpdateHasUnsavedChanges,
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
      hasUnsavedChanges: this.props.hasUnsavedChanges,
      mcqProps: {
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (option: number) =>
          this.props.handleSave(this.props.assessment!.questions[questionId].id, option)
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
        {overlay}
        {resetTemplateOverlay}
        <Workspace {...workspaceProps} />
      </div>
    );
  }

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  private checkWorkspaceReset(props: AssessmentWorkspaceProps) {
    /* Don't reset workspace if assessment not fetched yet. */
    if (this.props.assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/
    const assessmentId = this.props.assessmentId;
    const questionId = this.props.questionId;

    if (
      this.props.storedAssessmentId === assessmentId &&
      this.props.storedQuestionId === questionId
    ) {
      return;
    }

    const question = this.props.assessment.questions[questionId];

    let autogradingResults: AutogradingResult[] = [];
    let editorValue: string = '';
    let editorPrepend: string = '';
    let editorPostpend: string = '';
    let editorTestcases: ITestcase[] = [];

    if (question.type === QuestionTypes.programming) {
      const questionData = question as IProgrammingQuestion;
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
    this.props.handleUpdateCurrentAssessmentId(assessmentId, questionId);
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

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const tabs = [
      {
        label: `Task ${questionId + 1}`,
        icon: IconNames.NINJA,
        body: <Markdown content={props.assessment!.questions[questionId].content} />
      },
      {
        label: `${props.assessment!.category} Briefing`,
        icon: IconNames.BRIEFCASE,
        body: <Markdown content={props.assessment!.longSummary} />
      },
      {
        label: `${props.assessment!.category} Autograder`,
        icon: IconNames.AIRPLANE,
        body: (
          <Autograder
            testcases={props.editorTestcases}
            autogradingResults={props.autogradingResults}
            handleTestcaseEval={this.props.handleTestcaseEval}
          />
        )
      }
    ];
    const isGraded = props.assessment!.questions[questionId].grader !== null;
    if (isGraded) {
      tabs.push(
        {
          label: `Grading`,
          icon: IconNames.TICK,
          body: (
            <GradingResult
              graderName={props.assessment!.questions[questionId].grader.name}
              gradedAt={props.assessment!.questions[questionId].gradedAt}
              xp={props.assessment!.questions[questionId].xp}
              grade={props.assessment!.questions[questionId].grade}
              maxGrade={props.assessment!.questions[questionId].maxGrade}
              maxXp={props.assessment!.questions[questionId].maxXp}
            />
          )
        },
        {
          label: `Comments`,
          icon: IconNames.CHAT,
          body: USE_CHATKIT ? (
            <ChatApp
              assessmentId={this.props.assessment!.id}
              roomId={props.assessment!.questions[questionId].comment}
            />
          ) : (
            <span>Chatkit disabled.</span>
          )
        }
      );
    }

    const functionsAttached = props.assessment!.questions[questionId].library.external.symbols;
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        icon: IconNames.GRID_VIEW,
        body: <ToneMatrix />
      });
    }
    return {
      activeTab: props.activeTab,
      handleChangeActiveTab: props.handleChangeActiveTab,
      tabs
    };
  };

  /** Pre-condition: IAssessment has been loaded */
  private controlBarProps: (p: AssessmentWorkspaceProps, q: number) => ControlBarProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const listingPath = `/academy/${assessmentCategoryLink(this.props.assessment!.category)}`;
    const assessmentWorkspacePath = listingPath + `/${this.props.assessment!.id.toString()}`;
    return {
      handleChapterSelect: this.props.handleChapterSelect,
      handleEditorEval: this.props.handleEditorEval,
      handleInterruptEval: this.props.handleInterruptEval,
      handleReplEval: this.props.handleReplEval,
      handleReplOutputClear: this.props.handleReplOutputClear,
      handleReplValueChange: this.props.handleReplValueChange,
      handleDebuggerPause: this.props.handleDebuggerPause,
      handleDebuggerResume: this.props.handleDebuggerResume,
      handleDebuggerReset: this.props.handleDebuggerReset,
      hasChapterSelect: false,
      hasCollabEditing: false,
      hasEditorAutorunButton: false,
      hasSaveButton:
        !beforeNow(this.props.closeDate) &&
        this.props.assessment!.questions[questionId].type !== QuestionTypes.mcq,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      isDebugging: this.props.isDebugging,
      enableDebugging: this.props.enableDebugging,
      onClickNext: () => history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`),
      onClickReturn: () => history.push(listingPath),
      onClickSave: () =>
        this.props.handleSave(
          this.props.assessment!.questions[questionId].id,
          this.props.editorValue!
        ),
      onClickResetTemplate: () => {
        this.setState({ showResetTemplateOverlay: true });
      },
      questionProgress: [questionId + 1, this.props.assessment!.questions.length],
      sourceChapter: this.props.assessment!.questions[questionId].library.chapter
    };
  };
}

export default AssessmentWorkspace;
