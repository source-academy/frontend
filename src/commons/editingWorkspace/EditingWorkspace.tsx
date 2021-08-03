import { ButtonGroup, Classes, Dialog, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';

import { InterpreterOutput } from '../application/ApplicationTypes';
import {
  Assessment,
  AssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  Library,
  Question,
  QuestionTypes,
  Testcase
} from '../assessment/AssessmentTypes';
import { ControlBarProps } from '../controlBar/ControlBar';
import { ControlBarClearButton } from '../controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../controlBar/ControlBarSaveButton';
import { ControlBarToggleEditModeButton } from '../controlBar/ControlBarToggleEditModeButton';
import controlButton from '../ControlButton';
import { AutograderTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentAutograderTab';
import { DeploymentTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentDeploymentTab';
import { GradingTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentGradingTab';
import { ManageQuestionTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentManageQuestionTab';
import { MCQQuestionTemplateTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentMcqQuestionTemplateTab';
import { ProgrammingQuestionTemplateTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentProgrammingQuestionTemplateTab';
import { TextAreaContent } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentTextAreaContent';
import { HighlightedLines, Position } from '../editor/EditorTypes';
import Markdown from '../Markdown';
import { SideContentProps } from '../sideContent/SideContent';
import SideContentToneMatrix from '../sideContent/SideContentToneMatrix';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import { history } from '../utils/HistoryHelper';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import { WorkspaceState } from '../workspace/WorkspaceTypes';
import {
  retrieveLocalAssessment,
  storeLocalAssessment,
  storeLocalAssessmentOverview
} from '../XMLParser/XMLParserHelper';

export type EditingWorkspaceProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: any, changeEvent: any) => void;
  handleClearContext: (library: Library, shouldInitLibrary: boolean) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleResetWorkspace: (options: Partial<WorkspaceState>) => void;
  handleUpdateWorkspace: (options: Partial<WorkspaceState>) => void;
  handleSave: (id: number, answer: number | string) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
};

export type OwnProps = {
  assessmentId: number;
  questionId: number;
  assessmentOverview: AssessmentOverview;
  updateAssessmentOverview: (overview: AssessmentOverview) => void;
  notAttempted: boolean;
  closeDate: string;
};

export type StateProps = {
  editorHeight?: number;
  editorValue: string | null;
  editorWidth: string;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  hasUnsavedChanges: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  replValue: string;
  sideContentHeight?: number;
  storedAssessmentId?: number;
  storedQuestionId?: number;
};

type State = {
  assessment: Assessment | null;
  activeTab: SideContentType;
  editingMode: string;
  hasUnsavedChanges: boolean;
  showResetTemplateOverlay: boolean;
  originalMaxXp: number;
};

class EditingWorkspace extends React.Component<EditingWorkspaceProps, State> {
  public constructor(props: EditingWorkspaceProps) {
    super(props);
    this.state = {
      assessment: retrieveLocalAssessment(),
      activeTab: SideContentType.editorQuestionOverview,
      editingMode: 'question',
      hasUnsavedChanges: false,
      showResetTemplateOverlay: false,
      originalMaxXp: 0
    };
  }

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  public componentDidMount() {
    if (this.state.assessment) {
      this.resetWorkspaceValues();
      this.setState({
        originalMaxXp: this.getMaxXp()
      });
    }
  }

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  public componentDidUpdate() {
    this.checkWorkspaceReset(this.props);
  }

  public render() {
    if (this.state.assessment === null || this.state.assessment!.questions.length === 0) {
      return (
        <NonIdealState
          className={classNames('WorkspaceParent', Classes.DARK)}
          description="Getting mission ready..."
          icon={<Spinner size={Spinner.SIZE_LARGE} />}
        />
      );
    }

    const questionId = this.formatedQuestionId();
    const question: Question = this.state.assessment.questions[questionId];
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorSessionId: '',
              editorValue:
                this.props.editorValue ||
                question.editorValue ||
                (question as IProgrammingQuestion).solutionTemplate,
              handleDeclarationNavigate: this.props.handleDeclarationNavigate,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              breakpoints: this.props.breakpoints,
              highlightedLines: this.props.highlightedLines,
              newCursorPosition: this.props.newCursorPosition,
              handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
              handleUpdateHasUnsavedChanges: this.props.handleUpdateHasUnsavedChanges,
              handlePromptAutocomplete: this.props.handlePromptAutocomplete,
              isEditorAutorun: false
            }
          : undefined,
      editorHeight: this.props.editorHeight,
      editorWidth: this.props.editorWidth,
      handleEditorHeightChange: this.props.handleEditorHeightChange,
      handleEditorWidthChange: this.props.handleEditorWidthChange,
      handleSideContentHeightChange: this.props.handleSideContentHeightChange,
      hasUnsavedChanges: this.state.hasUnsavedChanges,
      mcqProps: {
        mcq: question as IMCQQuestion,
        handleMCQSubmit: (option: number) =>
          this.props.handleSave(this.state.assessment!.questions[questionId].id, option)
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
        sourceChapter: question?.library?.chapter || 4,
        sourceVariant: 'default',
        externalLibrary: question?.library?.external?.name || 'NONE',
        replButtons: this.replButtons()
      }
    };
    return (
      <div className={classNames('WorkspaceParent', Classes.DARK)}>
        {this.resetTemplateOverlay()}
        <Workspace {...workspaceProps} />
      </div>
    );
  }

  /* If questionId is out of bounds, set it within range. */
  private formatedQuestionId = () => {
    let questionId = this.props.questionId;
    if (questionId < 0) {
      questionId = 0;
    } else if (questionId >= this.state.assessment!.questions.length) {
      questionId = this.state.assessment!.questions.length - 1;
    }
    return questionId;
  };

  /**
   * Resets to last save.
   */
  private resetTemplateOverlay = () => (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={this.state.showResetTemplateOverlay}
      title="Confirmation: Reset editor?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to reset to your last save?" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          {controlButton('Cancel', null, () => this.setState({ showResetTemplateOverlay: false }), {
            minimal: false
          })}
          {controlButton(
            'Confirm',
            null,
            () => {
              const assessment = retrieveLocalAssessment()!;
              this.setState({
                assessment,
                hasUnsavedChanges: false,
                showResetTemplateOverlay: false,
                originalMaxXp: this.getMaxXp()
              });
              this.handleRefreshLibrary();
              this.resetWorkspaceValues();
            },
            { minimal: false, intent: Intent.DANGER }
          )}
        </ButtonGroup>
      </div>
    </Dialog>
  );

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  private checkWorkspaceReset(props: EditingWorkspaceProps) {
    /* Don't reset workspace if assessment not fetched yet. */
    if (this.state.assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/
    const assessmentId = -1;
    const questionId = this.formatedQuestionId();

    if (
      this.props.storedAssessmentId !== assessmentId ||
      this.props.storedQuestionId !== questionId
    ) {
      this.resetWorkspaceValues();
      this.props.handleUpdateCurrentAssessmentId(assessmentId, questionId);
      this.props.handleUpdateHasUnsavedChanges(false);
      if (this.state.hasUnsavedChanges) {
        this.setState({
          assessment: retrieveLocalAssessment(),
          hasUnsavedChanges: false
        });
      }
      this.handleRefreshLibrary();
    }
  }

  private handleRefreshLibrary = (library: Library | undefined = undefined) => {
    const question = this.state.assessment!.questions[this.formatedQuestionId()];
    if (!library) {
      library =
        question.library.chapter === -1
          ? this.state.assessment!.globalDeployment!
          : question.library;
    }
    if (library && library.globals.length > 0) {
      const globalsVal = library.globals.map((x: any) => x[0]);
      const symbolsVal = library.external.symbols.concat(globalsVal);
      library = {
        ...library,
        external: {
          name: library.external.name,
          symbols: uniq(symbolsVal)
        }
      };
    }
    this.props.handleClearContext(library, true);
  };

  private resetWorkspaceValues = () => {
    const question: Question = this.state.assessment!.questions[this.formatedQuestionId()];
    let editorValue: string;
    let editorPrepend = '';
    let editorPostpend = '';
    if (question.type === QuestionTypes.programming) {
      if (question.editorValue) {
        editorValue = question.editorValue;
      } else {
        editorValue = (question as IProgrammingQuestion).solutionTemplate as string;
      }
      editorPrepend = (question as IProgrammingQuestion).prepend;
      editorPostpend = (question as IProgrammingQuestion).postpend;
    } else {
      editorValue = '//If you see this, this is a bug. Please report bug.';
    }

    this.props.handleResetWorkspace({
      editorPrepend,
      editorValue,
      editorPostpend
    });
    this.props.handleEditorValueChange(editorValue);
  };

  private handleTestcaseEval = (testcase: Testcase) => {
    const editorTestcases = [testcase];
    this.props.handleUpdateWorkspace({ editorTestcases });
    this.props.handleTestcaseEval(0);
  };

  private handleSave = () => {
    const assessment = this.state.assessment!;
    assessment.questions[this.formatedQuestionId()].editorValue = this.props.editorValue;
    this.setState({
      assessment,
      hasUnsavedChanges: false
    });
    storeLocalAssessment(assessment);
    // this.handleRefreshLibrary();
    this.handleSaveXp();
  };

  private handleSaveXp = () => {
    const curXp = this.getMaxXp();
    const changeXp = curXp - this.state.originalMaxXp;
    if (changeXp !== 0) {
      const overview = this.props.assessmentOverview;
      if (changeXp !== 0) {
        overview.maxXp = curXp;
      }
      this.setState({
        originalMaxXp: curXp
      });
      this.props.updateAssessmentOverview(overview);
      storeLocalAssessmentOverview(overview);
    }
  };

  private getMaxXp = () => {
    let xp = 0;
    const questions = this.state.assessment!.questions;
    for (const question of questions) {
      xp += question.maxXp;
    }
    return xp as number;
  };
  private updateEditAssessmentState = (assessmentVal: Assessment) => {
    this.setState({
      assessment: assessmentVal,
      hasUnsavedChanges: true
    });
  };

  private updateAndSaveAssessment = (assessmentVal: Assessment) => {
    this.setState({
      assessment: assessmentVal
    });
    this.handleRefreshLibrary();
    this.handleSave();
    this.resetWorkspaceValues();
  };

  private handleActiveTabChange = (tab: SideContentType) => {
    this.setState({
      activeTab: tab
    });
  };
  private toggleEditingMode = () => {
    const toggle = this.state.editingMode === 'question' ? 'global' : 'question';
    this.setState({
      editingMode: toggle
    });
  };

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: EditingWorkspaceProps, q: number) => SideContentProps = (
    props: EditingWorkspaceProps,
    questionId: number
  ) => {
    const assessment = this.state.assessment!;
    let tabs: SideContentTab[];
    if (this.state.editingMode === 'question') {
      const qnType = this.state.assessment!.questions[this.props.questionId].type;
      const questionTemplateTab =
        qnType === 'mcq' ? (
          <MCQQuestionTemplateTab
            assessment={assessment}
            questionId={questionId}
            updateAssessment={this.updateEditAssessmentState}
          />
        ) : (
          <ProgrammingQuestionTemplateTab
            assessment={assessment}
            questionId={questionId}
            updateAssessment={this.updateEditAssessmentState}
            editorValue={this.props.editorValue}
            handleEditorValueChange={this.props.handleEditorValueChange}
            handleUpdateWorkspace={this.props.handleUpdateWorkspace}
          />
        );

      tabs = [
        {
          label: `Task ${questionId + 1}`,
          iconName: IconNames.NINJA,
          body: (
            <TextAreaContent
              assessment={assessment}
              path={['questions', questionId, 'content']}
              updateAssessment={this.updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorQuestionOverview,
          toSpawn: () => true
        },
        {
          label: `Question Template`,
          iconName: IconNames.DOCUMENT,
          body: questionTemplateTab,
          id: SideContentType.editorQuestionTemplate,
          toSpawn: () => true
        },
        {
          label: `Manage Local Deployment`,
          iconName: IconNames.HOME,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Question Specific'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['questions', questionId, 'library']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorLocalDeployment,
          toSpawn: () => true
        },
        {
          label: `Manage Local Grader Deployment`,
          iconName: IconNames.CONFIRM,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Question Specific Grader'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['questions', questionId, 'graderLibrary']}
              pathToCopy={['questions', questionId, 'library']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorLocalGraderDeployment,
          toSpawn: () => true
        },
        {
          label: `Grading`,
          iconName: IconNames.TICK,
          body: (
            <GradingTab
              assessment={assessment}
              path={['questions', questionId]}
              updateAssessment={this.updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorGrading,
          toSpawn: () => true
        }
      ];
      if (qnType === 'programming') {
        tabs.push({
          label: `Autograder`,
          iconName: IconNames.AIRPLANE,
          body: (
            <AutograderTab
              assessment={assessment}
              questionId={questionId}
              handleTestcaseEval={this.handleTestcaseEval}
              updateAssessment={this.updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorAutograder,
          toSpawn: () => true
        });
      }
      const functionsAttached = assessment!.globalDeployment!.external.symbols;
      if (functionsAttached.includes('get_matrix')) {
        tabs.push({
          label: `Tone Matrix`,
          iconName: IconNames.GRID_VIEW,
          body: <SideContentToneMatrix />,
          id: SideContentType.toneMatrix,
          toSpawn: () => true
        });
      }
    } else {
      tabs = [
        {
          label: `${assessment!.type} Briefing`,
          iconName: IconNames.BRIEFCASE,
          body: (
            <TextAreaContent
              assessment={assessment}
              path={['longSummary']}
              updateAssessment={this.updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorBriefing,
          toSpawn: () => true
        },
        {
          label: `Manage Question`,
          iconName: IconNames.WRENCH,
          body: (
            <ManageQuestionTab
              assessment={assessment}
              hasUnsavedChanges={this.state.hasUnsavedChanges}
              questionId={questionId}
              updateAssessment={this.updateAndSaveAssessment}
            />
          ),
          id: SideContentType.editorManageQuestion,
          toSpawn: () => true
        },
        {
          label: `Manage Global Deployment`,
          iconName: IconNames.GLOBE,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Global'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['globalDeployment']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={false}
            />
          ),
          id: SideContentType.editorGlobalDeployment,
          toSpawn: () => true
        },
        {
          label: `Manage Global Grader Deployment`,
          iconName: IconNames.CONFIRM,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Global Grader'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['graderDeployment']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorGlobalGraderDeployment,
          toSpawn: () => true
        }
      ];
    }

    return { handleActiveTabChange: this.handleActiveTabChange, tabs };
  };

  /** Pre-condition: IAssessment has been loaded */
  private controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = '/mission-control';
    const assessmentWorkspacePath = listingPath + `/${this.state.assessment!.id.toString()}`;
    const questionProgress: [number, number] = [
      questionId + 1,
      this.state.assessment!.questions.length
    ];

    const onClickPrevious = () =>
      history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`);
    const onClickNext = () =>
      history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`);
    const onClickReturn = () => history.push(listingPath);

    const onClickResetTemplate = () => {
      this.setState((currentState: State) => {
        return {
          ...currentState,
          showResetTemplateOverlay: currentState.hasUnsavedChanges
        };
      });
    };

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

    const resetButton = (
      <ControlBarResetButton onClick={onClickResetTemplate} key="reset_template" />
    );

    const runButton = (
      <ControlBarRunButton handleEditorEval={this.props.handleEditorEval} key="run" />
    );

    const saveButton = (
      <ControlButtonSaveButton
        hasUnsavedChanges={this.state.hasUnsavedChanges}
        onClickSave={this.handleSave}
        key="save"
      />
    );

    const toggleEditModeButton = (
      <ControlBarToggleEditModeButton
        editingMode={this.state.editingMode}
        toggleEditMode={this.toggleEditingMode}
        key="toggle_edit_mode"
      />
    );

    return {
      editorButtons: [runButton, saveButton, resetButton],
      flowButtons: [previousButton, questionView, nextButton],
      editingWorkspaceButtons: [toggleEditModeButton]
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
}

function uniq(a: string[]) {
  const seen = {};
  return a.filter(item => (seen.hasOwnProperty(item) ? false : (seen[item] = true)));
}

export default EditingWorkspace;
