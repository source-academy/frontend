import {
  Button,
  Card,
  Classes,
  Dialog,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Testcase } from '../../commons/assessment/AssessmentTypes';
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
import { ControlBarDisplayMCQButton } from '../../commons/controlBar/github/ControlBarDisplayMCQButton';
import { ControlBarTaskAddButton } from '../../commons/controlBar/github/ControlBarTaskAddButton';
import { ControlBarTaskDeleteButton } from '../../commons/controlBar/github/ControlBarTaskDeleteButton';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import {
  GitHubMissionCreateDialog,
  GitHubMissionCreateDialogProps,
  GitHubMissionCreateDialogResolution
} from '../../commons/githubAssessments/GitHubMissionCreateDialog';
import {
  convertIMCQQuestionToMCQText,
  convertToMCQQuestionIfMCQText,
  discoverFilesToBeChangedWithMissionRepoData,
  discoverFilesToBeCreatedWithoutMissionRepoData,
  getMissionData
} from '../../commons/githubAssessments/GitHubMissionDataUtils';
import {
  MissionData,
  MissionMetadata,
  MissionRepoData,
  TaskData
} from '../../commons/githubAssessments/GitHubMissionTypes';
import Markdown from '../../commons/Markdown';
import { MobileSideContentProps } from '../../commons/mobileWorkspace/mobileSideContent/MobileSideContent';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import SideContentMarkdownEditor from '../../commons/sideContent/githubAssessments/SideContentMarkdownEditor';
import SideContentMissionEditor from '../../commons/sideContent/githubAssessments/SideContentMissionEditor';
import SideContentTaskEditor from '../../commons/sideContent/githubAssessments/SideContentTaskEditor';
import SideContentTestcaseEditor from '../../commons/sideContent/githubAssessments/SideContentTestcaseEditor';
import { SideContentProps } from '../../commons/sideContent/SideContent';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import Constants from '../../commons/utils/Constants';
import { promisifyDialog, showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import { history } from '../../commons/utils/HistoryHelper';
import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import { WorkspaceState } from '../../commons/workspace/WorkspaceTypes';
import {
  checkIfFileCanBeSavedAndGetSaveType,
  getGitHubOctokitInstance,
  performCreatingSave,
  performFolderDeletion,
  performOverwritingSave
} from '../../features/github/GitHubUtils';
import {
  defaultMCQQuestion,
  defaultMissionBriefing,
  defaultMissionMetadata,
  defaultTask
} from './GitHubAssessmentDefaultValues';
import { GHAssessmentOverview } from './GitHubClassroom';

export type GitHubAssessmentWorkspaceProps = DispatchProps & StateProps & RouteComponentProps;

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleUpdateWorkspace: (options: Partial<WorkspaceState>) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleRunAllTestcases: () => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

export type StateProps = {
  editorPrepend: string;
  editorValue: string | null;
  editorTestcases: Testcase[];
  editorPostpend: string;
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
  sourceChapter: number;
};

const GitHubAssessmentWorkspace: React.FC<GitHubAssessmentWorkspaceProps> = props => {
  const octokit = getGitHubOctokitInstance();

  if (octokit === undefined) {
    history.push('/githubassessments/login');
  }

  /**
   * State variables relating to information we are concerned with saving
   */
  const [missionMetadata, setMissionMetadata] = React.useState(defaultMissionMetadata);
  const [cachedMissionMetadata, setCachedMissionMetadata] = React.useState(defaultMissionMetadata);
  const [hasUnsavedChangesToMetadata, setHasUnsavedChangesToMetadata] = React.useState(false);

  const [briefingContent, setBriefingContent] = React.useState(defaultMissionBriefing);
  const [cachedBriefingContent, setCachedBriefingContent] = React.useState(defaultMissionBriefing);
  const [hasUnsavedChangesToBriefing, setHasUnsavedChangesToBriefing] = React.useState(false);

  const [cachedTaskList, setCachedTaskList] = React.useState<TaskData[]>([]);
  const [taskList, setTaskList] = React.useState<TaskData[]>([]);
  const [hasUnsavedChangesToTasks, setHasUnsavedChangesToTasks] = React.useState(false);

  /**
   * State variables relating to the rendering and function of the workspace
   */
  const [summary, setSummary] = React.useState('');
  const [currentTaskNumber, setCurrentTaskNumber] = React.useState(0);
  const [isTeacherMode, setIsTeacherMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentTaskIsMCQ, setCurrentTaskIsMCQ] = React.useState(false);
  const [displayMCQInEditor, setDisplayMCQInEditor] = React.useState(true);
  const [mcqQuestion, setMCQQuestion] = React.useState(defaultMCQQuestion);
  const [missionRepoData, setMissionRepoData] = React.useState<MissionRepoData | undefined>(
    undefined
  );
  const assessmentOverview = props.location.state as GHAssessmentOverview;

  const [showBriefingOverlay, setShowBriefingOverlay] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.questionOverview);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  /**
   * Unpacked properties
   */
  const hasUnsavedChanges = props.hasUnsavedChanges;
  const editorTestcases = props.editorTestcases;
  const handleEditorValueChange = props.handleEditorValueChange;
  const handleUpdateWorkspace = props.handleUpdateWorkspace;
  const handleUpdateHasUnsavedChanges = props.handleUpdateHasUnsavedChanges;
  const handleReplOutputClear = props.handleReplOutputClear;

  /**
   * Should be called to change the task number, rather than using setCurrentTaskNumber
   */
  const changeStateDueToChangedTaskNumber = useCallback(
    (newTaskNumber: number, currentTaskList: TaskData[]) => {
      setCurrentTaskNumber(newTaskNumber);
      const actualTaskIndex = newTaskNumber - 1;

      handleUpdateWorkspace({
        editorValue: currentTaskList[actualTaskIndex].savedCode,
        editorPrepend: currentTaskList[actualTaskIndex].testPrepend,
        editorPostpend: currentTaskList[actualTaskIndex].testPostpend,
        editorTestcases: currentTaskList[actualTaskIndex].testCases
      });
      handleReplOutputClear();

      const [isMCQText, mcqQuestion] = convertToMCQQuestionIfMCQText(
        currentTaskList[actualTaskIndex].savedCode
      );

      setCurrentTaskIsMCQ(isMCQText);
      setMCQQuestion(mcqQuestion);
    },
    [handleUpdateWorkspace, handleReplOutputClear]
  );

  const setBriefingContentWrapper = useCallback(
    (newBriefingContent: string) => {
      setBriefingContent(newBriefingContent);
      setHasUnsavedChangesToBriefing(newBriefingContent !== cachedBriefingContent);
    },
    [cachedBriefingContent]
  );

  const setMissionMetadataWrapper = useCallback(
    (newMissionMetadata: MissionMetadata) => {
      setMissionMetadata(newMissionMetadata);
      setHasUnsavedChangesToMetadata(!isEqual(newMissionMetadata, cachedMissionMetadata));
    },
    [cachedMissionMetadata]
  );

  const setTaskListWrapper = useCallback(
    (newTaskList: TaskData[]) => {
      setTaskList(newTaskList);
      setHasUnsavedChangesToTasks(!isEqual(newTaskList, cachedTaskList));
    },
    [cachedTaskList]
  );

  const setDisplayMCQInEditorWrapper = useCallback(
    (shouldDisplayMCQ: boolean) => {
      if (shouldDisplayMCQ) {
        const [isMCQText, mcqQuestion] = convertToMCQQuestionIfMCQText(
          taskList[currentTaskNumber - 1].savedCode
        );
        setCurrentTaskIsMCQ(isMCQText);
        setMCQQuestion(mcqQuestion);
      }

      setDisplayMCQInEditor(shouldDisplayMCQ);
    },
    [taskList, currentTaskNumber]
  );

  // Forces a re-render when saveable information changes, keeps environment state in-sync with component state
  const computedHasUnsavedChanges = useMemo(() => {
    return hasUnsavedChangesToMetadata || hasUnsavedChangesToBriefing || hasUnsavedChangesToTasks;
  }, [hasUnsavedChangesToMetadata, hasUnsavedChangesToBriefing, hasUnsavedChangesToTasks]);

  useEffect(() => {
    if (computedHasUnsavedChanges !== hasUnsavedChanges) {
      handleUpdateHasUnsavedChanges(computedHasUnsavedChanges);
    }
  }, [computedHasUnsavedChanges, hasUnsavedChanges, handleUpdateHasUnsavedChanges]);

  /**
   * Sets up the workspace for when the user is retrieving Mission information from a GitHub repository
   */
  const setUpWithAssessmentOverview = useCallback(async () => {
    if (octokit === undefined) return;

    const missionRepoData = assessmentOverview.missionRepoData;

    const missionDataPromise = getMissionData(missionRepoData, octokit);
    const isTeacherModePromise = octokit.users.getAuthenticated().then((authenticatedUser: any) => {
      const userLogin = authenticatedUser.data.login;
      return userLogin === missionRepoData.repoOwner;
    });

    const promises = [missionDataPromise, isTeacherModePromise];

    Promise.all(promises).then((promises: any[]) => {
      setMissionRepoData(missionRepoData);

      setHasUnsavedChangesToTasks(false);
      setHasUnsavedChangesToBriefing(false);
      setHasUnsavedChangesToMetadata(false);
      handleUpdateHasUnsavedChanges(false);

      const missionData: MissionData = promises[0];
      setSummary(missionData.missionBriefing);

      setMissionMetadata(missionData.missionMetadata);
      setCachedMissionMetadata(missionData.missionMetadata);

      setBriefingContent(missionData.missionBriefing);
      setCachedBriefingContent(missionData.missionBriefing);

      setTaskList(missionData.tasksData);
      setCachedTaskList(
        missionData.tasksData.map((taskData: TaskData) => Object.assign({}, taskData))
      );

      changeStateDueToChangedTaskNumber(1, missionData.tasksData);

      const isTeacherMode: boolean = promises[1];
      setIsTeacherMode(isTeacherMode);

      setIsLoading(false);
    });
  }, [
    assessmentOverview,
    octokit,
    changeStateDueToChangedTaskNumber,
    handleUpdateHasUnsavedChanges
  ]);

  /**
   * Sets up the workspace for when the user is creating a new Mission
   */
  const setUpWithoutAssessmentOverview = useCallback(() => {
    setSummary(defaultMissionBriefing);

    setMissionMetadata(defaultMissionMetadata);
    setCachedMissionMetadata(defaultMissionMetadata);

    setBriefingContent(defaultMissionBriefing);
    setCachedBriefingContent(defaultMissionBriefing);

    setTaskList([defaultTask]);
    setCachedTaskList([defaultTask]);

    setDisplayMCQInEditor(false);
    changeStateDueToChangedTaskNumber(1, [defaultTask]);

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);
    handleUpdateHasUnsavedChanges(false);

    setIsTeacherMode(true);
    setIsLoading(false);
  }, [changeStateDueToChangedTaskNumber, handleUpdateHasUnsavedChanges]);

  useEffect(() => {
    if (assessmentOverview === undefined) {
      setUpWithoutAssessmentOverview();
    } else {
      setUpWithAssessmentOverview();
    }
  }, [assessmentOverview, setUpWithAssessmentOverview, setUpWithoutAssessmentOverview]);

  const briefingOverlay = (
    <Dialog className="assessment-briefing" isOpen={showBriefingOverlay}>
      <Card>
        <Markdown content={summary} />
        <Button
          className="assessment-briefing-button"
          onClick={() => setShowBriefingOverlay(false)}
          text="Continue"
        />
      </Card>
    </Dialog>
  );

  /**
   * Handles the changes to the taskList
   */
  const editCode = useCallback(
    (taskNumber: number, newValue: string) => {
      if (taskNumber > taskList.length) {
        return;
      }
      const editedTaskList = taskList.map((taskData: TaskData) => Object.assign({}, taskData));
      editedTaskList[taskNumber - 1] = {
        ...editedTaskList[taskNumber - 1],
        savedCode: newValue
      };

      setTaskListWrapper(editedTaskList);
    },
    [taskList, setTaskListWrapper]
  );

  const resetToTemplate = useCallback(() => {
    const originalCode = taskList[currentTaskNumber - 1].starterCode;
    handleEditorValueChange(originalCode);
    editCode(currentTaskNumber, originalCode);
  }, [currentTaskNumber, editCode, handleEditorValueChange, taskList]);

  const conductSave = useCallback(
    async (
      changedFile: string,
      newFileContent: string,
      githubName: string | null,
      githubEmail: string | null,
      commitMessage: string
    ) => {
      const typedMissionRepoData = missionRepoData as MissionRepoData;

      const { saveType } = await checkIfFileCanBeSavedAndGetSaveType(
        octokit,
        typedMissionRepoData.repoOwner,
        typedMissionRepoData.repoName,
        changedFile
      );

      if (saveType === 'Overwrite') {
        await performOverwritingSave(
          octokit,
          typedMissionRepoData.repoOwner,
          typedMissionRepoData.repoName,
          changedFile,
          githubName,
          githubEmail,
          commitMessage,
          newFileContent
        );
      }

      if (saveType === 'Create') {
        await performCreatingSave(
          octokit,
          typedMissionRepoData.repoOwner,
          typedMissionRepoData.repoName,
          changedFile,
          githubName,
          githubEmail,
          commitMessage,
          newFileContent
        );
      }
    },
    [missionRepoData, octokit]
  );

  const conductDelete = useCallback(
    async (
      fileName: string,
      githubName: string | null,
      githubEmail: string | null,
      commitMessage: string
    ) => {
      const typedMissionRepoData = missionRepoData as MissionRepoData;

      await performFolderDeletion(
        octokit,
        typedMissionRepoData.repoOwner,
        typedMissionRepoData.repoName,
        fileName,
        githubName,
        githubEmail,
        commitMessage
      );
    },
    [missionRepoData, octokit]
  );

  /**
   * To be used when the information to be saved corresponds to an existing GitHub repository
   */
  const saveWithMissionRepoData = useCallback(async () => {
    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const [filenameToContentMap, foldersToDelete] = discoverFilesToBeChangedWithMissionRepoData(
      missionMetadata,
      cachedMissionMetadata,
      briefingContent,
      cachedBriefingContent,
      taskList,
      cachedTaskList,
      isTeacherMode
    );
    const changedFiles = Object.keys(filenameToContentMap);

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = await octokit.users.getAuthenticated();
    const githubName = authUser.data.name;
    const githubEmail = authUser.data.email;
    const commitMessage = '';

    for (let i = 0; i < foldersToDelete.length; i++) {
      await conductDelete(foldersToDelete[i], githubName, githubEmail, commitMessage);
    }

    for (let i = 0; i < changedFiles.length; i++) {
      const filename = changedFiles[i];
      const newFileContent = filenameToContentMap[filename];
      await conductSave(filename, newFileContent, githubName, githubEmail, commitMessage);
    }

    setCachedTaskList(taskList);
    setCachedBriefingContent(briefingContent);
    setCachedMissionMetadata(missionMetadata);

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);
  }, [
    octokit,
    isTeacherMode,
    briefingContent,
    missionMetadata,
    taskList,
    cachedTaskList,
    cachedBriefingContent,
    cachedMissionMetadata,
    conductSave,
    conductDelete
  ]);

  /**
   * To be used when the information to be saved to a new GitHub repository
   */
  const saveWithoutMissionRepoData = useCallback(async () => {
    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const filenameToContentMap = discoverFilesToBeCreatedWithoutMissionRepoData(
      missionMetadata,
      briefingContent,
      taskList
    );

    const changedFiles = Object.keys(filenameToContentMap).sort();
    const authUser = await octokit.users.getAuthenticated();

    const dialogResults = await promisifyDialog<
      GitHubMissionCreateDialogProps,
      GitHubMissionCreateDialogResolution
    >(GitHubMissionCreateDialog, resolve => ({
      filesToCreate: changedFiles,
      userLogin: authUser.data.login,
      resolveDialog: dialogResults => resolve(dialogResults)
    }));

    if (!dialogResults.confirmSave) {
      return;
    }

    const githubName = authUser.data.name;
    const githubEmail = authUser.data.email;
    const repoName = dialogResults.repoName;
    const repoOwner = authUser.data.login;

    try {
      await octokit.repos.createForAuthenticatedUser({
        name: repoName
      });

      for (let i = 0; i < changedFiles.length; i++) {
        const fileToCreate = changedFiles[i];
        const fileContent = filenameToContentMap[fileToCreate];

        await performCreatingSave(
          octokit,
          repoOwner,
          repoName,
          fileToCreate,
          githubName,
          githubEmail,
          'Repository created from Source Academy',
          fileContent
        );
      }

      setCachedTaskList(taskList);
      setCachedBriefingContent(briefingContent);
      setCachedMissionMetadata(missionMetadata);

      setHasUnsavedChangesToTasks(false);
      setHasUnsavedChangesToBriefing(false);
      setHasUnsavedChangesToMetadata(false);

      setMissionRepoData({
        repoOwner: repoOwner,
        repoName: repoName,
        dateOfCreation: new Date()
      });
    } catch (err) {
      console.error(err);
      showWarningMessage('Something went wrong while creating the repository!', 2000);
    }
  }, [briefingContent, missionMetadata, octokit, taskList]);

  const onClickSave = useCallback(() => {
    if (assessmentOverview !== undefined && new Date() > assessmentOverview.dueDate) {
      showWarningMessage('It is past the due date for this assessment!');
      return;
    }

    if (missionRepoData !== undefined) {
      saveWithMissionRepoData();
    } else {
      saveWithoutMissionRepoData();
    }
  }, [assessmentOverview, missionRepoData, saveWithMissionRepoData, saveWithoutMissionRepoData]);

  const onClickReset = useCallback(async () => {
    const confirmReset = await showSimpleConfirmDialog({
      contents: (
        <div className={Classes.DIALOG_BODY}>
          <Markdown content="Are you sure you want to reset the template?" />
          <Markdown content="*Note this will not affect the saved copy of your program, unless you save over it.*" />
        </div>
      ),
      negativeLabel: 'Cancel',
      positiveIntent: 'primary',
      positiveLabel: 'Confirm'
    });

    if (confirmReset) {
      resetToTemplate();
    }
  }, [resetToTemplate]);

  /**
   * Checks to ensure that the user wants to discard their current changes
   */
  const shouldProceedToChangeTask = useCallback(
    (
      currentTaskNumber: number,
      taskList: TaskData[],
      cachedTaskList: TaskData[],
      missionRepoData: MissionRepoData
    ) => {
      if (missionRepoData === undefined) {
        return true;
      }

      const taskIndex = currentTaskNumber - 1;
      if (!isEqual(taskList[taskIndex], cachedTaskList[taskIndex])) {
        return window.confirm(
          'You have unsaved changes to the current question. Are you sure you want to continue?'
        );
      }

      return true;
    },
    []
  );

  const onClickPrevious = useCallback(() => {
    if (
      shouldProceedToChangeTask(
        currentTaskNumber,
        taskList,
        cachedTaskList,
        missionRepoData as MissionRepoData
      )
    ) {
      let activeTaskList = taskList;
      if (missionRepoData !== undefined) {
        activeTaskList = cachedTaskList.map((taskData: TaskData) => Object.assign({}, taskData));
        setTaskListWrapper(activeTaskList);
      }
      const newTaskNumber = currentTaskNumber - 1;
      changeStateDueToChangedTaskNumber(newTaskNumber, activeTaskList);
    }
  }, [
    currentTaskNumber,
    taskList,
    cachedTaskList,
    missionRepoData,
    setTaskListWrapper,
    shouldProceedToChangeTask,
    changeStateDueToChangedTaskNumber
  ]);

  const onClickNext = useCallback(() => {
    if (
      shouldProceedToChangeTask(
        currentTaskNumber,
        taskList,
        cachedTaskList,
        missionRepoData as MissionRepoData
      )
    ) {
      let activeTaskList = taskList;
      if (missionRepoData !== undefined) {
        activeTaskList = cachedTaskList.map((taskData: TaskData) => Object.assign({}, taskData));
        setTaskListWrapper(activeTaskList);
      }
      const newTaskNumber = currentTaskNumber + 1;
      changeStateDueToChangedTaskNumber(newTaskNumber, activeTaskList);
    }
  }, [
    currentTaskNumber,
    taskList,
    cachedTaskList,
    missionRepoData,
    setTaskListWrapper,
    shouldProceedToChangeTask,
    changeStateDueToChangedTaskNumber
  ]);

  const onClickReturn = useCallback(() => {
    history.push('/githubassessments/missions');
  }, []);

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

    // Run testcases when the GitHub testcases tab is selected
    if (activeTab.current === SideContentType.testcases) {
      props.handleRunAllTestcases();
    }
  };

  const setTaskDescriptions = useCallback(
    (newTaskDescriptions: string[]) => {
      const newTaskList: TaskData[] = [];

      for (let i = 0; i < taskList.length; i++) {
        const nextElement = Object.assign({}, taskList[i]) as TaskData;
        nextElement.taskDescription = newTaskDescriptions[i];
        newTaskList.push(nextElement);
      }

      setTaskListWrapper(newTaskList);
    },
    [taskList, setTaskListWrapper]
  );

  const setTaskTestcases = useCallback(
    (newTestcases: Testcase[]) => {
      const editedTaskList = taskList.map((taskData: TaskData) => Object.assign({}, taskData));
      editedTaskList[currentTaskNumber - 1] = {
        ...editedTaskList[currentTaskNumber - 1],
        testCases: newTestcases
      };

      handleUpdateWorkspace({
        editorTestcases: editedTaskList[currentTaskNumber - 1].testCases
      });

      setTaskListWrapper(editedTaskList);
    },
    [currentTaskNumber, taskList, handleUpdateWorkspace, setTaskListWrapper]
  );

  const setTestPrepend = useCallback(
    (newTestPrepend: string) => {
      const editedTaskList = taskList.map((taskData: TaskData) => Object.assign({}, taskData));
      editedTaskList[currentTaskNumber - 1] = {
        ...editedTaskList[currentTaskNumber - 1],
        testPrepend: newTestPrepend
      };
      setTaskListWrapper(editedTaskList);
    },
    [currentTaskNumber, taskList, setTaskListWrapper]
  );

  const setTestPostpend = useCallback(
    (newTestPostpend: string) => {
      const editedTaskList = taskList.map((taskData: TaskData) => Object.assign({}, taskData));
      editedTaskList[currentTaskNumber - 1] = {
        ...editedTaskList[currentTaskNumber - 1],
        testPostpend: newTestPostpend
      };
      setTaskListWrapper(editedTaskList);
    },
    [currentTaskNumber, taskList, setTaskListWrapper]
  );

  const sideContentProps: (p: GitHubAssessmentWorkspaceProps) => SideContentProps = (
    props: GitHubAssessmentWorkspaceProps
  ) => {
    const tabs: SideContentTab[] = [
      {
        label: 'Task',
        iconName: IconNames.NINJA,
        body: (
          <SideContentTaskEditor
            allowEdits={isTeacherMode}
            currentTaskNumber={currentTaskNumber}
            taskDescriptions={taskList.map(taskData => taskData.taskDescription)}
            setTaskDescriptions={setTaskDescriptions}
          />
        ),
        id: SideContentType.questionOverview,
        toSpawn: () => true
      },
      {
        label: 'Briefing',
        iconName: IconNames.BRIEFCASE,
        body: (
          <SideContentMarkdownEditor
            allowEdits={isTeacherMode}
            content={briefingContent}
            setContent={setBriefingContentWrapper}
          />
        ),
        id: SideContentType.briefing,
        toSpawn: () => true
      }
    ];

    const taskIndex = currentTaskNumber - 1;
    const testPrepend = taskList[taskIndex] ? taskList[taskIndex].testPrepend : '';
    const testPostpend = taskList[taskIndex] ? taskList[taskIndex].testPostpend : '';
    tabs.push({
      label: 'Testcases',
      iconName: IconNames.AIRPLANE,
      body: (
        <SideContentTestcaseEditor
          allowEdits={isTeacherMode}
          testcases={editorTestcases}
          testPrepend={testPrepend}
          testPostpend={testPostpend}
          setTaskTestcases={setTaskTestcases}
          setTestPrepend={setTestPrepend}
          setTestPostpend={setTestPostpend}
          handleTestcaseEval={props.handleTestcaseEval}
        />
      ),
      id: SideContentType.testcases,
      toSpawn: () => true
    });

    if (isTeacherMode) {
      // Teachers have ability to edit mission metadata
      tabs.push({
        label: 'Mission Metadata',
        iconName: IconNames.BUILD,
        body: (
          <SideContentMissionEditor
            missionMetadata={missionMetadata}
            setMissionMetadata={setMissionMetadataWrapper}
          />
        ),
        id: SideContentType.missionMetadata,
        toSpawn: () => true
      });
    }

    return {
      selectedTabId: selectedTab,
      tabs,
      onChange: onChangeTabs,
      workspaceLocation: 'githubAssessment'
    };
  };

  const addNewQuestion = () => {
    const newTaskList = taskList
      .slice(0, currentTaskNumber)
      .concat([defaultTask])
      .concat(taskList.slice(currentTaskNumber, taskList.length));
    setTaskListWrapper(newTaskList);

    const newTaskNumber = currentTaskNumber + 1;
    changeStateDueToChangedTaskNumber(newTaskNumber, newTaskList);
  };

  const deleteCurrentQuestion = () => {
    const deleteAtIndex = currentTaskNumber - 1;

    const newTaskList = taskList
      .slice(0, deleteAtIndex)
      .concat(taskList.slice(currentTaskNumber, taskList.length));
    setTaskListWrapper(newTaskList);

    const newTaskNumber = currentTaskNumber === 1 ? currentTaskNumber : currentTaskNumber - 1;
    changeStateDueToChangedTaskNumber(newTaskNumber, newTaskList);
  };

  const controlBarProps: () => ControlBarProps = () => {
    const runButton = <ControlBarRunButton handleEditorEval={handleEval} key="run" />;

    const saveButton = (
      <ControlButtonSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        key="save"
        onClickSave={onClickSave}
      />
    );

    const resetButton = <ControlBarResetButton key="reset" onClick={onClickReset} />;

    const chapterSelect = (
      <ControlBarChapterSelect
        handleChapterSelect={() => {}}
        sourceChapter={missionMetadata.sourceVersion}
        sourceVariant={Constants.defaultSourceVariant as Variant}
        disabled={true}
        key="chapter"
      />
    );

    const nextButton = (
      <ControlBarNextButton
        onClickNext={onClickNext}
        onClickReturn={onClickReturn}
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

    const editorButtons = !isMobileBreakpoint
      ? [runButton, saveButton, resetButton, chapterSelect]
      : [saveButton, resetButton];

    if (isTeacherMode) {
      const addTaskButton = (
        <ControlBarTaskAddButton
          addNewQuestion={addNewQuestion}
          numberOfTasks={taskList.length}
          key={'add_task'}
        />
      );
      const deleteTaskButton = (
        <ControlBarTaskDeleteButton
          deleteCurrentQuestion={deleteCurrentQuestion}
          numberOfTasks={taskList.length}
          key={'delete_task'}
        />
      );
      const showMCQButton = (
        <ControlBarDisplayMCQButton
          displayMCQInEditor={() => setDisplayMCQInEditorWrapper(true)}
          displayTextInEditor={() => setDisplayMCQInEditorWrapper(false)}
          mcqDisplayed={displayMCQInEditor}
          key={'display MCQ'}
        />
      );

      editorButtons.push(addTaskButton);
      editorButtons.push(deleteTaskButton);
      editorButtons.push(showMCQButton);
    }

    const flowButtons = [previousButton, questionView, nextButton];

    return {
      editorButtons: editorButtons,
      flowButtons: flowButtons
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

      // Do nothing when clicking the mobile 'Run' tab while on the testcases tab.
      if (
        !(prevTabId === SideContentType.testcases && newTabId === SideContentType.mobileEditorRun)
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
      <ControlBarClearButton handleReplOutputClear={handleReplOutputClear} key="clear_repl" />
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

  const handleMCQSubmit = useCallback(
    (choiceId: number) => {
      if (!currentTaskIsMCQ) {
        return;
      }

      const newMCQQuestion = Object.assign({}, mcqQuestion);
      newMCQQuestion.answer = choiceId;

      setMCQQuestion(newMCQQuestion);
      editCode(currentTaskNumber, convertIMCQQuestionToMCQText(newMCQQuestion));
    },
    [currentTaskIsMCQ, currentTaskNumber, editCode, mcqQuestion]
  );

  const mcqProps = useMemo(() => {
    return currentTaskIsMCQ && displayMCQInEditor
      ? {
          mcq: mcqQuestion,
          handleMCQSubmit: handleMCQSubmit
        }
      : undefined;
  }, [currentTaskIsMCQ, displayMCQInEditor, mcqQuestion, handleMCQSubmit]);

  const editorProps = {
    editorSessionId: '',
    editorValue: props.editorValue!,
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: handleEval,
    handleEditorValueChange: onEditorValueChange,
    handleUpdateHasUnsavedChanges: handleUpdateHasUnsavedChanges,
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
    sourceChapter: missionMetadata.sourceVersion || 4,
    sourceVariant: 'default' as Variant,
    externalLibrary: ExternalLibraryName.NONE,
    replButtons: replButtons()
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(),
    editorProps: currentTaskIsMCQ && displayMCQInEditor ? undefined : editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: currentTaskIsMCQ && displayMCQInEditor ? undefined : editorProps,
    replProps: replProps,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    mobileSideContentProps: mobileSideContentProps()
  };

  if (isLoading) {
    return (
      <div className={classNames('missionLoading', Classes.DARK)}>
        <NonIdealState description="Loading" icon={<Spinner size={SpinnerSize.LARGE} />} />
      </div>
    );
  } else {
    return (
      <div className={classNames('WorkspaceParent', Classes.DARK)}>
        {briefingOverlay}
        {isMobileBreakpoint ? (
          <MobileWorkspace {...mobileWorkspaceProps} />
        ) : (
          <Workspace {...workspaceProps} />
        )}
      </div>
    );
  }
};

export default GitHubAssessmentWorkspace;
