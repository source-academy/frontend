import { Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { changeSideContentHeight } from 'src/commons/sideContent/SideContentActions';
import { showSimpleErrorDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

import { defaultWorkspaceManager } from '../../../../commons/application/ApplicationTypes';
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
import SideContentAutograder from '../../../../commons/sideContent/content/SideContentAutograder';
import SideContentToneMatrix from '../../../../commons/sideContent/content/SideContentToneMatrix';
import { SideContentProps } from '../../../../commons/sideContent/SideContent';
import { useSideContent } from '../../../../commons/sideContent/SideContentHelper';
import { SideContentTab, SideContentType } from '../../../../commons/sideContent/SideContentTypes';
import Workspace, { WorkspaceProps } from '../../../../commons/workspace/Workspace';
import { WorkspaceLocation, WorkspaceState } from '../../../../commons/workspace/WorkspaceTypes';
import { AnsweredQuestion } from '../../../../features/grading/GradingTypes';
import GradingEditor from './GradingEditor';

const workspaceLocation: WorkspaceLocation = 'grading';
const unansweredPrependValue: string = `// This answer does not have significant changes from the given solution
// template and has thus been flagged as unanswered.
// If you think this is wrong, please ignore and grade accordingly.


`;

type Props = {
  submissionId: number;
  questionId: number;
};

const GradingWorkspace: React.FC<Props> = props => {
  const navigate = useNavigate();
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
    SideContentType.grading
  );

  const grading = useTypedSelector(state => state.session.gradings[props.submissionId]);
  const courseId = useTypedSelector(state => state.session.courseId);
  const {
    autogradingResults,
    isFolderModeEnabled,
    activeEditorTabIndex,
    editorTabs,
    editorTestcases,
    isRunning,
    output,
    replValue,
    currentSubmission: storedSubmissionId,
    currentQuestion: storedQuestionId
  } = useTypedSelector(state => state.workspaces[workspaceLocation]);

  const dispatch = useDispatch();
  const {
    handleBrowseHistoryDown,
    handleBrowseHistoryUp,
    handleClearContext,
    handleDeclarationNavigate,
    handleEditorEval,
    handleSetActiveEditorTabIndex,
    handleRemoveEditorTabByIndex,
    handleEditorValueChange,
    handleEditorUpdateBreakpoints,
    handleGradingFetch,
    handleReplEval,
    handleReplOutputClear,
    handleReplValueChange,
    handleResetWorkspace,
    handleChangeExecTime,
    handleSideContentHeightChange,
    handleTestcaseEval,
    handleRunAllTestcases,
    handleUpdateCurrentSubmissionId,
    handleUpdateHasUnsavedChanges,
    handlePromptAutocomplete
  } = useMemo(() => {
    return {
      handleBrowseHistoryDown: () =>
        dispatch(WorkspaceActions.browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () =>
        dispatch(WorkspaceActions.browseReplHistoryUp(workspaceLocation)),
      handleClearContext: (library: Library, shouldInitLibrary: boolean) =>
        dispatch(WorkspaceActions.beginClearContext(workspaceLocation, library, shouldInitLibrary)),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(WorkspaceActions.navigateToDeclaration(workspaceLocation, cursorPosition)),
      handleEditorEval: () => dispatch(WorkspaceActions.evalEditor(workspaceLocation)),
      handleSetActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(
          WorkspaceActions.updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)
        ),
      handleRemoveEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(WorkspaceActions.removeEditorTab(workspaceLocation, editorTabIndex)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(WorkspaceActions.updateEditorValue(workspaceLocation, 0, newEditorValue)),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        dispatch(
          WorkspaceActions.setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)
        ),
      handleGradingFetch: (submissionId: number) =>
        dispatch(SessionActions.fetchGrading(submissionId)),
      handleReplEval: () => dispatch(WorkspaceActions.evalRepl(workspaceLocation)),
      handleReplOutputClear: () => dispatch(WorkspaceActions.clearReplOutput(workspaceLocation)),
      handleReplValueChange: (newValue: string) =>
        dispatch(WorkspaceActions.updateReplValue(newValue, workspaceLocation)),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        dispatch(WorkspaceActions.resetWorkspace(workspaceLocation, options)),
      handleChangeExecTime: (execTimeMs: number) =>
        dispatch(WorkspaceActions.changeExecTime(execTimeMs, workspaceLocation)),
      handleSideContentHeightChange: (heightChange: number) =>
        dispatch(changeSideContentHeight(heightChange, workspaceLocation)),
      handleTestcaseEval: (testcaseId: number) =>
        dispatch(WorkspaceActions.evalTestcase(workspaceLocation, testcaseId)),
      handleRunAllTestcases: () => dispatch(WorkspaceActions.runAllTestcases(workspaceLocation)),
      handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) =>
        dispatch(WorkspaceActions.updateCurrentSubmissionId(submissionId, questionId)),
      handleUpdateHasUnsavedChanges: (unsavedChanges: boolean) =>
        dispatch(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, unsavedChanges)),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(WorkspaceActions.promptAutocomplete(workspaceLocation, row, col, callback))
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
    if (props.questionId >= grading.answers.length) {
      questionId = grading.answers.length - 1;
    }

    const question: AnsweredQuestion = grading.answers[questionId].question;
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
    if (grading.answers[questionId] === undefined) {
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
  const checkWorkspaceReset = (props: Props) => {
    /* Reset grading if it has changed.*/
    const submissionId = props.submissionId;
    const questionId = props.questionId;

    if (storedSubmissionId === submissionId && storedQuestionId === questionId) {
      return;
    }
    const question = grading!.answers[questionId].question as Question;

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
    handleChangeExecTime(question.library.execTimeMs ?? defaultWorkspaceManager.grading.execTime);
    handleClearContext(question.library, true);
    handleUpdateHasUnsavedChanges(false);
    if (editorValue) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange(0, editorValue);
    }
  };

  /** Pre-condition: Grading has been loaded */
  const sideContentProps: (p: Props, q: number) => SideContentProps = (
    props: Props,
    questionId: number
  ) => {
    const tabs: SideContentTab[] = [
      {
        label: `Grading: Question ${questionId + 1}`,
        iconName: IconNames.TICK,
        /* Render an editor with the xp given to the current question. */
        body: (
          <GradingEditor
            solution={grading!.answers[questionId].question.solution}
            questionId={grading!.answers[questionId].question.id}
            submissionId={props.submissionId}
            initialXp={grading!.answers[questionId].grade.xp}
            xpAdjustment={grading!.answers[questionId].grade.xpAdjustment}
            maxXp={grading!.answers[questionId].question.maxXp}
            studentNames={
              grading!.answers[questionId].student.name
                ? [grading!.answers[questionId].student.name]
                : grading!.answers[questionId].team!.map(member => member.name)
            }
            studentUsernames={
              grading!.answers[questionId].student.username
                ? [grading!.answers[questionId].student.username]
                : grading!.answers[questionId].team!.map(member => member.username)
            }
            comments={grading!.answers[questionId].grade.comments ?? ''}
            graderName={
              grading!.answers[questionId].grade.grader
                ? grading!.answers[questionId].grade.grader!.name
                : undefined
            }
            gradedAt={
              grading!.answers[questionId].grade.gradedAt
                ? grading!.answers[questionId].grade.gradedAt!
                : undefined
            }
          />
        ),
        id: SideContentType.grading
      },
      {
        label: `Question ${questionId + 1}`,
        iconName: IconNames.NINJA,
        body: <Markdown content={grading!.answers[questionId].question.content} />,
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
      },
      {
        label: `Briefing`,
        iconName: IconNames.BRIEFCASE,
        body: (
          <Markdown
            content={
              grading
                ? grading.assessment.summaryLong
                : 'Briefing Unavailable. Try refreshing the page.'
            }
          />
        ),
        id: SideContentType.briefing
      }
    ];
    const externalLibrary = grading!.answers[questionId].question.library.external;
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
      workspaceLocation
    };

    return sideContentProps;
  };

  /** Pre-condition: Grading has been loaded */
  const controlBarProps: (q: number) => ControlBarProps = (questionId: number) => {
    const listingPath = `/courses/${courseId}/grading`;
    const gradingWorkspacePath = listingPath + `/${props.submissionId}`;
    const questionProgress: [number, number] = [questionId + 1, grading!.answers.length];

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
  const questionId =
    props.questionId >= grading.answers.length ? grading.answers.length - 1 : props.questionId;
  /* Get the question to be graded */
  const question = grading.answers[questionId].question as Question;
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(questionId),
    editorContainerProps:
      question.type === QuestionTypes.programming || question.type === QuestionTypes.voting
        ? {
            editorVariant: 'normal',
            isFolderModeEnabled: isFolderModeEnabled,
            activeEditorTabIndex: activeEditorTabIndex,
            setActiveEditorTabIndex: handleSetActiveEditorTabIndex,
            removeEditorTabByIndex: handleRemoveEditorTabByIndex,
            editorTabs: editorTabs.map(convertEditorTabStateToProps),
            editorSessionId: '',
            sessionDetails: null,
            handleDeclarationNavigate: handleDeclarationNavigate,
            handleEditorEval: handleEval,
            handleEditorValueChange: handleEditorValueChange,
            handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints,
            handlePromptAutocomplete: handlePromptAutocomplete,
            isEditorAutorun: false,
            sourceChapter: question?.library?.chapter || Chapter.SOURCE_4,
            sourceVariant: question?.library?.variant ?? Variant.DEFAULT,
            externalLibraryName: question?.library?.external?.name || 'NONE'
          }
        : undefined,
    handleSideContentHeightChange: handleSideContentHeightChange,
    mcqProps: {
      mcq: question as IMCQQuestion,
      handleMCQSubmit: (i: number) => {}
    },
    sideBarProps: {
      tabs: []
    },
    sideContentProps: sideContentProps(props, questionId),
    replProps: {
      handleBrowseHistoryDown: handleBrowseHistoryDown,
      handleBrowseHistoryUp: handleBrowseHistoryUp,
      handleReplEval: handleReplEval,
      handleReplValueChange: handleReplValueChange,
      output: output,
      replValue: replValue,
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
