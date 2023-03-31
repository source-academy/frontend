import {
  ButtonGroup,
  Classes,
  Dialog,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
import ControlButton from '../ControlButton';
import { AutograderTab } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentAutograderTab';
import DeploymentTab from '../editingWorkspaceSideContent/EditingWorkspaceSideContentDeploymentTab';
import GradingTab from '../editingWorkspaceSideContent/EditingWorkspaceSideContentGradingTab';
import ManageQuestionTab from '../editingWorkspaceSideContent/EditingWorkspaceSideContentManageQuestionTab';
import MCQQuestionTemplateTab from '../editingWorkspaceSideContent/EditingWorkspaceSideContentMcqQuestionTemplateTab';
import ProgrammingQuestionTemplateTab from '../editingWorkspaceSideContent/EditingWorkspaceSideContentProgrammingQuestionTemplateTab';
import { TextAreaContent } from '../editingWorkspaceSideContent/EditingWorkspaceSideContentTextAreaContent';
import { convertEditorTabStateToProps } from '../editor/EditorContainer';
import { Position } from '../editor/EditorTypes';
import Markdown from '../Markdown';
import { SideContentProps } from '../sideContent/SideContent';
import SideContentToneMatrix from '../sideContent/SideContentToneMatrix';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import { history } from '../utils/HistoryHelper';
import { useTypedSelector } from '../utils/Hooks';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import { removeEditorTab, updateActiveEditorTabIndex } from '../workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../workspace/WorkspaceTypes';
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
  handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => void;
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

const workspaceLocation: WorkspaceLocation = 'assessment';

const EditingWorkspace: React.FC<EditingWorkspaceProps> = props => {
  const [assessment, setAssessment] = useState(retrieveLocalAssessment());
  const [editingMode, setEditingMode] = useState('question');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = useState(false);
  const [originalMaxXp, setOriginalMaxXp] = useState(0);
  const dispatch = useDispatch();

  const { isFolderModeEnabled, activeEditorTabIndex, editorTabs } = useTypedSelector(
    store => store.workspaces[workspaceLocation]
  );

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  useEffect(() => {
    if (assessment) {
      resetWorkspaceValues();
      setOriginalMaxXp(getMaxXp());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  useEffect(() => checkWorkspaceReset());

  const setActiveEditorTabIndex = React.useCallback(
    (activeEditorTabIndex: number | null) =>
      dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
    [dispatch]
  );
  const removeEditorTabByIndex = React.useCallback(
    (editorTabIndex: number) => dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
    [dispatch]
  );

  const { handleEditorValueChange } = props;
  // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
  const handleFirstEditorValueChange = React.useCallback(
    (newEditorValue: string) => handleEditorValueChange(0, newEditorValue),
    [handleEditorValueChange]
  );

  if (assessment === null || assessment!.questions.length === 0) {
    return (
      <NonIdealState
        className={classNames('WorkspaceParent', Classes.DARK)}
        description="Getting mission ready..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
      />
    );
  }

  /* If questionId is out of bounds, set it within range. */
  const formatedQuestionId = () => {
    let questionId = props.questionId;
    if (questionId < 0) {
      questionId = 0;
    } else if (questionId >= assessment!.questions.length) {
      questionId = assessment!.questions.length - 1;
    }
    return questionId;
  };

  /**
   * Resets to last save.
   */
  const resetTemplateOverlay = () => (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={showResetTemplateOverlay}
      title="Confirmation: Reset editor?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to reset to your last save?" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          <ControlButton
            label="Cancel"
            onClick={() => setShowResetTemplateOverlay(false)}
            options={{ minimal: false }}
          />
          <ControlButton
            label="Confirm"
            onClick={() => {
              const assessment = retrieveLocalAssessment()!;
              setAssessment(assessment);
              setHasUnsavedChanges(false);
              setShowResetTemplateOverlay(false);
              setOriginalMaxXp(getMaxXp());
              handleRefreshLibrary();
              resetWorkspaceValues();
            }}
            options={{ minimal: false, intent: Intent.DANGER }}
          />
        </ButtonGroup>
      </div>
    </Dialog>
  );

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  function checkWorkspaceReset() {
    /* Don't reset workspace if assessment not fetched yet. */
    if (assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/
    const assessmentId = -1;
    const questionId = formatedQuestionId();

    if (props.storedAssessmentId !== assessmentId || props.storedQuestionId !== questionId) {
      resetWorkspaceValues();
      props.handleUpdateCurrentAssessmentId(assessmentId, questionId);
      props.handleUpdateHasUnsavedChanges(false);
      if (hasUnsavedChanges) {
        setAssessment(retrieveLocalAssessment());
        setHasUnsavedChanges(false);
      }
      handleRefreshLibrary();
    }
  }

  const handleRefreshLibrary = (library: Library | undefined = undefined) => {
    const question = assessment!.questions[formatedQuestionId()];
    if (!library) {
      library = question.library.chapter === -1 ? assessment!.globalDeployment! : question.library;
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
    props.handleClearContext(library, true);
  };

  const resetWorkspaceValues = () => {
    const question: Question = assessment!.questions[formatedQuestionId()];
    let editorValue: string;
    let programPrependValue = '';
    let programPostpendValue = '';
    if (question.type === QuestionTypes.programming) {
      if (question.editorValue) {
        editorValue = question.editorValue;
      } else {
        editorValue = (question as IProgrammingQuestion).solutionTemplate as string;
      }
      programPrependValue = (question as IProgrammingQuestion).prepend;
      programPostpendValue = (question as IProgrammingQuestion).postpend;
    } else {
      editorValue = '//If you see this, this is a bug. Please report bug.';
    }

    props.handleResetWorkspace({
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorTabs: [
        {
          value: editorValue,
          highlightedLines: [],
          breakpoints: []
        }
      ],
      programPrependValue,
      programPostpendValue
    });
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorValueChange(0, editorValue);
  };

  const handleTestcaseEval = (testcase: Testcase) => {
    const editorTestcases = [testcase];
    props.handleUpdateWorkspace({ editorTestcases });
    props.handleTestcaseEval(0);
  };

  const handleSave = () => {
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    assessment!.questions[formatedQuestionId()].editorValue = editorTabs[0].value;
    setAssessment(assessment);
    setHasUnsavedChanges(false);
    storeLocalAssessment(assessment);
    // this.handleRefreshLibrary();
    handleSaveXp();
  };

  const handleSaveXp = () => {
    const curXp = getMaxXp();
    const changeXp = curXp - originalMaxXp;
    if (changeXp !== 0) {
      const overview = props.assessmentOverview;
      if (changeXp !== 0) {
        overview.maxXp = curXp;
      }
      setOriginalMaxXp(curXp);
      props.updateAssessmentOverview(overview);
      storeLocalAssessmentOverview(overview);
    }
  };

  const getMaxXp = () => {
    let xp = 0;
    const questions = assessment!.questions;
    for (const question of questions) {
      xp += question.maxXp;
    }
    return xp as number;
  };
  const updateEditAssessmentState = (assessmentVal: Assessment) => {
    setAssessment(assessmentVal);
    setHasUnsavedChanges(true);
  };

  const updateAndSaveAssessment = (assessmentVal: Assessment) => {
    setAssessment(assessmentVal);
    handleRefreshLibrary();
    handleSave();
    resetWorkspaceValues();
  };

  const toggleEditingMode = () => {
    const toggle = editingMode === 'question' ? 'global' : 'question';
    setEditingMode(toggle);
  };

  /** Pre-condition: IAssessment has been loaded */
  const sideContentProps: (p: EditingWorkspaceProps, q: number) => SideContentProps = (
    props: EditingWorkspaceProps,
    questionId: number
  ) => {
    const currentAssessment = assessment!;
    let tabs: SideContentTab[];
    if (editingMode === 'question') {
      const qnType = currentAssessment!.questions[props.questionId].type;
      const questionTemplateTab =
        qnType === 'mcq' ? (
          <MCQQuestionTemplateTab
            assessment={currentAssessment}
            questionId={questionId}
            updateAssessment={updateEditAssessmentState}
          />
        ) : (
          <ProgrammingQuestionTemplateTab
            assessment={currentAssessment}
            questionId={questionId}
            updateAssessment={updateEditAssessmentState}
            // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
            editorValue={editorTabs[0].value}
            handleEditorValueChange={handleFirstEditorValueChange}
            handleUpdateWorkspace={props.handleUpdateWorkspace}
          />
        );

      tabs = [
        {
          label: `Question ${questionId + 1}`,
          iconName: IconNames.NINJA,
          body: (
            <TextAreaContent
              assessment={currentAssessment}
              path={['questions', questionId, 'content']}
              updateAssessment={updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorQuestionOverview
        },
        {
          label: `Question Template`,
          iconName: IconNames.DOCUMENT,
          body: questionTemplateTab,
          id: SideContentType.editorQuestionTemplate
        },
        {
          label: `Manage Local Deployment`,
          iconName: IconNames.HOME,
          body: (
            <DeploymentTab
              assessment={currentAssessment}
              label={'Question Specific'}
              handleRefreshLibrary={handleRefreshLibrary}
              pathToLibrary={['questions', questionId, 'library']}
              updateAssessment={updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorLocalDeployment
        },
        {
          label: `Manage Local Grader Deployment`,
          iconName: IconNames.CONFIRM,
          body: (
            <DeploymentTab
              assessment={currentAssessment}
              label={'Question Specific Grader'}
              handleRefreshLibrary={handleRefreshLibrary}
              pathToLibrary={['questions', questionId, 'graderLibrary']}
              pathToCopy={['questions', questionId, 'library']}
              updateAssessment={updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorLocalGraderDeployment
        },
        {
          label: `Grading`,
          iconName: IconNames.TICK,
          body: (
            <GradingTab
              assessment={currentAssessment}
              path={['questions', questionId]}
              updateAssessment={updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorGrading
        }
      ];
      if (qnType === 'programming') {
        tabs.push({
          label: `Autograder`,
          iconName: IconNames.AIRPLANE,
          body: (
            <AutograderTab
              assessment={currentAssessment}
              questionId={questionId}
              handleTestcaseEval={handleTestcaseEval}
              updateAssessment={updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorAutograder
        });
      }
      const functionsAttached = currentAssessment!.globalDeployment!.external.symbols;
      if (functionsAttached.includes('get_matrix')) {
        tabs.push({
          label: `Tone Matrix`,
          iconName: IconNames.GRID_VIEW,
          body: <SideContentToneMatrix />,
          id: SideContentType.toneMatrix
        });
      }
    } else {
      tabs = [
        {
          label: `${currentAssessment!.type} Briefing`,
          iconName: IconNames.BRIEFCASE,
          body: (
            <TextAreaContent
              assessment={currentAssessment}
              path={['longSummary']}
              updateAssessment={updateEditAssessmentState}
            />
          ),
          id: SideContentType.editorBriefing
        },
        {
          label: `Manage Question`,
          iconName: IconNames.WRENCH,
          body: (
            <ManageQuestionTab
              assessment={currentAssessment}
              hasUnsavedChanges={hasUnsavedChanges}
              questionId={questionId}
              updateAssessment={updateAndSaveAssessment}
            />
          ),
          id: SideContentType.editorManageQuestion
        },
        {
          label: `Manage Global Deployment`,
          iconName: IconNames.GLOBE,
          body: (
            <DeploymentTab
              assessment={currentAssessment}
              label={'Global'}
              handleRefreshLibrary={handleRefreshLibrary}
              pathToLibrary={['globalDeployment']}
              updateAssessment={updateEditAssessmentState}
              isOptionalDeployment={false}
            />
          ),
          id: SideContentType.editorGlobalDeployment
        },
        {
          label: `Manage Global Grader Deployment`,
          iconName: IconNames.CONFIRM,
          body: (
            <DeploymentTab
              assessment={currentAssessment}
              label={'Global Grader'}
              handleRefreshLibrary={handleRefreshLibrary}
              pathToLibrary={['graderDeployment']}
              updateAssessment={updateEditAssessmentState}
              isOptionalDeployment={true}
            />
          ),
          id: SideContentType.editorGlobalGraderDeployment
        }
      ];
    }

    return {
      tabs: { beforeDynamicTabs: tabs, afterDynamicTabs: [] }
    };
  };

  /** Pre-condition: IAssessment has been loaded */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = '/mission-control';
    const assessmentWorkspacePath = listingPath + `/${assessment!.id.toString()}`;
    const questionProgress: [number, number] = [questionId + 1, assessment!.questions.length];

    const onClickPrevious = () =>
      history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`);
    const onClickNext = () =>
      history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`);
    const onClickReturn = () => history.push(listingPath);

    const onClickResetTemplate = () => {
      setShowResetTemplateOverlay(() => hasUnsavedChanges);
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
      <ControlBarRunButton
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        handleEditorEval={props.handleEditorEval}
        key="run"
      />
    );

    const saveButton = (
      <ControlButtonSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onClickSave={handleSave}
        key="save"
      />
    );

    const toggleEditModeButton = (
      <ControlBarToggleEditModeButton
        editingMode={editingMode}
        toggleEditMode={toggleEditingMode}
        key="toggle_edit_mode"
      />
    );

    return {
      editorButtons: [runButton, saveButton, resetButton],
      flowButtons: [previousButton, questionView, nextButton],
      editingWorkspaceButtons: [toggleEditModeButton]
    };
  };

  function replButtons() {
    const clearButton = (
      <ControlBarClearButton handleReplOutputClear={props.handleReplOutputClear} key="clear_repl" />
    );

    const evalButton = (
      <ControlBarEvalButton
        handleReplEval={props.handleReplEval}
        isRunning={props.isRunning}
        key="eval_repl"
      />
    );

    return [evalButton, clearButton];
  }

  const questionId = formatedQuestionId();
  const question: Question = assessment.questions[questionId];

  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps:
      question.type === QuestionTypes.programming
        ? {
            editorVariant: 'normal',
            isFolderModeEnabled,
            activeEditorTabIndex,
            setActiveEditorTabIndex,
            removeEditorTabByIndex,
            editorTabs: editorTabs
              .map(convertEditorTabStateToProps)
              .map((editorTabStateProps, index) => {
                // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
                //       Specifically, need to update questions such that they can span multiple files.
                if (index !== 0) {
                  return editorTabStateProps;
                }
                return {
                  ...editorTabStateProps,
                  editorValue:
                    editorTabStateProps.editorValue ||
                    question.editorValue ||
                    (question as IProgrammingQuestion).solutionTemplate
                };
              }),
            editorSessionId: '',
            handleDeclarationNavigate: props.handleDeclarationNavigate,
            handleEditorEval: props.handleEditorEval,
            handleEditorValueChange: props.handleEditorValueChange,
            handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints,
            handleUpdateHasUnsavedChanges: props.handleUpdateHasUnsavedChanges,
            handlePromptAutocomplete: props.handlePromptAutocomplete,
            isEditorAutorun: false
          }
        : undefined,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: {
      mcq: question as IMCQQuestion,
      handleMCQSubmit: (option: number) =>
        props.handleSave(assessment!.questions[questionId].id, option)
    },
    sideBarProps: {
      tabs: []
    },
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props, questionId),
    replProps: {
      handleBrowseHistoryDown: props.handleBrowseHistoryDown,
      handleBrowseHistoryUp: props.handleBrowseHistoryUp,
      handleReplEval: props.handleReplEval,
      handleReplValueChange: props.handleReplValueChange,
      output: props.output,
      replValue: props.replValue,
      sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
      sourceVariant: Variant.DEFAULT,
      externalLibrary: question?.library?.external?.name || 'NONE',
      replButtons: replButtons()
    }
  };
  return (
    <div className={classNames('WorkspaceParent', Classes.DARK)}>
      {resetTemplateOverlay()}
      <Workspace {...workspaceProps} />
    </div>
  );
};

function uniq(a: string[]) {
  const seen = {};
  return a.filter(item => (seen.hasOwnProperty(item) ? false : (seen[item] = true)));
}

export default EditingWorkspace;
