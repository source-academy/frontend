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
import { isEqual, isNull } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { onClickProgress } from 'src/features/assessments/AssessmentUtils';
import { WORKSPACE_BASE_PATHS } from 'src/pages/fileSystem/createInBrowserFileSystem';
import { mobileOnlyTabIds } from 'src/pages/playground/PlaygroundTabs';

import { initSession, log } from '../../features/eventLogging';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import {
  checkAnswerLastModifiedAt,
  fetchAssessment,
  fetchTeamFormationOverview,
  submitAnswer
} from '../application/actions/SessionActions';
import { defaultWorkspaceManager } from '../application/ApplicationTypes';
import {
  AssessmentConfiguration,
  AutogradingResult,
  ContestEntry,
  IContestVotingQuestion,
  IMCQQuestion,
  IProgrammingQuestion,
  Library,
  Question,
  QuestionTypes,
  Testcase
} from '../assessment/AssessmentTypes';
import { ControlBarProps } from '../controlBar/ControlBar';
import { ControlBarChapterSelect } from '../controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../controlBar/ControlBarEvalButton';
// import { ControlBarFileModeButton } from '../controlBar/ControlBarFileModeButton';
import { ControlBarNextButton } from '../controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../controlBar/ControlBarSaveButton';
import { ControlBarToggleFolderModeButton } from '../controlBar/ControlBarToggleFolderModeButton';
import ControlButton from '../ControlButton';
import {
  convertEditorTabStateToProps,
  NormalEditorContainerProps
} from '../editor/EditorContainer';
import { Position } from '../editor/EditorTypes';
import { handleReadFile, overwriteFilesInWorkspace } from '../fileSystem/utils';
import FileSystemView from '../fileSystemView/FileSystemView';
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
import {
  addEditorTab,
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  clearReplOutput,
  disableTokenCounter,
  enableTokenCounter,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  resetWorkspace,
  runAllTestcases,
  setEditorBreakpoint,
  toggleFolderMode,
  updateActiveEditorTabIndex,
  updateCurrentAssessmentId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateTabReadOnly
} from '../workspace/WorkspaceActions';
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

