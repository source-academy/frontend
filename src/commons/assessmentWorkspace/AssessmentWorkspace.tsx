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
import { stringify } from 'js-slang/dist/utils/stringify';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { initSession, log } from '../../features/eventLogging';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { fetchAssessment } from '../application/actions/SessionActions';
import { defaultWorkspaceManager, InterpreterOutput } from '../application/ApplicationTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AutogradingResult,
  ContestEntry,
  IContestVotingQuestion,
  IMCQQuestion,
  IProgrammingQuestion,
  Question,
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
import { history } from '../utils/HistoryHelper';
import { useResponsive, useTypedSelector } from '../utils/Hooks';
import { showWarningMessage } from '../utils/NotificationsHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  changeSideContentHeight,
  clearReplOutput,
  evalEditor,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  resetWorkspace,
  runAllTestcases,
  updateActiveEditorTabIndex,
  updateCurrentAssessmentId,
  updateReplValue
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import AssessmentWorkspaceGradingResult from './AssessmentWorkspaceGradingResult';
export type AssessmentWorkspaceProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {
  handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => void;
  handleReplEval: () => void;
  handleSave: (id: number, answer: number | string | ContestEntry[]) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

export type OwnProps = {
  assessmentId: number;
  questionId: number;
  notAttempted: boolean;
  canSave: boolean;
  assessmentConfiguration: AssessmentConfiguration;
};

export type StateProps = {
  assessment?: Assessment;
  autogradingResults: AutogradingResult[];
  programPrependValue: string;
  programPostpendValue: string;
  editorTestcases: Testcase[];
  hasUnsavedChanges: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  replValue: string;
  sideContentHeight?: number;
  storedAssessmentId?: number;
  storedQuestionId?: number;
  courseId?: number;
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = props => {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = React.useState(false);
  const [sessionId, setSessionId] = React.useState('');
  const [selectedTab, setSelectedTab] = React.useState(
    props.assessment?.questions[props.questionId].grader !== undefined
      ? SideContentType.grading
      : SideContentType.questionOverview
  );
  const { isMobileBreakpoint } = useResponsive();

  const dispatch = useDispatch();

  const { isFolderModeEnabled, activeEditorTabIndex, editorTabs } = useTypedSelector(
    store => store.workspaces[workspaceLocation]
  );

  React.useEffect(() => {
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorValueChange(0, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  React.useEffect(() => {
    dispatch(fetchAssessment(props.assessmentId));

    if (props.questionId === 0 && props.notAttempted) {
      setShowOverlay(true);
    }
    if (!props.assessment) {
      return;
    }
    // ------------- PLEASE NOTE, EVERYTHING BELOW THIS SEEMS TO BE UNUSED -------------
    // checkWorkspaceReset does exactly the same thing.
    let questionId = props.questionId;
    if (props.questionId >= props.assessment.questions.length) {
      questionId = props.assessment.questions.length - 1;
    }

    const question: Question = props.assessment.questions[questionId];

    let answer = '';
    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = (question as IProgrammingQuestion).answer as string;
      } else {
        answer = (question as IProgrammingQuestion).solutionTemplate;
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorValueChange(0, answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Once there is an update (due to the assessment being fetched), check
   * if a workspace reset is needed.
   */
  React.useEffect(() => {
    checkWorkspaceReset();
  });

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.questionOverview);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  /* ==================
     onChange handlers
     ================== */
  const pushLog = (newInput: Input) => {
    log(sessionId, newInput);
  };

  const onChangeMethod = (newCode: string, delta: CodeDelta) => {
    if (props.handleUpdateHasUnsavedChanges) {
      props.handleUpdateHasUnsavedChanges(true);
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorValueChange(0, newCode);

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
  const activeTab = React.useRef(selectedTab);
  activeTab.current = selectedTab;
  const handleEval = () => {
    // Run testcases when the autograder tab is selected
    if (activeTab.current === SideContentType.autograder) {
      dispatch(runAllTestcases(workspaceLocation));
    } else {
      dispatch(evalEditor(workspaceLocation));
    }

    const input: Input = {
      time: Date.now(),
      type: 'keyboardCommand',
      data: KeyboardCommand.run
    };

    pushLog(input);
  };

  const setActiveEditorTabIndex = React.useCallback(
    (activeEditorTabIndex: number | null) =>
      dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
    [dispatch]
  );
  const removeEditorTabByIndex = React.useCallback(
    (editorTabIndex: number) => dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
    [dispatch]
  );

  /* ================
     Helper Functions
     ================ */
  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   */
  const checkWorkspaceReset = () => {
    /* Don't reset workspace if assessment not fetched yet. */
    if (props.assessment === undefined) {
      return;
    }

    /* Reset assessment if it has changed.*/
    const assessmentId = props.assessmentId;
    const questionId = props.questionId;

    if (props.storedAssessmentId === assessmentId && props.storedQuestionId === questionId) {
      return;
    }

    const question = props.assessment.questions[questionId];

    let autogradingResults: AutogradingResult[] = [];
    let editorValue: string = '';
    let programPrependValue: string = '';
    let programPostpendValue: string = '';
    let editorTestcases: Testcase[] = [];

    if (question.type === QuestionTypes.programming) {
      const questionData = question as IProgrammingQuestion;
      autogradingResults = questionData.autogradingResults;
      programPrependValue = questionData.prepend;
      programPostpendValue = questionData.postpend;
      editorTestcases = questionData.testcases;

      editorValue = questionData.answer as string;
      if (!editorValue) {
        editorValue = questionData.solutionTemplate!;
      }

      // Initialize session once the editorValue is known.
      if (!sessionId) {
        setSessionId(
          initSession(`${(props.assessment as any).number}/${props.questionId}`, {
            chapter: question.library.chapter,
            externalLibrary: question?.library?.external?.name || 'NONE',
            editorValue
          })
        );
      }
    }

    if (question.type === QuestionTypes.voting) {
      const questionData = question as IContestVotingQuestion;
      programPrependValue = questionData.prepend;
      programPostpendValue = questionData.postpend;
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorUpdateBreakpoints(0, []);
    dispatch(updateCurrentAssessmentId(assessmentId, questionId));
    dispatch(
      resetWorkspace(workspaceLocation, {
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
      })
    );
    dispatch(
      changeExecTime(
        question.library.execTimeMs ?? defaultWorkspaceManager.assessment.execTime,
        workspaceLocation
      )
    );
    dispatch(beginClearContext(workspaceLocation, question.library, true));
    props.handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      props.handleEditorValueChange(0, editorValue);
    }
  };

  /**
   * sideContentProps() will only be called when props.assessment is not undefined
   * (see 'Rendering Logic' below), thus it is okay to use props.assessment!
   */
  const sideContentProps: (p: AssessmentWorkspaceProps, q: number) => SideContentProps = (
    props: AssessmentWorkspaceProps,
    questionId: number
  ) => {
    const isGraded = props.assessment!.questions[questionId].grader !== undefined;
    const isContestVoting = props.assessment!.questions[questionId]?.type === 'voting';
    const handleContestEntryClick = (_submissionId: number, answer: string) => {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      props.handleEditorValueChange(0, answer);
    };

    const tabs: SideContentTab[] = isContestVoting
      ? [
          {
            label: `Question ${questionId + 1}`,
            iconName: IconNames.NINJA,
            body: <Markdown content={props.assessment!.questions[questionId].content} />,
            id: SideContentType.questionOverview
          },
          {
            label: `Contest Voting Briefing`,
            iconName: IconNames.BRIEFCASE,
            body: <Markdown content={props.assessment!.longSummary} />,
            id: SideContentType.briefing
          },
          {
            label: 'Contest Voting',
            iconName: IconNames.NEW_LAYERS,
            body: (
              <SideContentContestVotingContainer
                canSave={props.canSave}
                handleSave={votingSubmission =>
                  props.handleSave(
                    (props.assessment?.questions[questionId] as IContestVotingQuestion).id,
                    votingSubmission
                  )
                }
                handleContestEntryClick={handleContestEntryClick}
                contestEntries={
                  (props.assessment?.questions[questionId] as IContestVotingQuestion)
                    ?.contestEntries ?? []
                }
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
                orderedContestEntries={
                  (props.assessment?.questions[questionId] as IContestVotingQuestion)
                    ?.contestLeaderboard ?? []
                }
              />
            ),
            id: SideContentType.contestLeaderboard
          }
        ]
      : [
          {
            label: `Question ${questionId + 1}`,
            iconName: IconNames.NINJA,
            body: (
              <Markdown
                className="sidecontent-overview"
                content={props.assessment!.questions[questionId].content}
              />
            ),
            id: SideContentType.questionOverview
          },
          {
            label: `Briefing`,
            iconName: IconNames.BRIEFCASE,
            body: (
              <Markdown className="sidecontent-overview" content={props.assessment!.longSummary} />
            ),
            id: SideContentType.briefing
          },
          {
            label: `Autograder`,
            iconName: IconNames.AIRPLANE,
            body: (
              <SideContentAutograder
                testcases={props.editorTestcases}
                autogradingResults={
                  // Display autograding results if assessment has been graded by an avenger, OR does not need to be manually graded
                  isGraded || !props.assessmentConfiguration.isManuallyGraded
                    ? props.autogradingResults
                    : []
                }
                handleTestcaseEval={id => dispatch(evalTestcase(workspaceLocation, id))}
                workspaceLocation="assessment"
              />
            ),
            id: SideContentType.autograder
          }
        ];

    if (isGraded) {
      tabs.push({
        label: `Report Card`,
        iconName: IconNames.TICK,
        body: (
          <AssessmentWorkspaceGradingResult
            graderName={props.assessment!.questions[questionId].grader!.name}
            gradedAt={props.assessment!.questions[questionId].gradedAt!}
            xp={props.assessment!.questions[questionId].xp}
            maxXp={props.assessment!.questions[questionId].maxXp}
            comments={props.assessment!.questions[questionId].comments}
          />
        ),
        id: SideContentType.grading
      });
    }

    const externalLibrary = props.assessment!.questions[questionId].library.external;
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
      workspaceLocation: 'assessment'
    };
  };

  /**
   * controlBarProps() will only be called when props.assessment is not undefined
   * (see 'Rendering Logic' below), thus it is okay to use props.assessment!
   */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${props.courseId}/${assessmentTypeLink(props.assessment!.type)}`;
    const assessmentWorkspacePath = listingPath + `/${props.assessment!.id.toString()}`;
    const questionProgress: [number, number] = [questionId + 1, props.assessment!.questions.length];

    const onClickPrevious = () => {
      history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`);
      setSelectedTab(SideContentType.questionOverview);
    };
    const onClickNext = () => {
      history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`);
      setSelectedTab(SideContentType.questionOverview);
    };
    const onClickReturn = () => history.push(listingPath);

    /**
     * Returns a nullary function that defers the navigation of the browser window, until the
     * student's answer passes some checks - presently only used for assessments types with blocking = true
     * (previously used for the 'Path' assessment type in SA Knight)
     */
    const onClickProgress = (deferredNavigate: () => void) => {
      return () => {
        // Perform question blocking - determine the highest question number previously accessed
        // by counting the number of questions that have a non-null answer
        const blockedQuestionId =
          props.assessment!.questions.filter(qn => qn.answer !== null).length - 1;

        // If the current question does not block the next question, proceed as usual
        if (questionId < blockedQuestionId) {
          return deferredNavigate();
        }
        // Else evaluate its correctness - proceed iff the answer to the current question is correct
        const question: Question = props.assessment!.questions[questionId];
        if (question.type === QuestionTypes.mcq) {
          // Note that 0 is a falsy value!
          if (question.answer === null) {
            return showWarningMessage('Please select an option!', 750);
          }
          // If the question is 'blocking', but there is no MCQ solution provided (i.e. assessment uploader's
          // mistake), allow the student to proceed after selecting an option
          if ((question as IMCQQuestion).solution === undefined) {
            return deferredNavigate();
          }
          if (question.answer !== (question as IMCQQuestion).solution) {
            return showWarningMessage('Your MCQ solution is incorrect!', 750);
          }
        } else if (question.type === QuestionTypes.programming) {
          const isCorrect = props.editorTestcases.reduce((acc, testcase) => {
            return acc && stringify(testcase.result) === testcase.answer;
          }, true);
          if (!isCorrect) {
            return showWarningMessage('Your solution has not passed all testcases!', 750);
          }
        }
        return deferredNavigate();
      };
    };

    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    const onClickSave = () =>
      props.handleSave(props.assessment!.questions[questionId].id, editorTabs[0].value);

    const onClickResetTemplate = () => {
      setShowResetTemplateOverlay(true);
    };

    const nextButton = (
      <ControlBarNextButton
        onClickNext={
          props.assessment!.questions[questionId].blocking
            ? onClickProgress(onClickNext)
            : onClickNext
        }
        onClickReturn={
          props.assessment!.questions[questionId].blocking
            ? onClickProgress(onClickReturn)
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
      props.assessment!.questions[questionId].type !== QuestionTypes.mcq ? (
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
      props.canSave &&
      props.assessment!.questions[questionId].type === QuestionTypes.programming ? (
        <ControlButtonSaveButton
          hasUnsavedChanges={props.hasUnsavedChanges}
          onClickSave={onClickSave}
          key="save"
        />
      ) : null;

    const handleChapterSelect = () => {};

    const chapterSelect = (
      <ControlBarChapterSelect
        handleChapterSelect={handleChapterSelect}
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={props.assessment!.questions[questionId].library.chapter}
        sourceVariant={
          props.assessment!.questions[questionId].library.variant ?? Constants.defaultSourceVariant
        }
        disabled={true}
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

  const replButtons = () => {
    const clearButton = (
      <ControlBarClearButton
        handleReplOutputClear={() => dispatch(clearReplOutput(workspaceLocation))}
        key="clear_repl"
      />
    );

    const evalButton = (
      <ControlBarEvalButton
        handleReplEval={props.handleReplEval}
        isRunning={props.isRunning}
        key="eval_repl"
      />
    );

    return [evalButton, clearButton];
  };

  /* ===============
     Rendering Logic
     =============== */
  if (props.assessment === undefined || props.assessment.questions.length === 0) {
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
        <Markdown content={props.assessment.longSummary} />
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
              props.handleEditorValueChange(
                0,
                (props.assessment!.questions[questionId] as IProgrammingQuestion).solutionTemplate
              );
              props.handleUpdateHasUnsavedChanges(true);
            }}
            options={{ minimal: false, intent: Intent.DANGER }}
          />
        </ButtonGroup>
      </div>
    </Dialog>
  );

  /* If questionId is out of bounds, set it to the max. */
  const questionId =
    props.questionId >= props.assessment.questions.length
      ? props.assessment.questions.length - 1
      : props.questionId;
  const question: Question = props.assessment.questions[questionId];
  const editorContainerProps: NormalEditorContainerProps | undefined =
    question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
      ? {
          editorVariant: 'normal',
          isFolderModeEnabled,
          activeEditorTabIndex,
          setActiveEditorTabIndex,
          removeEditorTabByIndex,
          editorTabs: editorTabs.map(convertEditorTabStateToProps),
          editorSessionId: '',
          sourceChapter: question.library.chapter || Chapter.SOURCE_4,
          sourceVariant: question.library.variant ?? Variant.DEFAULT,
          externalLibraryName: question.library.external.name || 'NONE',
          handleDeclarationNavigate: (cursorPosition: Position) =>
            dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
          handleEditorEval: handleEval,
          handleEditorValueChange: props.handleEditorValueChange,
          handleUpdateHasUnsavedChanges: props.handleUpdateHasUnsavedChanges,
          handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints,
          handlePromptAutocomplete: (row: number, col: number, callback: any) =>
            dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
          isEditorAutorun: false,
          onChange: onChangeMethod,
          onCursorChange: onCursorChangeMethod,
          onSelectionChange: onSelectionChangeMethod
        }
      : undefined;
  const mcqProps = {
    mcq: question as IMCQQuestion,
    handleMCQSubmit: (option: number) =>
      props.handleSave(props.assessment!.questions[questionId].id, option)
  };
  const replProps = {
    handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
    handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
    handleReplEval: props.handleReplEval,
    handleReplValueChange: (newValue: string) =>
      dispatch(updateReplValue(newValue, workspaceLocation)),
    output: props.output,
    replValue: props.replValue,
    sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
    sourceVariant: question.library.variant ?? Variant.DEFAULT,
    externalLibrary: question?.library?.external?.name || 'NONE',
    replButtons: replButtons()
  };
  const sideBarProps = {
    tabs: []
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: (heightChange: number) =>
      dispatch(changeSideContentHeight(heightChange, workspaceLocation)),
    hasUnsavedChanges: props.hasUnsavedChanges,
    mcqProps: mcqProps,
    sideBarProps: sideBarProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props, questionId),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps: editorContainerProps,
    hasUnsavedChanges: props.hasUnsavedChanges,
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
