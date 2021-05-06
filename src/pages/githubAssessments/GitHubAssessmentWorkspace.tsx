import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import React, { useCallback, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Library } from '../../commons/assessment/AssessmentTypes';
import { ControlBarProps } from '../../commons/controlBar/ControlBar';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../../commons/controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../../commons/controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../../commons/controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../../commons/controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../../commons/controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../../commons/controlBar/ControlBarSaveButton';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import { getMissionData } from '../../commons/githubAssessments/GitHubMissionDataUtils';
import {
  GitHubMissionSaveDialog,
  GitHubMissionSaveDialogProps,
  GitHubMissionSaveDialogResolution
} from '../../commons/githubAssessments/GitHubMissionSaveDialog';
import MissionData from '../../commons/githubAssessments/MissionData';
import MissionRepoData from '../../commons/githubAssessments/MissionRepoData';
import TaskData from '../../commons/githubAssessments/TaskData';
import { MobileSideContentProps } from '../../commons/mobileWorkspace/mobileSideContent/MobileSideContent';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import { SideContentProps } from '../../commons/sideContent/SideContent';
import { SideContentMarkdownEditor } from '../../commons/sideContent/SideContentMarkdownEditor';
import { SideContentTaskEditor } from '../../commons/sideContent/SideContentTaskEditor';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import Constants from '../../commons/utils/Constants';
import { promisifyDialog, showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import { WorkspaceState } from '../../commons/workspace/WorkspaceTypes';
import {
  checkIfFileCanBeSavedAndGetSaveType,
  performCreatingSave,
  performOverwritingSave
} from '../../features/github/GitHubUtils';
import { store } from '../createStore';

export type GitHubAssessmentWorkspaceProps = DispatchProps & StateProps & RouteComponentProps;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
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
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

export type StateProps = {
  editorPrepend: string;
  editorValue: string | null;
  editorPostpend: string;
  editorHeight?: number;
  editorWidth: string;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  replValue: string;
  sideContentHeight?: number;
  sourceChapter: number;
};

const GitHubAssessmentWorkspace: React.FC<GitHubAssessmentWorkspaceProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.questionOverview);

  /**
   * Handles re-rendering the webpage + tracking states relating to the loaded mission
   */
  const [selectedSourceChapter, selectSourceChapter] = React.useState(props.sourceChapter);
  const [briefingContent, setBriefingContent] = React.useState(
    'Welcome to Mission Mode! This is where the Mission Briefing for each assignment will appear.'
  );
  const [cachedTaskList, setCachedTaskList] = React.useState<TaskData[]>([]);
  const [taskList, setTaskList] = React.useState<TaskData[]>([]);
  const [currentTaskNumber, setCurrentTaskNumber] = React.useState(0);

  const handleEditorValueChange = props.handleEditorValueChange;

  const missionRepoData = props.location.state as MissionRepoData;
  const octokit = store.getState().session.githubOctokitInstance as Octokit;

  const loadMission = useCallback(async () => {
    if (octokit === undefined) return;
    const missionData: MissionData = await getMissionData(missionRepoData, octokit);
    selectSourceChapter(missionData.missionMetadata.sourceVersion);
    setBriefingContent(missionData.missionBriefing);
    setTaskList(missionData.tasksData);
    setCachedTaskList(
      missionData.tasksData.map(taskData => {
        const taskDataCopy: TaskData = {
          taskDescription: taskData.taskDescription,
          starterCode: taskData.starterCode,
          savedCode: taskData.savedCode
        };
        return taskDataCopy;
      })
    );
    setCurrentTaskNumber(1);
    handleEditorValueChange(missionData.tasksData[0].savedCode);
  }, [missionRepoData, octokit, handleEditorValueChange]);

  useEffect(() => {
    loadMission();
  }, [loadMission]);

  const getEditedCode = useCallback(
    (questionNumber: number) => {
      return taskList[questionNumber - 1].savedCode;
    },
    [taskList]
  );

  const editCode = useCallback(
    (questionNumber: number, newValue: string) => {
      if (questionNumber > taskList.length) {
        return;
      }

      taskList[questionNumber - 1].savedCode = newValue;
    },
    [taskList]
  );

  const onClickSave = useCallback(async () => {
    if (missionRepoData === undefined) {
      showWarningMessage("You can't save without a mission open!", 2000);
      return;
    }

    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const changedTasks: number[] = [];
    const changedFiles: string[] = [];

    for (let i = 0; i < taskList.length; i++) {
      if (taskList[i].savedCode !== cachedTaskList[i].savedCode) {
        const taskNumber = i + 1;
        changedTasks.push(taskNumber);
        changedFiles.push('Q' + taskNumber + '/SavedCode.js');
      }
    }

    const dialogResults = await promisifyDialog<
      GitHubMissionSaveDialogProps,
      GitHubMissionSaveDialogResolution
    >(GitHubMissionSaveDialog, resolve => ({
      octokit,
      repoName: missionRepoData.repoName,
      changedFiles: changedFiles,
      resolveDialog: dialogResults => resolve(dialogResults)
    }));

    if (!dialogResults.confirmSave) {
      return;
    }

    const authUser = await octokit.users.getAuthenticated();
    const githubName = authUser.data.name;
    const githubEmail = authUser.data.email;
    const commitMessage = dialogResults.commitMessage;

    for (let i = 0; i < changedTasks.length; i++) {
      const changedTask = changedTasks[i];
      const changedFile = changedFiles[i];

      const { saveType } = await checkIfFileCanBeSavedAndGetSaveType(
        octokit,
        missionRepoData.repoOwner,
        missionRepoData.repoName,
        changedFile
      );

      if (saveType === 'Overwrite') {
        await performOverwritingSave(
          octokit,
          missionRepoData.repoOwner,
          missionRepoData.repoName,
          changedFile,
          githubName,
          githubEmail,
          commitMessage,
          getEditedCode(changedTask)
        );
      }

      if (saveType === 'Create') {
        await performCreatingSave(
          octokit,
          missionRepoData.repoOwner,
          missionRepoData.repoName,
          changedFile,
          githubName,
          githubEmail,
          commitMessage,
          getEditedCode(changedTask)
        );
      }
    }

    setCachedTaskList(
      taskList.map(taskData => {
        const taskDataCopy: TaskData = {
          taskDescription: taskData.taskDescription,
          starterCode: taskData.starterCode,
          savedCode: taskData.savedCode
        };
        return taskDataCopy;
      })
    );
  }, [cachedTaskList, getEditedCode, missionRepoData, octokit, taskList]);

  const onClickReset = useCallback(async () => {
    const confirmReset = await showSimpleConfirmDialog({
      title: 'Reset to template code',
      contents: 'Are you sure you want to reset the template?',
      positiveLabel: 'Confirm',
      negativeLabel: 'Cancel'
    });
    if (confirmReset) {
      const originalCode = cachedTaskList[currentTaskNumber - 1].starterCode;
      handleEditorValueChange(originalCode);
      editCode(currentTaskNumber, originalCode);
    }
  }, [cachedTaskList, currentTaskNumber, editCode, handleEditorValueChange]);

  const onClickPrevious = useCallback(() => {
    const newTaskNumber = currentTaskNumber - 1;
    setCurrentTaskNumber(newTaskNumber);
    handleEditorValueChange(getEditedCode(newTaskNumber));
  }, [currentTaskNumber, setCurrentTaskNumber, getEditedCode, handleEditorValueChange]);

  const onClickNext = useCallback(() => {
    const newTaskNumber = currentTaskNumber + 1;
    setCurrentTaskNumber(newTaskNumber);
    handleEditorValueChange(getEditedCode(newTaskNumber));
  }, [currentTaskNumber, setCurrentTaskNumber, getEditedCode, handleEditorValueChange]);

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
      props.handleActiveTabChange(SideContentType.questionOverview);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const onEditorValueChange = React.useCallback(
    val => {
      handleEditorValueChange(val);
      editCode(currentTaskNumber, val);
    },
    [currentTaskNumber, editCode, handleEditorValueChange]
  );

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

  const handleEval = () => {
    props.handleEditorEval();
  };

  const sideContentProps: (p: GitHubAssessmentWorkspaceProps) => SideContentProps = (
    props: GitHubAssessmentWorkspaceProps
  ) => {
    const tabs: SideContentTab[] = [
      {
        label: 'Task',
        iconName: IconNames.NINJA,
        body: <SideContentTaskEditor currentTaskNumber={currentTaskNumber} tasks={taskList} />,
        id: SideContentType.questionOverview,
        toSpawn: () => true
      },
      {
        label: 'Briefing',
        iconName: IconNames.BRIEFCASE,
        body: <SideContentMarkdownEditor content={briefingContent} />,
        id: SideContentType.briefing,
        toSpawn: () => true
      }
    ];

    return {
      handleActiveTabChange: props.handleActiveTabChange,
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      tabs,
      onChange: onChangeTabs,
      workspaceLocation: 'githubAssessment'
    };
  };

  const controlBarProps: () => ControlBarProps = () => {
    const nextButton = (
      <ControlBarNextButton
        onClickNext={onClickNext}
        questionProgress={[currentTaskNumber, taskList.length]}
        key={'next_question'}
      />
    );

    const previousButton = (
      <ControlBarPreviousButton
        onClick={onClickPrevious}
        questionProgress={[currentTaskNumber, taskList.length]}
        key={'previous_question'}
      />
    );

    const questionView = (
      <ControlBarQuestionViewButton
        key={'task_view'}
        questionProgress={[currentTaskNumber, taskList.length]}
      />
    );

    const resetButton = <ControlBarResetButton key="reset" onClick={onClickReset} />;

    const runButton = <ControlBarRunButton handleEditorEval={handleEval} key="run" />;

    const saveButton = (
      <ControlButtonSaveButton hasUnsavedChanges={false} key="save" onClickSave={onClickSave} />
    );

    const handleChapterSelect = () => {};

    const chapterSelect = (
      <ControlBarChapterSelect
        handleChapterSelect={handleChapterSelect}
        sourceChapter={selectedSourceChapter}
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

  const mobileSideContentProps: () => MobileSideContentProps = () => {
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
        ...controlBarProps()
      },
      ...sideContentProps(props),
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

  const editorProps = {
    editorSessionId: '',
    editorValue: props.editorValue!,
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: onEditorValueChange,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: props.handleEditorUpdateBreakpoints,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: false
  };
  const replProps = {
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    output: props.output,
    replValue: props.replValue,
    sourceChapter: selectedSourceChapter || 4,
    sourceVariant: 'default' as Variant,
    externalLibrary: ExternalLibraryName.NONE,
    replButtons: replButtons()
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(),
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: mobileSideContentProps()
  };

  return (
    <div className={classNames('SideContentMissionEditor', Classes.DARK)}>
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
};

export default GitHubAssessmentWorkspace;