type OptionFileType = {
  answer: string;
  prepend: string;
  postpend: string;
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = props => {
  const { assessmentId, questionId } = props;
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const { isMobileBreakpoint } = useResponsive();
  // isEditable is a placeholder for now. In the future, it should be set to be
  // based on whether it is the actual question being attempted. To enable read-only mode, set isEditable to false.
  const [isEditable, setIsEditable] = useState(true);

  const assessment = useTypedSelector(state => state.session.assessments[props.assessmentId]);
  const assessmentOverviews = useTypedSelector(state => state.session.assessmentOverviews);
  const teamFormationOverview = useTypedSelector(state => state.session.teamFormationOverview);
  const assessmentOverview = assessmentOverviews?.find(assessmentOverview => {
    return assessmentOverview.id === assessment?.id;
  });
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
    assessment?.questions[questionId].grader !== undefined
      ? SideContentType.grading
      : SideContentType.questionOverview
  );

  const navigate = useNavigate();
  const fileSystem = useTypedSelector(state => state.fileSystem.inBrowserFileSystem);

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
        dispatch(fetchTeamFormationOverview(assessmentId)),
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
      handleAssessmentFetch: (assessmentId: number, assessmentPassword?: string) =>
        dispatch(fetchAssessment(assessmentId, assessmentPassword)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue)),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        dispatch(setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)),
      handleReplEval: () => dispatch(evalRepl(workspaceLocation)),
      handleCheckLastModifiedAt: (id: number, lastModifiedAt: string, saveAnswer: Function) =>
        dispatch(checkAnswerLastModifiedAt(id, lastModifiedAt, saveAnswer)),
      handleSave: (id: number, answer: number | string | ContestEntry[]) =>
        dispatch(submitAnswer(id, answer)),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        dispatch(updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges)),
      handleEnableTokenCounter: () => dispatch(enableTokenCounter(workspaceLocation)),
      handleDisableTokenCounter: () => dispatch(disableTokenCounter(workspaceLocation))
    };
  }, [dispatch]);
  const currentQuestionFilePath = `/${workspaceLocation}/${questionId + 1}.js`;

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

    if (questionId === 0 && props.notAttempted) {
      setShowOverlay(true);
    }
    if (!assessment) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isNull(activeEditorTabIndex)) {
      const currentFilePath = editorTabs[activeEditorTabIndex].filePath;
      if (currentFilePath && currentFilePath === `/${workspaceLocation}/${questionId + 1}.js`) {
        setIsEditable(true);
        dispatch(updateTabReadOnly(workspaceLocation, activeEditorTabIndex, false));
        return;
      }
    }
    setIsEditable(false);
    dispatch(updateTabReadOnly(workspaceLocation, activeEditorTabIndex, true));
  }, [activeEditorTabIndex, editorTabs, questionId]);

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

  const onEditorValueChange = React.useCallback(
    (editorTabIndex: number, newEditorValue: string) => {
      if (isEditable) {
        handleEditorValueChange(editorTabIndex, newEditorValue);
      }
    },
    [handleEditorValueChange, isEditable]
  );

  const onChangeMethod = (newCode: string, delta: CodeDelta) => {
    isEditable ? handleUpdateHasUnsavedChanges?.(true) : handleUpdateHasUnsavedChanges?.(false);
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

  /**
   * Rewrites the file with our desired file tree
   * Sets the currentQuestionFilePath to be the current active editor
   */
  const rewriteFilesWithContent = async (
    currentQuestionFilePath: string,
    newFileTree: Record<string, string>
  ) => {
    if (fileSystem) {
      await overwriteFilesInWorkspace(workspaceLocation, fileSystem, newFileTree);
      dispatch(removeEditorTab(workspaceLocation, 0)); // remove the default tab which keeps appearing ;c
      dispatch(
        addEditorTab(
          workspaceLocation,
          currentQuestionFilePath,
          newFileTree[currentQuestionFilePath] ?? ''
        )
      );
      dispatch(updateActiveEditorTabIndex(workspaceLocation, 0));
      dispatch(updateTabReadOnly(workspaceLocation, 0, false));
    }
  };

  /* ================
     Helper Functions
     ================ */
  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  const checkWorkspaceReset = (isReset = false) => {
    /* Don't reset workspace if assessment not fetched yet. */
    if (assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/

    if (storedAssessmentId === assessmentId && storedQuestionId === questionId && !isReset) {
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

    const optionFiles: Record<string, OptionFileType | string> = {};

    switch (question.type) {
      case QuestionTypes.programming:
        const programmingQuestionData: IProgrammingQuestion = question;
        options.autogradingResults = programmingQuestionData.autogradingResults;
        options.programPrependValue = programmingQuestionData.prepend;
        options.programPostpendValue = programmingQuestionData.postpend;
        options.editorTestcases = programmingQuestionData.testcases;

        // We use || not ?? to match both null and an empty string
        // Sets the current active tab to the current "question file" and also force re-writes the file system
        // The leading slash "/" at the front is VERY IMPORTANT! DO NOT DELETE

        // "otherFiles" refers to all other files that have an "answer" record
        const otherFiles: Record<string, string> = {};
        assessment.questions.forEach((question: Question, index) => {
          if (question.type === 'programming') {
            optionFiles[`/${workspaceLocation}/${index + 1}.js`] = {
              answer: question.answer || question.solutionTemplate,
              prepend: question.prepend,
              postpend: question.postpend
            };
          }
          if (question.type === 'programming' && question.answer && index !== questionId) {
            otherFiles[`/${workspaceLocation}/${index + 1}.js`] = question.answer;
          }
        });

        rewriteFilesWithContent(currentQuestionFilePath, {
          [currentQuestionFilePath]: isReset
            ? programmingQuestionData.solutionTemplate
            : programmingQuestionData.answer || programmingQuestionData.solutionTemplate,
          ...otherFiles
        });

        // Initialize session once the editorValue is known.

        if (!sessionId) {
          setSessionId(
            initSession(`${(assessment as any).number}/${props.questionId}`, {
              chapter: question.library.chapter,
              externalLibrary: question?.library?.external?.name || 'NONE',
              editorValue:
                programmingQuestionData.answer || programmingQuestionData.solutionTemplate
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

    // Set to first tab first, the main editor tab should be the first tab
    handleEditorUpdateBreakpoints(0, []);
    handleUpdateCurrentAssessmentId(assessmentId, questionId);
    const resetWorkspaceOptions = assertType<WorkspaceState>()({
      autogradingResults: options.autogradingResults ?? [],
      editorTabs: [{ value: options.editorValue ?? '', highlightedLines: [], breakpoints: [] }],
      programPrependValue: options.programPrependValue ?? '',
      programPostpendValue: options.programPostpendValue ?? '',
      editorTestcases: options.editorTestcases ?? [],
      files: optionFiles as Record<string, OptionFileType>
    });
    handleResetWorkspace(resetWorkspaceOptions);
    handleChangeExecTime(
      question.library.execTimeMs ?? defaultWorkspaceManager.assessment.execTime
    );
    handleClearContext(question.library, true);
    handleUpdateHasUnsavedChanges(false);
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
      // Contest entries should be fixed to the first tab
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
              isFolderModeEnabled={isFolderModeEnabled}
              currentFileBeingRan={`/${questionId + 1}.js`}
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
      handleSave(question.id, editorTabs[0].value);
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
      // Tab 0 contains the main question tab (always) - and the only 1 they can edit, so this works fine
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
        <ControlBarResetButton
          onClick={onClickResetTemplate}
          disabled={!isEditable}
          key="reset_template"
        />
      ) : null;

    const runButton = (
      <ControlBarRunButton
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        handleEditorEval={handleEval}
        key="run"
      />
    );

    // Define the function to check if the Save button should be disabled
    // TODO: Seems to break save functionality inside Assessments
    const shouldDisableSaveButton = (): boolean | undefined => {
      const isIndividualAssessment: boolean = assessmentOverview?.maxTeamSize === 1;
      if (isIndividualAssessment) {
        return false;
      }
      // TODO: return !teamFormationOverview;
      return false;
    };

    const saveButton =
      props.canSave && question.type === QuestionTypes.programming ? (
        <ControlButtonSaveButton
          hasUnsavedChanges={hasUnsavedChanges}
          isDisabled={shouldDisableSaveButton() || !isEditable}
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

    const toggleFolderModeButton = (
      <ControlBarToggleFolderModeButton
        isFolderModeEnabled={isFolderModeEnabled}
        isSessionActive={false}
        isPersistenceActive={false}
        isSupportedSource={question.library.chapter >= 2}
        toggleFolderMode={async () => {
          dispatch(toggleFolderMode(workspaceLocation));
          if (isFolderModeEnabled && fileSystem) {
            // Set active tab back to default question if user disables folder mode
            let isFound = false;
            editorTabs.forEach((tab, index) => {
              if (tab.filePath && tab.filePath === currentQuestionFilePath) {
                isFound = true;
                dispatch(updateActiveEditorTabIndex(workspaceLocation, index));
              }
            });
            // Original question tab not found, we need to open it
            if (!isFound) {
              const fileContents = await handleReadFile(fileSystem, currentQuestionFilePath);
              dispatch(
                addEditorTab(workspaceLocation, currentQuestionFilePath, fileContents ?? '')
              );
              // Set to the end of the editorTabs array (i.e the newly created editorTab)
              dispatch(updateActiveEditorTabIndex(workspaceLocation, editorTabs.length));
            }
          }
        }}
        key="folder"
      />
    );

    const editorButtonsMobileBreakpoint = [
      runButton,
      saveButton,
      resetButton,
      toggleFolderModeButton
    ];
    editorButtonsMobileBreakpoint.push(chapterSelect);

    const editorButtonsNotMobileBreakpoint = [saveButton, resetButton];
    const flowButtons = [previousButton, questionView, nextButton];

    return {
      editorButtons: !isMobileBreakpoint
        ? editorButtonsMobileBreakpoint
        : editorButtonsNotMobileBreakpoint,
      flowButtons: flowButtons
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
              checkWorkspaceReset(true);
              handleUpdateHasUnsavedChanges(true);
            }}
            options={{ minimal: false, intent: Intent.DANGER }}
          />
        </ButtonGroup>
      </div>
    </Dialog>
  );

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
          handleEditorValueChange: onEditorValueChange,
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
    tabs: [
      ...(isFolderModeEnabled
        ? [
            {
              label: 'Folder',
              body: (
                <FileSystemView
                  disableEditing={true}
                  workspaceLocation={workspaceLocation}
                  basePath={WORKSPACE_BASE_PATHS[workspaceLocation]}
                />
              ),
              iconName: IconNames.FOLDER_CLOSE,
              id: SideContentType.folder
            }
          ]
        : [])
    ]
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
