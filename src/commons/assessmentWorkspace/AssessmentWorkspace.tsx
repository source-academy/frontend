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
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import { stringify } from 'js-slang/dist/utils/stringify';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { initSession, log } from '../../features/eventLogging';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  Assessment,
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
import { ControlBarNextButton } from '../controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../controlBar/ControlBarSaveButton';
import controlButton from '../ControlButton';
import { HighlightedLines, Position } from '../editor/EditorTypes';
import Markdown from '../Markdown';
import { MobileSideContentProps } from '../mobileWorkspace/mobileSideContent/MobileSideContent';
import MobileWorkspace, { MobileWorkspaceProps } from '../mobileWorkspace/MobileWorkspace';
import { SideContentProps } from '../sideContent/SideContent';
import SideContentAutograder from '../sideContent/SideContentAutograder';
import SideContentContestLeaderboard from '../sideContent/SideContentContestLeaderboard';
import SideContentContestVotingContainer from '../sideContent/SideContentContestVotingContainer';
import SideContentToneMatrix from '../sideContent/SideContentToneMatrix';
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes';
import SideContentVideoDisplay from '../sideContent/SideContentVideoDisplay';
import Constants from '../utils/Constants';
import { history } from '../utils/HistoryHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import Workspace, { WorkspaceProps } from '../workspace/Workspace';
import { WorkspaceState } from '../workspace/WorkspaceTypes';
import AssessmentWorkspaceGradingResult from './AssessmentWorkspaceGradingResult';
export type AssessmentWorkspaceProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {
  handleAssessmentFetch: (assessmentId: number) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
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
  handleSendReplInputToOutput: (code: string) => void;
  handleResetWorkspace: (options: Partial<WorkspaceState>) => void;
  handleSave: (id: number, answer: number | string | ContestEntry[]) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleRunAllTestcases: () => void;
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
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
  editorPrepend: string;
  editorValue: string | null;
  editorPostpend: string;
  editorTestcases: Testcase[];
  editorHeight?: number;
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

const AssessmentWorkspace: React.FC<AssessmentWorkspaceProps> = props => {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = React.useState(false);
  const [sessionId, setSessionId] = React.useState('');
  const [selectedTab, setSelectedTab] = React.useState(
    props.assessment?.questions[props.questionId].grader !== undefined
      ? SideContentType.grading
      : SideContentType.questionOverview
  );
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  React.useEffect(() => {
    props.handleEditorValueChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * After mounting (either an older copy of the assessment
   * or a loading screen), try to fetch a newer assessment,
   * and show the briefing.
   */
  React.useEffect(() => {
    props.handleAssessmentFetch(props.assessmentId);

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

    props.handleEditorValueChange(answer);
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

    props.handleEditorValueChange(newCode);

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
    props.handleEditorEval();

    // Run testcases when the autograder tab is selected
    if (activeTab.current === SideContentType.autograder) {
      props.handleRunAllTestcases();
    }

    const input: Input = {
      time: Date.now(),
      type: 'keyboardCommand',
      data: KeyboardCommand.run
    };

    pushLog(input);
  };

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
    let editorPrepend: string = '';
    let editorPostpend: string = '';
    let editorTestcases: Testcase[] = [];

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

    props.handleEditorUpdateBreakpoints([]);
    props.handleUpdateCurrentAssessmentId(assessmentId, questionId);
    props.handleResetWorkspace({
      autogradingResults,
      editorPrepend,
      editorValue,
      editorPostpend,
      editorTestcases
    });
    props.handleClearContext(question.library, true);
    props.handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      props.handleEditorValueChange(editorValue);
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
      props.handleEditorValueChange(answer);
    };

    const tabs: SideContentTab[] = isContestVoting
      ? [
          {
            label: `Task ${questionId + 1}`,
            iconName: IconNames.NINJA,
            body: <Markdown content={props.assessment!.questions[questionId].content} />,
            id: SideContentType.questionOverview,
            toSpawn: () => true
          },
          {
            label: `Contest Voting Briefing`,
            iconName: IconNames.BRIEFCASE,
            body: <Markdown content={props.assessment!.longSummary} />,
            id: SideContentType.briefing,
            toSpawn: () => true
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
            id: SideContentType.contestVoting,
            toSpawn: () => true
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
            id: SideContentType.contestLeaderboard,
            toSpawn: () => false
          }
        ]
      : [
          {
            label: `Task ${questionId + 1}`,
            iconName: IconNames.NINJA,
            body: (
              <Markdown
                className="sidecontent-overview"
                content={props.assessment!.questions[questionId].content}
              />
            ),
            id: SideContentType.questionOverview,
            toSpawn: () => true
          },
          {
            label: `Briefing`,
            iconName: IconNames.BRIEFCASE,
            body: (
              <Markdown className="sidecontent-overview" content={props.assessment!.longSummary} />
            ),
            id: SideContentType.briefing,
            toSpawn: () => true
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
                handleTestcaseEval={props.handleTestcaseEval}
                workspaceLocation="assessment"
              />
            ),
            id: SideContentType.autograder,
            toSpawn: () => true
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
        id: SideContentType.grading,
        toSpawn: () => true
      });
    }

    const externalLibrary = props.assessment!.questions[questionId].library.external;
    const functionsAttached = externalLibrary.symbols;
    if (functionsAttached.includes('get_matrix')) {
      tabs.push({
        label: `Tone Matrix`,
        iconName: IconNames.GRID_VIEW,
        body: <SideContentToneMatrix />,
        id: SideContentType.toneMatrix,
        toSpawn: () => true
      });
    }

    if (
      externalLibrary.name === ExternalLibraryName.PIXNFLIX ||
      externalLibrary.name === ExternalLibraryName.ALL
    ) {
      tabs.push({
        label: 'Video Display',
        iconName: IconNames.MOBILE_VIDEO,
        body: <SideContentVideoDisplay replChange={props.handleSendReplInputToOutput} />,
        id: SideContentType.videoDisplay,
        toSpawn: () => true
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
      tabs,
      onChange: onChangeTabs,
      workspaceLocation: 'assessment'
    };
  };

  /**
   * controlBarProps() will only be called when props.assessment is not undefined
   * (see 'Rendering Logic' below), thus it is okay to use props.assessment!
   */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/academy/${assessmentTypeLink(props.assessment!.type)}`;
    const assessmentWorkspacePath = listingPath + `/${props.assessment!.id.toString()}`;
    const questionProgress: [number, number] = [questionId + 1, props.assessment!.questions.length];

    const onClickPrevious = () => {
      history.push(assessmentWorkspacePath + `/${(questionId - 1).toString()}`);
      if (isMobileBreakpoint) {
        setSelectedTab(SideContentType.questionOverview);
      }
    };
    const onClickNext = () => {
      history.push(assessmentWorkspacePath + `/${(questionId + 1).toString()}`);
      if (isMobileBreakpoint) {
        setSelectedTab(SideContentType.questionOverview);
      }
    };
    const onClickReturn = () => history.push(listingPath);

    /**
     * Returns a nullary function that defers the navigation of the browser window, until the
     * student's answer passes some checks - presently only used for assessments types with skippable = false
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

    const onClickSave = () =>
      props.handleSave(props.assessment!.questions[questionId].id, props.editorValue!);

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

    const runButton = <ControlBarRunButton handleEditorEval={handleEval} key="run" />;

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
        sourceChapter={props.assessment!.questions[questionId].library.chapter}
        sourceVariant={Constants.defaultSourceVariant as Variant}
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
  };

  /* ===============
     Rendering Logic
     =============== */
  if (props.assessment === undefined || props.assessment.questions.length === 0) {
    return (
      <NonIdealState
        className={classNames('WorkspaceParent', Classes.DARK)}
        description="Getting mission ready..."
        icon={<Spinner size={Spinner.SIZE_LARGE} />}
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
          {controlButton('Cancel', null, closeOverlay, {
            minimal: false
          })}
          {controlButton(
            'Confirm',
            null,
            () => {
              closeOverlay();
              props.handleEditorValueChange(
                (props.assessment!.questions[questionId] as IProgrammingQuestion).solutionTemplate
              );
              props.handleUpdateHasUnsavedChanges(true);
            },
            { minimal: false, intent: Intent.DANGER }
          )}
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
  const editorProps =
    question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
      ? {
          editorSessionId: '',
          editorValue: props.editorValue!,
          handleDeclarationNavigate: props.handleDeclarationNavigate,
          handleEditorEval: handleEval,
          handleEditorValueChange: props.handleEditorValueChange,
          handleUpdateHasUnsavedChanges: props.handleUpdateHasUnsavedChanges,
          breakpoints: props.breakpoints,
          highlightedLines: props.highlightedLines,
          newCursorPosition: props.newCursorPosition,
          handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints,
          handlePromptAutocomplete: props.handlePromptAutocomplete,
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
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    output: props.output,
    replValue: props.replValue,
    sourceChapter: question?.library?.chapter || 4,
    sourceVariant: 'default' as Variant,
    externalLibrary: question?.library?.external?.name || 'NONE',
    replButtons: replButtons()
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    hasUnsavedChanges: props.hasUnsavedChanges,
    mcqProps: mcqProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props, questionId),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    hasUnsavedChanges: props.hasUnsavedChanges,
    mcqProps: mcqProps,
    replProps: replProps,
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
