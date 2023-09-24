import { Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { fetchGrading } from 'src/commons/application/actions/SessionActions';
import {
  AutogradingResult,
  IMCQQuestion,
  Question,
  QuestionTypes,
  Testcase
} from 'src/commons/assessment/AssessmentTypes';
import { ControlBarProps } from 'src/commons/controlBar/ControlBar';
import { ControlBarClearButton } from 'src/commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from 'src/commons/controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from 'src/commons/controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from 'src/commons/controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from 'src/commons/controlBar/ControlBarQuestionViewButton';
import { ControlBarRunButton } from 'src/commons/controlBar/ControlBarRunButton';
import { convertEditorTabStateToProps } from 'src/commons/editor/EditorContainer';
import Markdown from 'src/commons/Markdown';
import { allWorkspaceActions } from 'src/commons/redux/workspace/AllWorkspacesRedux';
import { gradingActions } from 'src/commons/redux/workspace/assessment/GradingRedux';
import { useEditorState, useRepl, useSideContent, useWorkspace } from 'src/commons/redux/workspace/Hooks';
import { defaultGradingState, SideContentLocation } from 'src/commons/redux/workspace/WorkspaceReduxTypes';
import SideContentAutograder from 'src/commons/sideContent/content/SideContentAutograder';
import SideContentToneMatrix from 'src/commons/sideContent/content/SideContentToneMatrix';
import { SideContentProps } from 'src/commons/sideContent/SideContent';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { showSimpleErrorDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import Workspace, { WorkspaceProps } from 'src/commons/workspace/Workspace';
import { AnsweredQuestion } from 'src/features/grading/GradingTypes';

import GradingEditor from './GradingEditorContainer';

type GradingWorkspaceProps = {
  submissionId: number;
  questionId: number;
};

const workspaceLocation: SideContentLocation = 'grading';
const unansweredPrependValue: string = `// This answer does not have significant changes from the given solution
// template and has thus been flagged as unanswered.
// If you think this is wrong, please ignore and grade accordingly.


`;

const GradingWorkspace: React.FC<GradingWorkspaceProps> = props => {
  const navigate = useNavigate();
  const { selectedTab, setSelectedTab } = useSideContent(workspaceLocation, SideContentType.grading)
  const { 
    editorTabs, 
    editorSessionId,
    activeEditorTabIndex,
    isEditorAutorun,
    isFolderModeEnabled,
    updateEditorValue: handleEditorValueChange,
    updateEditorBreakpoints: handleEditorUpdateBreakpoints,
    updateActiveEditorTabIndex: handleUpdateActiveEditorTabIndex,
    removeEditorTab: handleRemoveEditorTabByIndex,
 } = useEditorState(workspaceLocation)
  // const [selectedTab, setSelectedTab] = useState(SideContentType.grading);

  const grading = useTypedSelector(state => state.session.gradings.get(props.submissionId));
  const courseId = useTypedSelector(state => state.session.courseId);
  const {
    autogradingResults,
    editorTestcases,
    isRunning,
    output,
    context,
    globals,
    currentSubmission: storedSubmissionId,
    currentQuestion: storedQuestionId,
    beginClearContext: handleClearContext,
    changeExecTime: handleChangeExecTime,
    evalEditor: handleEditorEval,
    evalRepl: handleReplEval,
    navDeclaration: handleDeclarationNavigate,
    promptAutocomplete: handlePromptAutocomplete,
    resetWorkspace: handleResetWorkspace,
    updateHasUnsavedChanges: handleUpdateHasUnsavedChanges
  } = useWorkspace(workspaceLocation)

  const {
    clearReplOutput: handleReplOutputClear
  } = useRepl(workspaceLocation)

  const dispatch = useDispatch();
  const {
    handleGradingFetch,
    handleTestcaseEval,
    handleRunAllTestcases,
    handleUpdateCurrentSubmissionId,
  } = useMemo(() => {
    return {
      handleGradingFetch: (submissionId: number) => dispatch(fetchGrading(submissionId)),
      handleTestcaseEval: (testcaseId: number) =>
        dispatch(allWorkspaceActions.evalTestCase(workspaceLocation, testcaseId)),
      handleRunAllTestcases: () => dispatch(allWorkspaceActions.evalEditorAndTestcases(workspaceLocation)),
      handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) =>
        dispatch(gradingActions.updateCurrentSubmissionId(submissionId, questionId)),
    };
  }, [dispatch]);

  /**
   * After mounting (either an older copy of the grading
   * or a loading screen), try to fetch a newer grading.
   */
  useEffect(() => {
    handleGradingFetch(props.submissionId);
    if (!grading) {
      return;
    }

    let questionId = props.questionId;
    if (props.questionId >= grading.length) {
      questionId = grading.length - 1;
    }

    const question: AnsweredQuestion = grading[questionId].question;
    let answer: string = '';

    if (question.type === QuestionTypes.programming) {
      if (question.answer) {
        if (question.answer.trim() === question.solutionTemplate.trim()) {
          answer = unansweredPrependValue + question.answer;
          showSimpleErrorDialog({
            contents: 'Question has not been answered.'
          });
        } else {
          answer = question.answer as string;
        }
      } else {
        answer = question.solutionTemplate || '';
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Once there is an update (due to the grading being fetched), check
   * if a workspace reset is needed.
   */
  useEffect(() => {
    /* Don't reset workspace if grading not fetched yet. */
    if (grading === undefined) {
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
    if (grading[questionId] === undefined) {
      navigate(`/courses/${courseId}/grading`);
    } else {
      checkWorkspaceReset(props);
    }
  });

  /**
   * Checks if there is a need to reset the workspace, then executes
   * a dispatch (in the props) if needed.
   *
   * Assumes that 'grading' is defined
   */
  const checkWorkspaceReset = (props: GradingWorkspaceProps) => {
    /* Reset grading if it has changed.*/
    const submissionId = props.submissionId;
    const questionId = props.questionId;

    if (storedSubmissionId === submissionId && storedQuestionId === questionId) {
      return;
    }
    const question = grading![questionId].question as Question;

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
      if (editorValue.trim() === questionData.solutionTemplate?.trim()) {
        showSimpleErrorDialog({
          contents: 'Question has not been answered.'
        });
        editorValue = unansweredPrependValue + editorValue;
      }
    }

    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorUpdateBreakpoints(0, []);
    handleUpdateCurrentSubmissionId(submissionId, questionId);
    handleResetWorkspace({
      autogradingResults,
      editorState: {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        editorTabs: [
          {
            value: editorValue,
            highlightedLines: [],
            breakpoints: []
          }
        ],
      },
      programPrependValue,
      programPostpendValue,
      editorTestcases
    });
    handleChangeExecTime(question.library.execTimeMs ?? defaultGradingState.execTime);
    handleClearContext(context.chapter, context.variant, globals, context.externalSymbols);
    handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange(0, editorValue);
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
            solution={grading![questionId].question.solution}
            questionId={grading![questionId].question.id}
            submissionId={props.submissionId}
            initialXp={grading![questionId].grade.xp}
            xpAdjustment={grading![questionId].grade.xpAdjustment}
            maxXp={grading![questionId].question.maxXp}
            studentName={grading![questionId].student.name}
            studentUsername={grading![questionId].student.username}
            comments={grading![questionId].grade.comments ?? ''}
            graderName={
              grading![questionId].grade.grader
                ? grading![questionId].grade.grader!.name
                : undefined
            }
            gradedAt={
              grading![questionId].grade.grader ? grading![questionId].grade.gradedAt! : undefined
            }
          />
        ),
        id: SideContentType.grading
      },
      {
        label: `Question ${questionId + 1}`,
        iconName: IconNames.NINJA,
        body: <Markdown content={grading![questionId].question.content} />,
        id: SideContentType.questionOverview
      },
      {
        label: `Autograder`,
        iconName: IconNames.AIRPLANE,
        body: (
          <SideContentAutograder
            testcases={editorTestcases}
            autogradingResults={autogradingResults}
            handleTestcaseEval={handleTestcaseEval}
            workspaceLocation="grading"
          />
        ),
        id: SideContentType.autograder
      }
    ];
    const externalLibrary = grading![questionId].question.library.external;
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
      location: workspaceLocation
    };

    return sideContentProps;
  };

  /** Pre-condition: Grading has been loaded */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${courseId}/grading`;
    const gradingWorkspacePath = listingPath + `/${props.submissionId}`;
    const questionProgress: [number, number] = [questionId + 1, grading!.length];

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
        isEntrypointFileDefined={activeEditorTabIndex !== null}
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
      <ControlBarClearButton handleReplOutputClear={handleReplOutputClear} key="clear_repl" />
    );

    const evalButton = (
      <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
    );

    return [evalButton, clearButton];
  };

  const handleEval = () => {
    handleEditorEval();

    // Run testcases when the autograder tab is selected
    if (selectedTab === SideContentType.autograder) {
      handleRunAllTestcases();
    }
  };

  // Rendering logic
  if (grading === undefined) {
    return (
      <NonIdealState
        className={classNames('WorkspaceParent', Classes.DARK)}
        description="Getting assessment ready..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
      />
    );
  }

  /* If questionId is out of bounds, set it to the max. */
  const questionId = props.questionId >= grading.length ? grading.length - 1 : props.questionId;
  /* Get the question to be graded */
  const question = grading[questionId].question as Question;
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps:
      question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
        ? {
            editorVariant: 'normal',
            editorTabs: editorTabs.map(convertEditorTabStateToProps),
            editorSessionId,
            isEditorAutorun,
            isFolderModeEnabled,
            handleDeclarationNavigate,
            handlePromptAutocomplete,
            handleEditorEval,
            activeEditorTabIndex,
            setActiveEditorTabIndex: handleUpdateActiveEditorTabIndex,
            removeEditorTabByIndex: handleRemoveEditorTabByIndex,
            handleEditorUpdateBreakpoints,
            handleEditorValueChange,
            sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
            sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
            // externalLibraryName: question?.library?.external?.name || 'NONE'
          }
        : undefined,
    mcqProps: {
      mcq: question as IMCQQuestion,
      handleMCQSubmit: (i: number) => {}
    },
    sideBarProps: {
      tabs: []
    },
    sideContentProps: sideContentProps(props, questionId),
    replProps: {
      location: workspaceLocation,
      handleReplEval: handleReplEval,
      output: output,
      sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
      sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
      // externalLibrary: question?.library?.external?.name || 'NONE',
      replButtons: replButtons()
    },
    workspaceLocation
  };
  return (
    <div className={classNames('WorkspaceParent', Classes.DARK)}>
      <Workspace {...workspaceProps} />
    </div>
  );
};

export default GradingWorkspace;
