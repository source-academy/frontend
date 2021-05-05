import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import { decompressFromEncodedURIComponent } from 'lz-string';
import React, { useCallback, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';

import { InterpreterOutput, sourceLanguages } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../../commons/controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../../commons/controlBar/ControlBarPreviousButton';
import { ControlBarResetButton } from '../../commons/controlBar/ControlBarResetButton';
import { ControlButtonSaveButton } from '../../commons/controlBar/ControlBarSaveButton';
import { ControlBarTaskViewButton } from '../../commons/controlBar/ControlBarTaskViewButton';
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
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import { SideContentMarkdownEditor } from '../../commons/sideContent/SideContentMarkdownEditor';
import { SideContentTaskEditor } from '../../commons/sideContent/SideContentTaskEditor';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import Constants from '../../commons/utils/Constants';
import { promisifyDialog, showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { stringParamToInt } from '../../commons/utils/ParamParseHelper';
import { parseQuery } from '../../commons/utils/QueryHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import {
  checkIfFileCanBeSavedAndGetSaveType,
  performCreatingSave,
  performOverwritingSave
} from '../../features/github/GitHubUtils';
import { store } from '../createStore';

export type GitHubAssessmentsProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  handleFetchSublanguage: () => void;
  handleGenerateLz: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
  handleToggleEditorAutorun: () => void;
  handleFetchChapter: () => void;
};

export type StateProps = {
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  execTime: number;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  queryString?: string;
  shortURL?: string;
  replValue: string;
  sideContentHeight?: number;
  sourceChapter: number;
  sourceVariant: Variant;
  stepLimit: number;
  externalLibraryName: ExternalLibraryName;
  usingSubst: boolean;
};

function handleHash(hash: string, props: GitHubAssessmentsProps) {
  const qs = parseQuery(hash);

  const programLz = qs.lz ?? qs.prgrm;
  const program = programLz && decompressFromEncodedURIComponent(programLz);
  if (program) {
    props.handleEditorValueChange(program);
  }

  const chapter = stringParamToInt(qs.chap) || undefined;
  const variant: Variant =
    sourceLanguages.find(
      language => language.chapter === chapter && language.variant === qs.variant
    )?.variant ?? 'default';
  if (chapter) {
    props.handleChapterSelect(chapter, variant);
  }
}

