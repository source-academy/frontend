import {
  Button,
  Card,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
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
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { onClickProgress } from 'src/features/assessments/AssessmentUtils';
import { mobileOnlyTabIds } from 'src/pages/playground/PlaygroundTabs';

import { initSession, log } from '../../features/eventLogging';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import SessionActions from '../application/actions/SessionActions';
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
import SideContentAutograder from '../sideContent/content/SideContentAutograder';
import SideContentContestLeaderboard from '../sideContent/content/SideContentContestLeaderboard';
import SideContentContestVotingContainer from '../sideContent/content/SideContentContestVotingContainer';
import SideContentToneMatrix from '../sideContent/content/SideContentToneMatrix';
import { SideContentProps } from '../sideContent/SideContent';
import { changeSideContentHeight } from '../sideContent/SideContentActions';
import { useSideContent } from '../sideContent/SideContentHelper';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import { useResponsive, useTypedSelector } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { assertType } from '../utils/TypeHelper';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../workspace/WorkspaceTypes';
import AssessmentWorkspaceGradingResult from './AssessmentWorkspaceGradingResult';

export type AssessmentWorkspaceProps = {
  assessmentId: number;
  needsPassword: boolean;
  questionId: number;
  notAttempted: boolean;
  canSave: boolean;
  assessmentConfiguration: AssessmentConfiguration;
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = props => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const { isMobileBreakpoint } = useResponsive();

  const assessment = useTypedSelector(state => state.session.assessments[props.assessmentId]);
  const assessmentOverviews = useTypedSelector(state => state.session.assessmentOverviews);
  const teamFormationOverview = useTypedSelector(state => state.session.teamFormationOverview);
  const assessmentOverview = assessmentOverviews?.find(assessmentOverview => {
    return assessmentOverview.id === assessment?.id;
  });
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
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
    currentAssessment: storedAssessmentId,
    currentQuestion: storedQuestionId
  } = useTypedSelector(store => store.workspaces[workspaceLocation]);

  const dispatch = useDispatch();
  const {
    handleTeamOverviewFetch,
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
    handleCheckLastModifiedAt,
    handleUpdateHasUnsavedChanges,
    handleEnableTokenCounter,
    handleDisableTokenCounter
  } = useMemo(() => {
    return {
      handleTeamOverviewFetch: (assessmentId: number) =>
        dispatch(SessionActions.fetchTeamFormationOverview(assessmentId)),
      handleTestcaseEval: (id: number) =>
        dispatch(WorkspaceActions.evalTestcase(workspaceLocation, id)),
      handleClearContext: (library: Library, shouldInitLibrary: boolean) =>
        dispatch(WorkspaceActions.beginClearContext(workspaceLocation, library, shouldInitLibrary)),
      handleChangeExecTime: (execTimeMs: number) =>
        dispatch(WorkspaceActions.changeExecTime(execTimeMs, workspaceLocation)),
      handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) =>
        dispatch(WorkspaceActions.updateCurrentAssessmentId(assessmentId, questionId)),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        dispatch(WorkspaceActions.resetWorkspace(workspaceLocation, options)),
      handleRunAllTestcases: () => dispatch(WorkspaceActions.runAllTestcases(workspaceLocation)),
      handleEditorEval: () => dispatch(WorkspaceActions.evalEditor(workspaceLocation)),
      handleAssessmentFetch: (assessmentId: number, assessmentPassword?: string) =>
        dispatch(SessionActions.fetchAssessment(assessmentId, assessmentPassword)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(
          WorkspaceActions.updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue)
        ),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        dispatch(
          WorkspaceActions.setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)
        ),
      handleReplEval: () => dispatch(WorkspaceActions.evalRepl(workspaceLocation)),
      handleCheckLastModifiedAt: (id: number, lastModifiedAt: string, saveAnswer: Function) =>
        dispatch(SessionActions.checkAnswerLastModifiedAt(id, lastModifiedAt, saveAnswer)),
      handleSave: (id: number, answer: number | string | ContestEntry[]) =>
        dispatch(SessionActions.submitAnswer(id, answer)),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        dispatch(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges)),
      handleEnableTokenCounter: () =>
        dispatch(WorkspaceActions.enableTokenCounter(workspaceLocation)),
      handleDisableTokenCounter: () =>
        dispatch(WorkspaceActions.disableTokenCounter(workspaceLocation))
    };
  }, [dispatch]);

  useEffect(() => {
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleTeamOverviewFetch(props.assessmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  useEffect(() => {
    let assessmentPassword: string | null = null;
    if (props.needsPassword) {
      // Only need to prompt for password the first time
      // Attempt to load password-protected assessment
      assessmentPassword = window.prompt('Please enter password.', '');
      if (!assessmentPassword) {
        window.history.back();
        return;
      }
    }
    handleAssessmentFetch(props.assessmentId, assessmentPassword || undefined);

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
   * Handles toggling enabling and disabling token counter depending on assessment properties
   */
  useEffect(() => {
    if (assessment?.hasTokenCounter) {
      handleEnableTokenCounter();
    } else {
      handleDisableTokenCounter();
    }
  }, [assessment?.hasTokenCounter, handleEnableTokenCounter, handleDisableTokenCounter]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  useEffect(() => {
    if (!selectedTab) return;

    if (!isMobileBreakpoint && mobileOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.questionOverview);
    }
  }, [isMobileBreakpoint, props, selectedTab, setSelectedTab]);

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
    const isTeamAssessment =
      assessmentOverview !== undefined ? assessmentOverview.maxTeamSize > 1 : false;
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

    if (isTeamAssessment) {
      tabs.push({
        label: `Team`,
        iconName: IconNames.PEOPLE,
        body: (
          <div>
            {teamFormationOverview === undefined ? (
              'You are not assigned to any team!'
            ) : (
              <div>
                Your teammates for this assessment:{' '}
                {teamFormationOverview.studentNames.map((name: string, index: number) => (
                  <span key={index}>
                    {index > 0 ? ', ' : ''}
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      });
    }

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
          label: 'Score Leaderboard',
          iconName: IconNames.CROWN,
          body: (
            <SideContentContestLeaderboard
              handleContestEntryClick={handleContestEntryClick}
              orderedContestEntries={(question as IContestVotingQuestion)?.scoreLeaderboard ?? []}
              leaderboardType={SideContentType.scoreLeaderboard}
            />
          ),
          id: SideContentType.scoreLeaderboard
        },
        {
          label: 'Popular Vote Leaderboard',
          iconName: IconNames.PEOPLE,
          body: (
            <SideContentContestLeaderboard
              handleContestEntryClick={handleContestEntryClick}
              orderedContestEntries={
                (question as IContestVotingQuestion)?.popularVoteLeaderboard ?? []
              }
              leaderboardType={SideContentType.popularVoteLeaderboard}
            />
          ),
          id: SideContentType.popularVoteLeaderboard
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
      workspaceLocation
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

    const onClickSave = () => {
      if (isSaving) return;
      setIsSaving(true);
      checkLastModified();
      setTimeout(() => {
        setIsSaving(false);
      }, 3000);
    };

    const checkLastModified = () => {
      const isTeamAssessment: boolean = assessmentOverview?.maxTeamSize !== 0;
      if (isTeamAssessment && question.type === QuestionTypes.programming) {
        handleCheckLastModifiedAt(question.id, question.lastModifiedAt, saveClick);
      }
    };

    const saveClick = async (modified: boolean) => {
      const isTeamAssessment: boolean = assessmentOverview?.maxTeamSize !== 0;
      if (isTeamAssessment && question.type === QuestionTypes.programming) {
        if (modified) {
          const confirm = await showSimpleConfirmDialog({
            contents: (
              <>
                <p>Save answer?</p>
                <p>Note: The changes made by your teammate will be lost.</p>
              </>
            ),
            positiveIntent: 'danger',
            positiveLabel: 'Save'
          });

          if (!confirm) {
            return;
          }
        }
      }
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      handleSave(question.id, editorTabs[0].value);
      setTimeout(() => {
        handleAssessmentFetch(props.assessmentId);
      }, 1000);
    };

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

    // Define the function to check if the Save button should be disabled
    const shouldDisableSaveButton = (): boolean | undefined => {
      const isIndividualAssessment: boolean = assessmentOverview?.maxTeamSize === 1;
      if (isIndividualAssessment) {
        return false;
      }
      return !teamFormationOverview;
    };

    const saveButton =
      props.canSave && question.type === QuestionTypes.programming ? (
        <ControlButtonSaveButton
          hasUnsavedChanges={hasUnsavedChanges}
          isDisabled={shouldDisableSaveButton()}
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
        handleReplOutputClear={() => dispatch(WorkspaceActions.clearReplOutput(workspaceLocation))}
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
        dispatch(
          WorkspaceActions.updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)
        ),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(WorkspaceActions.removeEditorTab(workspaceLocation, editorTabIndex)),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(WorkspaceActions.navigateToDeclaration(workspaceLocation, cursorPosition)),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(WorkspaceActions.promptAutocomplete(workspaceLocation, row, col, callback))
    };
  }, [dispatch]);

  const replHandlers = useMemo(() => {
    return {
      handleBrowseHistoryDown: () =>
        dispatch(WorkspaceActions.browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () =>
        dispatch(WorkspaceActions.browseReplHistoryUp(workspaceLocation)),
      handleReplValueChange: (newValue: string) =>
        dispatch(WorkspaceActions.updateReplValue(newValue, workspaceLocation))
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
      <DialogBody>
        <Markdown content="Are you sure you want to reset the template?" />
        <Markdown content="*Note this will not affect the saved copy of your program, unless you save over it.*" />
      </DialogBody>
      <DialogFooter
        actions={
          <>
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
          </>
        }
      />
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
          sessionDetails: null,
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
