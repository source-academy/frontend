import { Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';
import { useNavigate } from 'react-router';
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

const GradingWorkspace: React.FC<GradingWorkspaceProps> = props => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.grading);

  /**
   * After mounting (either an older copy of the grading
   * or a loading screen), try to fetch a newer grading.
   */
  React.useEffect(() => {
    props.handleGradingFetch(props.submissionId);
    if (!props.grading) {
      return;
    }

    let questionId = props.questionId;
    if (props.questionId >= props.grading.length) {
      questionId = props.grading.length - 1;
    }

    const question: AnsweredQuestion = props.grading[questionId].question;
    let answer: string = '';

    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        answer = question.answer as string;
      } else {
        answer = question.solutionTemplate || '';
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    props.handleEditorValueChange(0, answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Once there is an update (due to the grading being fetched), check
   * if a workspace reset is needed.
   */
  React.useEffect(() => {
    /* Don't reset workspace if grading not fetched yet. */
    if (props.grading === undefined) {
      return;
    }
    const questionId = props.questionId;

    /**
     * Check if questionId is out of bounds, if it is, redirect to the
     * grading overview page
     *
     * This occurs if the grading is submitted on the last question,
     * as the function to move to the next question does not check
     * if that question exists
     */
    if (props.grading[questionId] === undefined) {
      navigate(`/courses/${props.courseId}/grading`);
    } else {
      checkWorkspaceReset(props);
    }
  });

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   *
   * Assumes that 'props.grading' is defined
   */
  const checkWorkspaceReset = (props: GradingWorkspaceProps) => {
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
  };

  /** Pre-condition: Grading has been loaded */
  const sideContentProps: (p: GradingWorkspaceProps, q: number) => SideContentProps = (
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
            questions={""}
            comments={props.grading![questionId].grade.comments ?? ''}
            graderName={props.grading![questionId].grade.grader
              ? props.grading![questionId].grade.grader!.name
              : undefined}
            gradedAt={props.grading![questionId].grade.grader
              ? props.grading![questionId].grade.gradedAt!
              : undefined}          />
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
            handleTestcaseEval={props.handleTestcaseEval}
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
        setSelectedTab(newTabId);
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
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${props.courseId}/grading`;
    const gradingWorkspacePath = listingPath + `/${props.submissionId}`;
    const questionProgress: [number, number] = [questionId + 1, props.grading!.length];

    const onClickPrevious = () =>
      navigate(gradingWorkspacePath + `/${(questionId - 1).toString()}`);
    const onClickNext = () => navigate(gradingWorkspacePath + `/${(questionId + 1).toString()}`);
    const onClickReturn = () => navigate(listingPath);

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
        isEntrypointFileDefined={props.activeEditorTabIndex !== null}
        handleEditorEval={handleEval}
        key="run"
      />
    );

    return {
      editorButtons: [runButton],
      flowButtons: [previousButton, questionView, nextButton]
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

  const handleEval = () => {
    props.handleEditorEval();

    // Run testcases when the autograder tab is selected
    if (selectedTab === SideContentType.autograder) {
      props.handleRunAllTestcases();
    }
  };

  // Rendering logic
  if (props.grading === undefined) {
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
    props.questionId >= props.grading.length ? props.grading.length - 1 : props.questionId;
  /* Get the question to be graded */
  const question = props.grading[questionId].question as Question;
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps:
      question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
        ? {
            editorVariant: 'normal',
            isFolderModeEnabled: props.isFolderModeEnabled,
            activeEditorTabIndex: props.activeEditorTabIndex,
            setActiveEditorTabIndex: props.handleSetActiveEditorTabIndex,
            removeEditorTabByIndex: props.handleRemoveEditorTabByIndex,
            editorTabs: props.editorTabs.map(convertEditorTabStateToProps),
            editorSessionId: '',
            handleDeclarationNavigate: props.handleDeclarationNavigate,
            handleEditorEval: handleEval,
            handleEditorValueChange: props.handleEditorValueChange,
            handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints,
            handlePromptAutocomplete: props.handlePromptAutocomplete,
            isEditorAutorun: false,
            sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
            sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
            externalLibraryName: question?.library?.external?.name || 'NONE'
          }
        : undefined,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    mcqProps: {
      mcq: question as IMCQQuestion,
      handleMCQSubmit: (i: number) => {}
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
      sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
      externalLibrary: question?.library?.external?.name || 'NONE',
      replButtons: replButtons()
    }
  };
  return (
    <div className={classNames('WorkspaceParent', Classes.DARK)}>
      <Workspace {...workspaceProps} />
    </div>
  );
};

export default GradingWorkspace;