const GitHubAssessments: React.FC<GitHubAssessmentsProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.missionTask);

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
   * Handles toggling of relevant SideContentTabs when exiting the mobile breakpoint
   */
  React.useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.missionTask);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const propsRef = React.useRef(props);
  propsRef.current = props;

  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);

  React.useEffect(() => {
    propsRef.current.handleFetchSublanguage();
  }, []);

  const hash = props.location.hash;
  React.useEffect(() => {
    if (!hash) {
      return;
    }
    handleHash(hash, propsRef.current);
  }, [hash]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      isMobileBreakpoint &&
      (selectedTab === SideContentType.introduction ||
        selectedTab === SideContentType.remoteExecution)
    ) {
      props.handleActiveTabChange(SideContentType.mobileEditor);
      setSelectedTab(SideContentType.mobileEditor);
    } else if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const onEditorValueChange = React.useCallback(
    val => {
      propsRef.current.handleEditorValueChange(val);
      editCode(currentTaskNumber, val);
    },
    [currentTaskNumber, editCode]
  );

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      const { handleUsingSubst, handleReplOutputClear, sourceChapter } = propsRef.current;

      /**
       * Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
       */
      if (
        !(
          prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun
        )
      ) {
        if (sourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
          handleUsingSubst(true);
        }

        if (prevTabId === SideContentType.substVisualizer && !hasBreakpoints) {
          handleReplOutputClear();
          handleUsingSubst(false);
        }

        setSelectedTab(newTabId);
      }
    },
    [hasBreakpoints]
  );

  const autorunButtons = React.useMemo(
    () => (
      <ControlBarAutorunButtons
        handleDebuggerPause={props.handleDebuggerPause}
        handleDebuggerReset={props.handleDebuggerReset}
        handleDebuggerResume={props.handleDebuggerResume}
        handleEditorEval={props.handleEditorEval}
        handleInterruptEval={props.handleInterruptEval}
        handleToggleEditorAutorun={props.handleToggleEditorAutorun}
        isDebugging={props.isDebugging}
        isEditorAutorun={props.isEditorAutorun}
        isRunning={props.isRunning}
        key="autorun"
      />
    ),
    [
      props.handleDebuggerPause,
      props.handleDebuggerReset,
      props.handleDebuggerResume,
      props.handleEditorEval,
      props.handleInterruptEval,
      props.handleToggleEditorAutorun,
      props.isDebugging,
      props.isEditorAutorun,
      props.isRunning
    ]
  );

  const chapterSelectHandler = React.useCallback(
    ({ chapter, variant }: { chapter: number; variant: Variant }, e: any) => {
      const { handleUsingSubst, handleReplOutputClear, handleChapterSelect } = propsRef.current;
      if ((chapter <= 2 && hasBreakpoints) || selectedTab === SideContentType.substVisualizer) {
        handleUsingSubst(true);
      }
      if (chapter > 2) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      handleChapterSelect(chapter, variant);
    },
    [hasBreakpoints, selectedTab]
  );

  const chapterSelect = React.useMemo(
    () => (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={selectedSourceChapter}
        sourceVariant={props.sourceVariant}
        disabled={true}
        key="chapter"
      />
    ),
    [chapterSelectHandler, selectedSourceChapter, props.sourceVariant]
  );

  const clearButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarClearButton
          handleReplOutputClear={props.handleReplOutputClear}
          key="clear_repl"
        />
      ),
    [props.handleReplOutputClear, selectedTab]
  );

  const evalButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarEvalButton
          handleReplEval={props.handleReplEval}
          isRunning={props.isRunning}
          key="eval_repl"
        />
      ),
    [props.handleReplEval, props.isRunning, selectedTab]
  );

  const saveButton = React.useMemo(() => {
    return (
      <ControlButtonSaveButton key="save" onClickSave={onClickSave} hasUnsavedChanges={false} />
    );
  }, [onClickSave]);

  const resetButton = React.useMemo(() => {
    return <ControlBarResetButton key="reset" onClick={onClickReset} />;
  }, [onClickReset]);

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [];

    tabs.push({
      label: 'Task',
      iconName: IconNames.NINJA,
      body: <SideContentTaskEditor currentTaskNumber={currentTaskNumber} tasks={taskList} />,
      id: SideContentType.missionTask,
      toSpawn: () => true
    });

    tabs.push({
      label: 'Briefing',
      iconName: IconNames.BRIEFCASE,
      body: <SideContentMarkdownEditor content={briefingContent} />,
      id: SideContentType.missionBriefing,
      toSpawn: () => true
    });

    // Remove this for Phase 2-1.
    // It will be added once we get into Phase 2-2.
    /*
    tabs.push({
      label: 'Editor',
      iconName: IconNames.AIRPLANE,
      body: <SideContentMissionEditor {...props} />,
      id: SideContentType.githubAssessments,
      toSpawn: () => true
    });
    */

    return tabs;
  }, [taskList, currentTaskNumber, briefingContent]);

  // Remove Intro and Remote Execution tabs for mobile
  const mobileTabs = [...tabs];
  mobileTabs.shift();
  mobileTabs.pop();

  const handleEditorUpdateBreakpoints = React.useCallback(
    (breakpoints: string[]) => {
      // get rid of holes in array
      const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
      if (numberOfBreakpoints > 0) {
        setHasBreakpoints(true);
        if (propsRef.current.sourceChapter <= 2) {
          /**
           * There are breakpoints set on Source Chapter 2, so we set the
           * Redux state for the editor to evaluate to the substituter
           */

          propsRef.current.handleUsingSubst(true);
        }
      }
      if (numberOfBreakpoints === 0) {
        setHasBreakpoints(false);

        if (selectedTab !== SideContentType.substVisualizer) {
          propsRef.current.handleReplOutputClear();
          propsRef.current.handleUsingSubst(false);
        }
      }
      propsRef.current.handleEditorUpdateBreakpoints(breakpoints);
    },
    [selectedTab]
  );

  const replDisabled = props.sourceVariant === 'concurrent' || props.sourceVariant === 'wasm';

  const editorProps = {
    sourceChapter: props.sourceChapter,
    externalLibraryName: props.externalLibraryName,
    sourceVariant: props.sourceVariant,
    editorValue: props.editorValue,
    editorSessionId: '',
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: onEditorValueChange,
    handleSendReplInputToOutput: props.handleSendReplInputToOutput,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: props.isEditorAutorun,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints
  };

  const replProps = {
    sourceChapter: props.sourceChapter,
    sourceVariant: props.sourceVariant,
    externalLibrary: props.externalLibraryName,
    output: props.output,
    replValue: props.replValue,
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    hidden: selectedTab === SideContentType.substVisualizer,
    inputHidden: replDisabled,
    usingSubst: props.usingSubst,
    replButtons: [replDisabled ? null : evalButton, clearButton]
  };

  const taskView = (
    <ControlBarTaskViewButton
      key={'task_view'}
      currentask={currentTaskNumber}
      numOfTasks={taskList.length}
    />
  );

  const nextTaskButton = (
    <ControlBarNextButton
      onClickNext={onClickNext}
      questionProgress={[currentTaskNumber, taskList.length]}
      key={'next_question'}
    />
  );

  const prevTaskButton = (
    <ControlBarPreviousButton
      onClick={onClickPrevious}
      questionProgress={[currentTaskNumber, taskList.length]}
      key={'previous_question'}
    />
  );

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, saveButton, resetButton, chapterSelect],
      flowButtons: [prevTaskButton, taskView, nextTaskButton]
    },
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    replProps: replProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs,
      workspaceLocation: 'githubAssessments'
    },
    sideContentIsResizeable: selectedTab !== SideContentType.substVisualizer
  };

  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelect],
        flowButtons: [prevTaskButton, taskView, nextTaskButton]
      },
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs: mobileTabs,
      workspaceLocation: 'githubAssessments',
      handleEditorEval: props.handleEditorEval
    }
  };

  return (
    <div className={classNames('Mission', Classes.DARK)}>
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
};

export default GitHubAssessments;
