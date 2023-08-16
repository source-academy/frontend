import {
  Button,
  ButtonGroup,
  Card,
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
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { onClickProgress } from 'src/features/assessments/AssessmentUtils';
import { mobileOnlyTabIds } from 'src/pages/playground/PlaygroundTabs';

import { initSession, log } from '../../features/eventLogging';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { fetchAssessment, submitAnswer } from '../application/actions/SessionActions';
import { defaultWorkspaceManager } from '../application/ApplicationTypes';
import {
  AssessmentConfiguration,
  AutogradingResult,
  ContestEntry,
  IContestVotingQuestion,
  IMCQQuestion,
  IProgrammingQuestion,
  Library,
  QuestionTypes,
  Testcase
} from '../assessment/AssessmentTypes';
import { ControlBarProps } from '../controlBar/ControlBar';
import { ControlBarChapterSelect } from '../controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../controlBar/ControlBarSaveButton';
import ControlButton from '../ControlButton';
import {
  convertEditorTabStateToProps,
  NormalEditorContainerProps
} from '../editor/EditorContainer';
import { Position } from '../editor/EditorTypes';
import Markdown from '../Markdown';
import { MobileSideContentProps } from '../mobileWorkspace/mobileSideContent/MobileSideContent';
import MobileWorkspace, { MobileWorkspaceProps } from '../mobileWorkspace/MobileWorkspace';
import { SideContentProps } from '../sideContent/SideContent';
import SideContentAutograder from '../sideContent/SideContentAutograder';
import SideContentContestLeaderboard from '../sideContent/SideContentContestLeaderboard';
import SideContentContestVotingContainer from '../sideContent/SideContentContestVotingContainer';
import SideContentToneMatrix from '../sideContent/SideContentToneMatrix';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import { useResponsive, useTypedSelector } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { assertType } from '../utils/TypeHelper';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  changeSideContentHeight,
  clearReplOutput,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  resetWorkspace,
  runAllTestcases,
  setEditorBreakpoint,
  updateActiveEditorTabIndex,
  updateCurrentAssessmentId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../workspace/WorkspaceTypes';
import AssessmentWorkspaceGradingResult from './AssessmentWorkspaceGradingResult';
export type AssessmentWorkspaceProps = {
  assessmentId: number;
  questionId: number;
  notAttempted: boolean;
  canSave: boolean;
  assessmentConfiguration: AssessmentConfiguration;
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = props => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const { isMobileBreakpoint } = useResponsive();

  const assessment = useTypedSelector(state => state.session.assessments.get(props.assessmentId));
  const [selectedTab, setSelectedTab] = useState(
    assessment?.questions[props.questionId].grader !== undefined
      ? SideContentType.grading
      : SideContentType.questionOverview
  );

  const navigate = useNavigate();

  const { courseId } = useTypedSelector(state => state.session);
  const {
    isFolderModeEnabled,
    activeEditorTabIndex,
    editorTabs,
    autogradingResults,
    editorTestcases,
    hasUnsavedChanges,
    isRunning,
    output,
    replValue,
    sideContentHeight,
    currentAssessment: storedAssessmentId,
    currentQuestion: storedQuestionId
  } = useTypedSelector(store => store.workspaces[workspaceLocation]);

  const dispatch = useDispatch();
  const {
    handleTestcaseEval,
    handleClearContext,
    handleChangeExecTime,
    handleUpdateCurrentAssessmentId,
    handleResetWorkspace,
    handleRunAllTestcases,
    handleEditorEval,
    handleAssessmentFetch,
    handleEditorValueChange,
    handleEditorUpdateBreakpoints,
    handleReplEval,
    handleSave,
    handleUpdateHasUnsavedChanges
  } = useMemo(() => {
    return {
      handleTestcaseEval: (id: number) => dispatch(evalTestcase(workspaceLocation, id)),
      handleClearContext: (library: Library, shouldInitLibrary: boolean) =>
        dispatch(beginClearContext(workspaceLocation, library, shouldInitLibrary)),
      handleChangeExecTime: (execTimeMs: number) =>
        dispatch(changeExecTime(execTimeMs, workspaceLocation)),
      handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) =>
        dispatch(updateCurrentAssessmentId(assessmentId, questionId)),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        dispatch(resetWorkspace(workspaceLocation, options)),
      handleRunAllTestcases: () => dispatch(runAllTestcases(workspaceLocation)),
      handleEditorEval: () => dispatch(evalEditor(workspaceLocation)),
      handleAssessmentFetch: (assessmentId: number) => dispatch(fetchAssessment(assessmentId)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue)),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        dispatch(setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)),
      handleReplEval: () => dispatch(evalRepl(workspaceLocation)),
      handleSave: (id: number, answer: number | string | ContestEntry[]) =>
        dispatch(submitAnswer(id, answer)),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        dispatch(updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges))
    };
  }, [dispatch]);

  useEffect(() => {
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  useEffect(() => {
    handleAssessmentFetch(props.assessmentId);

    if (props.questionId === 0 && props.notAttempted) {
      setShowOverlay(true);
    }
    if (!assessment) {
      return;
    }
    // ------------- PLEASE NOTE, EVERYTHING BELOW THIS SEEMS TO BE UNUSED -------------
    // checkWorkspaceReset does exactly the same thing.
    let questionId = props.questionId;
    if (props.questionId >= assessment.questions.length) {
      questionId = assessment.questions.length - 1;
    }

    const question = assessment.questions[questionId];

    let answer = '';
    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = (question as IProgrammingQuestion).answer as string;
      } else {
        answer = (question as IProgrammingQuestion).solutionTemplate;
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  useEffect(() => {
    checkWorkspaceReset();
  });

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  useEffect(() => {
    if (!isMobileBreakpoint && mobileOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.questionOverview);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  /* ==================
     onChange handlers
     ================== */
  const pushLog = useCallback((newInput: Input) => log(sessionId, newInput), [sessionId]);

  const onChangeMethod = (newCode: string, delta: CodeDelta) => {
    handleUpdateHasUnsavedChanges?.(true);
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, newCode);

    const input: Input = {
      time: Date.now(),
      type: 'codeDelta',
      data: delta
    };
    pushLog(input);
  };

  const onCursorChangeMethod = (selection: any) => {
    const input: Input = {
      time: Date.now(),
      type: 'cursorPositionChange',
      data: selection.getCursor()
    };
    pushLog(input);
  };

  const onSelectionChangeMethod = (selection: any) => {
    const range: SelectionRange = selection.getRange();
    const isBackwards: boolean = selection.isBackwards();
    if (!isEqual(range.start, range.end)) {
      const input: Input = {
        time: Date.now(),
        type: 'selectionRangeData',
        data: { range, isBackwards }
      };
      pushLog(input);
    }
  };

  /**
   * handleEval used in both the Run button, and during 'shift-enter' in AceEditor
   *
   * However, AceEditor only binds commands on mount (https://github.com/securingsincity/react-ace/issues/684)
   * Thus, we use a mutable ref to overcome the stale closure problem
   */
  const activeTab = useRef(selectedTab);
  activeTab.current = selectedTab;
  const handleEval = useCallback(() => {
    // Run testcases when the autograder tab is selected
    if (activeTab.current === SideContentType.autograder) {
      handleRunAllTestcases();
    } else {
      handleEditorEval();
    }

    const input: Input = {
      time: Date.now(),
      type: 'keyboardCommand',
      data: KeyboardCommand.run
    };
    pushLog(input);
  }, [handleEditorEval, handleRunAllTestcases, pushLog]);

  /* ================
     Helper Functions
     ================ */
  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  const checkWorkspaceReset = () => {
    /* Don't reset workspace if assessment not fetched yet. */
    if (assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/
    const { assessmentId, questionId } = props;
    if (storedAssessmentId === assessmentId && storedQuestionId === questionId) {
      return;
    }

    const question = assessment.questions[questionId];

    const options: {
      autogradingResults?: AutogradingResult[];
      editorValue?: string;
      programPrependValue?: string;
      programPostpendValue?: string;
      editorTestcases?: Testcase[];
    } = {};

    switch (question.type) {
      case QuestionTypes.programming:
        const programmingQuestionData: IProgrammingQuestion = question;
        options.autogradingResults = programmingQuestionData.autogradingResults;
        options.programPrependValue = programmingQuestionData.prepend;
        options.programPostpendValue = programmingQuestionData.postpend;
        options.editorTestcases = programmingQuestionData.testcases;

        // We use || not ?? to match both null and an empty string
        options.editorValue =
          programmingQuestionData.answer || programmingQuestionData.solutionTemplate;
        // Initialize session once the editorValue is known.
        if (!sessionId) {
          setSessionId(
            initSession(`${(assessment as any).number}/${props.questionId}`, {
              chapter: question.library.chapter,
              externalLibrary: question?.library?.external?.name || 'NONE',
              editorValue: options.editorValue
            })
          );
        }
        break;
      case QuestionTypes.voting:
        const votingQuestionData: IContestVotingQuestion = question;
        options.programPrependValue = votingQuestionData.prepend;
        options.programPostpendValue = votingQuestionData.postpend;
        break;
      case QuestionTypes.mcq:
        // Do nothing
        break;
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorUpdateBreakpoints(0, []);
    handleUpdateCurrentAssessmentId(assessmentId, questionId);
    const resetWorkspaceOptions = assertType<WorkspaceState>()({
      autogradingResults: options.autogradingResults ?? [],
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorTabs: [{ value: options.editorValue ?? '', highlightedLines: [], breakpoints: [] }],
      programPrependValue: options.programPrependValue ?? '',
      programPostpendValue: options.programPostpendValue ?? '',
      editorTestcases: options.editorTestcases ?? []
    });
    handleResetWorkspace(resetWorkspaceOptions);
    handleChangeExecTime(
      question.library.execTimeMs ?? defaultWorkspaceManager.assessment.execTime
    );
    handleClearContext(question.library, true);
    handleUpdateHasUnsavedChanges(false);
    if (options.editorValue) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange(0, options.editorValue);
    }
  };

  /**
   * sideContentProps() will only be called when assessment is not undefined
   * (see 'Rendering Logic' below), thus it is okay to use assessment!
   */
  const sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const question = assessment!.questions[questionId];
    const isGraded = question.grader !== undefined;
    const isContestVoting = question?.type === QuestionTypes.voting;
    const handleContestEntryClick = (_submissionId: number, answer: string) => {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange(0, answer);
    };

    const tabs: SideContentTab[] = [
      {
        label: `Question ${questionId + 1}`,
        iconName: IconNames.NINJA,
        body: <Markdown content={question.content} />,
        id: SideContentType.questionOverview
      }
    ];

    if (isContestVoting) {
      tabs.push(
        {
          label: `Contest Voting Briefing`,
          iconName: IconNames.BRIEFCASE,
          body: <Markdown content={assessment!.longSummary} />,
          id: SideContentType.briefing
        },
        {
          label: 'Contest Voting',
          iconName: IconNames.NEW_LAYERS,
          body: (
            <SideContentContestVotingContainer
              canSave={props.canSave}
              handleSave={votingSubmission =>
                handleSave((question as IContestVotingQuestion).id, votingSubmission)
              }
              handleContestEntryClick={handleContestEntryClick}
              contestEntries={(question as IContestVotingQuestion)?.contestEntries ?? []}
            />
          ),
          id: SideContentType.contestVoting
        },
        {
          label: 'Contest Leaderboard',
          iconName: IconNames.CROWN,
          body: (
            <SideContentContestLeaderboard
              handleContestEntryClick={handleContestEntryClick}
              orderedContestEntries={(question as IContestVotingQuestion)?.contestLeaderboard ?? []}
            />
          ),
          id: SideContentType.contestLeaderboard
        }
      );
    } else {
      tabs.push(
        {
          label: `Briefing`,
          iconName: IconNames.BRIEFCASE,
          body: <Markdown className="sidecontent-overview" content={assessment!.longSummary} />,
          id: SideContentType.briefing
        },
        {
          label: `Autograder`,
          iconName: IconNames.AIRPLANE,
          body: (
            <SideContentAutograder
              testcases={editorTestcases}
              autogradingResults={
                // Display autograding results if assessment has been graded by an avenger, OR does not need to be manually graded
                isGraded || !props.assessmentConfiguration.isManuallyGraded
                  ? autogradingResults
                  : []
              }
              handleTestcaseEval={handleTestcaseEval}
              workspaceLocation="assessment"
            />
          ),
          id: SideContentType.autograder
        }
      );
    }

    if (isGraded) {
      tabs.push({
        label: `Report Card`,
        iconName: IconNames.TICK,
        body: (
          <AssessmentWorkspaceGradingResult
            graderName={question.grader!.name}
            gradedAt={question.gradedAt!}
            xp={question.xp}
            maxXp={question.maxXp}
            comments={question.comments}
          />
        ),
        id: SideContentType.grading
      });
    }

    const externalLibrary = question.library.external;
    const functionsAttached = externalLibrary.symbols;
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        iconName: IconNames.GRID_VIEW,
        body: <SideContentToneMatrix />,
        id: SideContentType.toneMatrix
      });
    }

    const onChangeTabs = (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }
      setSelectedTab(newTabId);
    };

    return {
      selectedTabId: selectedTab,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      onChange: onChangeTabs,
      workspaceLocation: workspaceLocation
    };
  };

  /**
   * controlBarProps() will only be called when assessment is not undefined
   * (see 'Rendering Logic' below), thus it is okay to use assessment!
   */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${courseId}/${assessmentTypeLink(assessment!.type)}`;
    const assessmentWorkspacePath = listingPath + `/${assessment!.id.toString()}`;

    const questions = assessment!.questions;
    const question = questions[questionId];
    const questionProgress: [number, number] = [questionId + 1, questions.length];

    const onClickPrevious = () => {
      navigate(assessmentWorkspacePath + `/${(questionId - 1).toString()}`);
      setSelectedTab(SideContentType.questionOverview);
    };
    const onClickNext = () => {
      navigate(assessmentWorkspacePath + `/${(questionId + 1).toString()}`);
      setSelectedTab(SideContentType.questionOverview);
    };
    const onClickReturn = () => navigate(listingPath);

    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    const onClickSave = () => handleSave(question.id, editorTabs[0].value);

    const onClickResetTemplate = () => {
      setShowResetTemplateOverlay(true);
    };

    // Perform question blocking - determine the highest question number previously accessed
    // by counting the number of questions that have a non-null answer
    const blockedQuestionId = questions.filter(qn => qn.answer !== null).length - 1;
    const isBlocked = questionId >= blockedQuestionId;
    const nextButton = (
      <ControlBarNextButton
        onClickNext={
          question.blocking
            ? onClickProgress(onClickNext, question, editorTestcases, isBlocked)
            : onClickNext
        }
        onClickReturn={
          question.blocking
            ? onClickProgress(onClickReturn, question, editorTestcases, isBlocked)
            : onClickReturn
        }
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

    const resetButton =
      question.type !== QuestionTypes.mcq ? (
        <ControlBarResetButton onClick={onClickResetTemplate} key="reset_template" />
      ) : null;

    const runButton = (
      <ControlBarRunButton
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        handleEditorEval={handleEval}
        key="run"
      />
    );

    const saveButton =
      props.canSave && question.type === QuestionTypes.programming ? (
        <ControlButtonSaveButton
          hasUnsavedChanges={hasUnsavedChanges}
          onClickSave={onClickSave}
          key="save"
        />
      ) : null;

    const chapterSelect = (
      <ControlBarChapterSelect
        handleChapterSelect={() => {}}
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={question.library.chapter}
        sourceVariant={question.library.variant ?? Constants.defaultSourceVariant}
        disabled
        key="chapter"
      />
    );

    return {
      editorButtons: !isMobileBreakpoint
        ? [runButton, saveButton, resetButton, chapterSelect]
        : [saveButton, resetButton],
      flowButtons: [previousButton, questionView, nextButton]
    };
  };

  const mobileSideContentProps: (q: number) => MobileSideContentProps = (questionId: number) => {
    const onChangeTabs = (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      // Do nothing when clicking the mobile 'Run' tab while on the autograder tab.
      if (
        !(prevTabId === SideContentType.autograder && newTabId === SideContentType.mobileEditorRun)
      ) {
        setSelectedTab(newTabId);
      }
    };

    return {
      mobileControlBarProps: {
        ...controlBarProps(questionId)
      },
      ...sideContentProps(props, questionId),
      onChange: onChangeTabs,
      selectedTabId: selectedTab,
      handleEditorEval: handleEval
    };
  };

  const replButtons = useMemo(() => {
    const clearButton = (
      <ControlBarClearButton
        handleReplOutputClear={() => dispatch(clearReplOutput(workspaceLocation))}
        key="clear_repl"
      />
    );
    const evalButton = (
      <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
    );

    return [evalButton, clearButton];
  }, [dispatch, isRunning, handleReplEval]);

  const editorContainerHandlers = useMemo(() => {
    return {
      setActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(promptAutocomplete(workspaceLocation, row, col, callback))
    };
  }, [dispatch]);

  const replHandlers = useMemo(() => {
    return {
      handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
      handleReplValueChange: (newValue: string) =>
        dispatch(updateReplValue(newValue, workspaceLocation))
    };
  }, [dispatch]);

  const workspaceHandlers = useMemo(() => {
    return {
      handleSideContentHeightChange: (heightChange: number) =>
        dispatch(changeSideContentHeight(heightChange, workspaceLocation))
    };
  }, [dispatch]);

  /* ===============
     Rendering Logic
     =============== */
  if (!assessment?.questions.length) {
    return (
      <NonIdealState
        className={classNames('WorkspaceParent', Classes.DARK)}
        description="Getting mission ready..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
      />
    );
  }

  const overlay = (
    <Dialog className="assessment-briefing" isOpen={showOverlay}>
      <Card>
        <Markdown content={assessment.longSummary} />
        <Button
          className="assessment-briefing-button"
          onClick={() => setShowOverlay(false)}
          text="Continue"
        />
      </Card>
    </Dialog>
  );

  const closeOverlay = () => setShowResetTemplateOverlay(false);
  const resetTemplateOverlay = (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={showResetTemplateOverlay}
      onClose={closeOverlay}
      title="Confirmation: Reset editor?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to reset the template?" />
        <Markdown content="*Note this will not affect the saved copy of your program, unless you save over it.*" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          <ControlButton label="Cancel" onClick={closeOverlay} options={{ minimal: false }} />
          <ControlButton
            label="Confirm"
            onClick={() => {
              closeOverlay();
              // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
              handleEditorValueChange(
                0,
                (assessment!.questions[questionId] as IProgrammingQuestion).solutionTemplate
              );
              handleUpdateHasUnsavedChanges(true);
            }}
            options={{ minimal: false, intent: Intent.DANGER }}
          />
        </ButtonGroup>
      </div>
    </Dialog>
  );

  /* If questionId is out of bounds, set it to the max. */
  const questionId =
    props.questionId >= assessment.questions.length
      ? assessment.questions.length - 1
      : props.questionId;
  const question = assessment.questions[questionId];
  const editorContainerProps: NormalEditorContainerProps | undefined =
    question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
      ? {
          editorVariant: 'normal',
          isFolderModeEnabled,
          activeEditorTabIndex,
          setActiveEditorTabIndex: editorContainerHandlers.setActiveEditorTabIndex,
          removeEditorTabByIndex: editorContainerHandlers.removeEditorTabByIndex,
          editorTabs: editorTabs.map(convertEditorTabStateToProps),
          editorSessionId: '',
          sourceChapter: question.library.chapter || Chapter.SOURCE_4,
          sourceVariant: question.library.variant ?? Variant.DEFAULT,
          externalLibraryName: question.library.external.name || 'NONE',
          handleDeclarationNavigate: editorContainerHandlers.handleDeclarationNavigate,
          handleEditorEval: handleEval,
          handleEditorValueChange: handleEditorValueChange,
          handleUpdateHasUnsavedChanges: handleUpdateHasUnsavedChanges,
          handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints,
          handlePromptAutocomplete: editorContainerHandlers.handlePromptAutocomplete,
          isEditorAutorun: false,
          onChange: onChangeMethod,
          onCursorChange: onCursorChangeMethod,
          onSelectionChange: onSelectionChangeMethod
        }
      : undefined;
  const mcqProps = {
    mcq: question as IMCQQuestion,
    handleMCQSubmit: (option: number) => handleSave(assessment!.questions[questionId].id, option)
  };
  const replProps = {
    handleBrowseHistoryDown: replHandlers.handleBrowseHistoryDown,
    handleBrowseHistoryUp: replHandlers.handleBrowseHistoryUp,
    handleReplEval: handleReplEval,
    handleReplValueChange: replHandlers.handleReplValueChange,
    output: output,
    replValue: replValue,
    sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
    sourceVariant: question.library.variant ?? Variant.DEFAULT,
    externalLibrary: question?.library?.external?.name || 'NONE',
    replButtons: replButtons
  };
  const sideBarProps = {
    tabs: []
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: workspaceHandlers.handleSideContentHeightChange,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    sideBarProps: sideBarProps,
    sideContentHeight: sideContentHeight,
    sideContentProps: sideContentProps(props, questionId),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps: editorContainerProps,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    replProps: replProps,
    sideBarProps: sideBarProps,
    mobileSideContentProps: mobileSideContentProps(questionId)
  };

  return (
    <div className={classNames('WorkspaceParent', Classes.DARK)}>
      {overlay}
      {resetTemplateOverlay}
      {!isMobileBreakpoint ? (
        <Workspace {...workspaceProps} />
      ) : (
        <MobileWorkspace {...mobileWorkspaceProps} />
      )}
    </div>
  );
};

export default AssessmentWorkspace;
