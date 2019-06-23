import { ButtonGroup, Classes, Dialog, Intent, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { InterpreterOutput, IWorkspaceState } from '../../reducers/states';
import { history } from '../../utils/history';
import {
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion,
  ITestcase,
  Library,
  QuestionTypes
} from '../assessment/assessmentShape';
import { controlButton } from '../commons';
import Markdown from '../commons/Markdown';
import Workspace, { WorkspaceProps } from '../workspace';
import { ControlBarProps } from '../workspace/ControlBar';
import { SideContentProps } from '../workspace/side-content';
import ToneMatrix from '../workspace/side-content/ToneMatrix';
import {
  AutograderTab,
  DeploymentTab,
  GradingTab,
  ManageQuestionTab,
  MCQQuestionTemplateTab,
  ProgrammingQuestionTemplateTab,
  TextareaContentTab
} from './editingWorkspaceSideContent';
import {
  retrieveLocalAssessment,
  storeLocalAssessment,
  storeLocalAssessmentOverview
} from './xmlParseHelper';

export type AssessmentWorkspaceProps = DispatchProps & OwnProps & StateProps;

export type StateProps = {
  activeTab: number;
  editorHeight?: number;
  editorValue: string | null;
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
  assessmentOverview: IAssessmentOverview;
  updateAssessmentOverview: (overview: IAssessmentOverview) => void;
  notAttempted: boolean;
  closeDate: string;
};

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
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
  handleUpdateWorkspace: (options: Partial<IWorkspaceState>) => void;
  handleSave: (id: number, answer: number | string) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

interface IState {
  assessment: IAssessment | null;
  activeTab: number;
  editingMode: string;
  hasUnsavedChanges: boolean;
  showResetTemplateOverlay: boolean;
  originalMaxGrade: number;
  originalMaxXp: number;
}

class AssessmentWorkspace extends React.Component<AssessmentWorkspaceProps, IState> {
  public constructor(props: AssessmentWorkspaceProps) {
    super(props);
    this.state = {
      assessment: retrieveLocalAssessment(),
      activeTab: 0,
      editingMode: 'question',
      hasUnsavedChanges: false,
      showResetTemplateOverlay: false,
      originalMaxGrade: 0,
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
        originalMaxGrade: this.getMaxMarks('maxGrade'),
        originalMaxXp: this.getMaxMarks('maxXp')
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
          className="WorkspaceParent pt-dark"
          description="Getting mission ready..."
          visual={<Spinner large={true} />}
        />
      );
    }

    const questionId = this.formatedQuestionId();
    const question: IQuestion = this.state.assessment.questions[questionId];
    const workspaceProps: WorkspaceProps = {
      controlBarProps: this.controlBarProps(this.props, questionId),
      editorProps:
        question.type === QuestionTypes.programming
          ? {
              editorPrepend: '',
              editorPrependLines: 0,
              editorSessionId: '',
              editorValue:
                this.props.editorValue ||
                question.editorValue ||
                (question as IProgrammingQuestion).solutionTemplate,
              handleEditorEval: this.props.handleEditorEval,
              handleEditorValueChange: this.props.handleEditorValueChange,
              breakpoints: this.props.breakpoints,
              highlightedLines: this.props.highlightedLines,
              handleEditorUpdateBreakpoints: this.props.handleEditorUpdateBreakpoints,
              handleUpdateHasUnsavedChanges: this.props.handleUpdateHasUnsavedChanges,
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
        replValue: this.props.replValue
      }
    };
    return (
      <div className="WorkspaceParent pt-dark">
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
      isCloseButtonShown={false}
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
                originalMaxGrade: this.getMaxMarks('maxGrade'),
                originalMaxXp: this.getMaxMarks('maxXp')
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
  private checkWorkspaceReset(props: AssessmentWorkspaceProps) {
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
    this.props.handleClearContext(library);
  };

  private resetWorkspaceValues = () => {
    const question: IQuestion = this.state.assessment!.questions[this.formatedQuestionId()];
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

  private handleTestcaseEval = (testcase: ITestcase) => {
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
    this.handleSaveGradeAndXp();
  };

  private handleSaveGradeAndXp = () => {
    const curGrade = this.getMaxMarks('maxGrade');
    const changeGrade = curGrade - this.state.originalMaxGrade;
    const curXp = this.getMaxMarks('maxXp');
    const changeXp = curXp - this.state.originalMaxXp;
    if (changeGrade !== 0 || changeXp !== 0) {
      const overview = this.props.assessmentOverview;
      if (changeGrade !== 0) {
        overview.maxGrade = curGrade;
      }
      if (changeXp !== 0) {
        overview.maxXp = curXp;
      }
      this.setState({
        originalMaxGrade: curGrade,
        originalMaxXp: curXp
      });
      this.props.updateAssessmentOverview(overview);
      storeLocalAssessmentOverview(overview);
    }
  };

  private getMaxMarks = (field: string) => {
    let result = 0;
    const questions = this.state.assessment!.questions;
    for (const question of questions) {
      result += question[field];
    }
    return result as number;
  };
  private updateEditAssessmentState = (assessmentVal: IAssessment) => {
    this.setState({
      assessment: assessmentVal,
      hasUnsavedChanges: true
    });
  };

  private updateAndSaveAssessment = (assessmentVal: IAssessment) => {
    this.setState({
      assessment: assessmentVal
    });
    this.handleRefreshLibrary();
    this.handleSave();
    this.resetWorkspaceValues();
  };

  private handleChangeActiveTab = (tab: number) => {
    this.setState({
      activeTab: tab
    });
  };

  private toggleEditingMode = () => {
    const toggle = this.state.editingMode === 'question' ? 'global' : 'question';
    this.setState({
      activeTab: 0,
      editingMode: toggle
    });
  };

  /** Pre-condition: IAssessment has been loaded */
  private sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const assessment = this.state.assessment!;
    let tabs;
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
          icon: IconNames.NINJA,
          body: (
            <TextareaContentTab
              assessment={assessment}
              path={['questions', questionId, 'content']}
              updateAssessment={this.updateEditAssessmentState}
            />
          )
        },
        {
          label: `Question Template`,
          icon: IconNames.DOCUMENT,
          body: questionTemplateTab
        },
        {
          label: `Manage Local Deployment`,
          icon: IconNames.HOME,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Question Specific'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['questions', questionId, 'library']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          )
        },
        {
          label: `Manage Local Grader Deployment`,
          icon: IconNames.CONFIRM,
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
          )
        },
        {
          label: `Grading`,
          icon: IconNames.TICK,
          body: (
            <GradingTab
              assessment={assessment}
              path={['questions', questionId]}
              updateAssessment={this.updateEditAssessmentState}
            />
          )
        }
      ];
      if (qnType === 'programming') {
        tabs.push({
          label: `Autograder`,
          icon: IconNames.AIRPLANE,
          body: (
            <AutograderTab
              assessment={assessment}
              questionId={questionId}
              handleTestcaseEval={this.handleTestcaseEval}
              updateAssessment={this.updateEditAssessmentState}
            />
          )
        });
      }
      const functionsAttached = assessment!.questions[questionId].library.external.symbols;
      if (functionsAttached.includes('get_matrix')) {
        tabs.push({
          label: `Tone Matrix`,
          icon: IconNames.GRID_VIEW,
          body: <ToneMatrix />
        });
      }
    } else {
      tabs = [
        {
          label: `${assessment!.category} Briefing`,
          icon: IconNames.BRIEFCASE,
          body: (
            <TextareaContentTab
              assessment={assessment}
              path={['longSummary']}
              updateAssessment={this.updateEditAssessmentState}
            />
          )
        },
        {
          label: `Manage Question`,
          icon: IconNames.WRENCH,
          body: (
            <ManageQuestionTab
              assessment={assessment}
              hasUnsavedChanges={this.state.hasUnsavedChanges}
              questionId={questionId}
              updateAssessment={this.updateAndSaveAssessment}
            />
          )
        },
        {
          label: `Manage Global Deployment`,
          icon: IconNames.GLOBE,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Global'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['globalDeployment']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={false}
            />
          )
        },
        {
          label: `Manage Global Grader Deployment`,
          icon: IconNames.CONFIRM,
          body: (
            <DeploymentTab
              assessment={assessment}
              label={'Global Grader'}
              handleRefreshLibrary={this.handleRefreshLibrary}
              pathToLibrary={['graderDeployment']}
              updateAssessment={this.updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          )
        }
      ];
    }

    return {
      activeTab: this.state.activeTab,
      handleChangeActiveTab: this.handleChangeActiveTab,
      tabs
    };
  };

  /** Pre-condition: IAssessment has been loaded */
  private controlBarProps: (p: AssessmentWorkspaceProps, q: number) => ControlBarProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const listingPath = '/mission-control';
    const assessmentWorkspacePath = listingPath + `/${this.state.assessment!.id.toString()}`;
    return {
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
      hasSaveButton: true,
      hasShareButton: false,
      isRunning: this.props.isRunning,
      isDebugging: this.props.isDebugging,
      enableDebugging: this.props.enableDebugging,
      onClickNext: () => history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`),
      onClickPrevious: () =>
        history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`),
      onClickReturn: () => history.push(listingPath),
      onClickSave: this.handleSave,
      onClickResetTemplate: () => {
        this.setState({ showResetTemplateOverlay: this.state.hasUnsavedChanges });
      },
      questionProgress: [questionId + 1, this.state.assessment!.questions.length],
      sourceChapter: this.state.assessment!.questions[questionId].library.chapter,
      editingMode: this.state.editingMode,
      toggleEditMode: this.toggleEditingMode
    };
  };
}

function uniq(a: string[]) {
  const seen = {};
  return a.filter(item => (seen.hasOwnProperty(item) ? false : (seen[item] = true)));
}

export default AssessmentWorkspace;
