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
import { ControlBarDisplayMCQButton } from '../../commons/controlBar/ControlBarDisplayMCQButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarNextButton } from '../../commons/controlBar/ControlBarNextButton';
import { ControlBarPreviousButton } from '../../commons/controlBar/ControlBarPreviousButton';
import { ControlBarQuestionViewButton } from '../../commons/controlBar/ControlBarQuestionViewButton';
import { ControlBarResetButton } from '../../commons/controlBar/ControlBarResetButton';
import { ControlBarRunButton } from '../../commons/controlBar/ControlBarRunButton';
import { ControlButtonSaveButton } from '../../commons/controlBar/ControlBarSaveButton';
import { ControlBarTaskAddButton } from '../../commons/controlBar/ControlBarTaskAddButton';
import { ControlBarTaskDeleteButton } from '../../commons/controlBar/ControlBarTaskDeleteButton';
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
  GitHubMissionSaveDialog,
  GitHubMissionSaveDialogProps,
  GitHubMissionSaveDialogResolution
} from '../../commons/githubAssessments/GitHubMissionSaveDialog';
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
import SideContentAutograderEditor from '../../commons/sideContent/githubAssessments/SideContentAutograderEditor';
import SideContentMarkdownEditor from '../../commons/sideContent/githubAssessments/SideContentMarkdownEditor';
import SideContentMissionEditor from '../../commons/sideContent/githubAssessments/SideContentMissionEditor';
import SideContentTaskEditor from '../../commons/sideContent/githubAssessments/SideContentTaskEditor';
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

export type GitHubAssessmentWorkspaceProps = DispatchProps & StateProps & RouteComponentProps;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
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
    history.push('/githubassessments/missions');
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
  const [missionRepoData, setMissionRepoData] = React.useState<MissionRepoData>(
    props.location.state as MissionRepoData
  );

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
        autogradingResults: [],
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
  const setUpWithMissionRepoData = useCallback(async () => {
    if (octokit === undefined) return;
    const missionData: MissionData = await getMissionData(missionRepoData, octokit);
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

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);
    handleUpdateHasUnsavedChanges(false);

    let userInTeacherMode = false;
    const userLogin = (await octokit.users.getAuthenticated()).data.login;
    if (userLogin === missionRepoData.repoOwner) {
      // User is direct owner of repo
      userInTeacherMode = true;
    } else {
      const userOrganisations = (await octokit.orgs.listForAuthenticatedUser()).data;
      for (let i = 0; i < userOrganisations.length; i++) {
        const org = userOrganisations[i];

        // User has admin access to an organization owning the repo
        userInTeacherMode = org.login === missionRepoData.repoOwner;
        if (userInTeacherMode) {
          break;
        }
      }
    }
    setIsTeacherMode(userInTeacherMode);

    setIsLoading(false);
    if (missionData.missionBriefing !== '') setShowBriefingOverlay(true);
  }, [changeStateDueToChangedTaskNumber, missionRepoData, octokit, handleUpdateHasUnsavedChanges]);

  /**
   * Sets up the workspace for when the user is creating a new Mission
   */
  const setUpWithoutMissionRepoData = useCallback(() => {
    setSummary(defaultMissionBriefing);

    setMissionMetadata(defaultMissionMetadata);
    setCachedMissionMetadata(defaultMissionMetadata);

    setBriefingContent(defaultMissionBriefing);
    setCachedBriefingContent(defaultMissionBriefing);

    setTaskList([defaultTask]);
    setCachedTaskList([defaultTask]);

    changeStateDueToChangedTaskNumber(1, [defaultTask]);

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);
    handleUpdateHasUnsavedChanges(false);

    setIsTeacherMode(true);
    setIsLoading(false);
  }, [changeStateDueToChangedTaskNumber, handleUpdateHasUnsavedChanges]);

  useEffect(() => {
    if (missionRepoData === undefined) {
      setUpWithoutMissionRepoData();
    } else {
      setUpWithMissionRepoData();
    }
  }, [missionRepoData, setUpWithMissionRepoData, setUpWithoutMissionRepoData]);

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
          newFileContent
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
      await performFolderDeletion(
        octokit,
        missionRepoData.repoOwner,
        missionRepoData.repoName,
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
    const changedFiles = Object.keys(filenameToContentMap).sort();

    const dialogResults = await promisifyDialog<
      GitHubMissionSaveDialogProps,
      GitHubMissionSaveDialogResolution
    >(GitHubMissionSaveDialog, resolve => ({
      repoName: missionRepoData.repoName,
      filesToChangeOrCreate: changedFiles,
      filesToDelete: foldersToDelete,
      resolveDialog: dialogResults => resolve(dialogResults)
    }));

    if (!dialogResults.confirmSave) {
      return;
    }

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = await octokit.users.getAuthenticated();
    const githubName = authUser.data.name;
    const githubEmail = authUser.data.email;
    const commitMessage = dialogResults.commitMessage;

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
    briefingContent,
    cachedBriefingContent,
    taskList,
    cachedTaskList,
    missionMetadata,
    cachedMissionMetadata,
    conductSave,
    conductDelete,
    octokit,
    missionRepoData,
    isTeacherMode
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
    if (missionRepoData !== undefined) {
      saveWithMissionRepoData();
    } else {
      saveWithoutMissionRepoData();
    }
  }, [missionRepoData, saveWithMissionRepoData, saveWithoutMissionRepoData]);

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
    if (shouldProceedToChangeTask(currentTaskNumber, taskList, cachedTaskList, missionRepoData)) {
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
    if (shouldProceedToChangeTask(currentTaskNumber, taskList, cachedTaskList, missionRepoData)) {
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
        autogradingResults: [],
        editorValue: editedTaskList[currentTaskNumber - 1].savedCode,
        editorPrepend: editedTaskList[currentTaskNumber - 1].testPrepend,
        editorPostpend: editedTaskList[currentTaskNumber - 1].testPostpend,
        editorTestcases: editedTaskList[currentTaskNumber - 1].testCases
      });
      handleReplOutputClear();

      setTaskListWrapper(editedTaskList);
    },
    [currentTaskNumber, taskList, handleUpdateWorkspace, handleReplOutputClear, setTaskListWrapper]
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

    const testPrepend = taskList[currentTaskNumber - 1]
      ? taskList[currentTaskNumber - 1].testPrepend
      : '';
    const testPostpend = taskList[currentTaskNumber - 1]
      ? taskList[currentTaskNumber - 1].testPostpend
      : '';
    tabs.push({
      label: 'Testcases',
      iconName: IconNames.AIRPLANE,
      body: (
        <SideContentAutograderEditor
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

    /*
    if (isTeacherMode) {
      // Teachers have ability to edit test cases
      const testPrepend = taskList[currentTaskNumber - 1]
        ? taskList[currentTaskNumber - 1].testPrepend
        : '';
      const testPostpend = taskList[currentTaskNumber - 1]
        ? taskList[currentTaskNumber - 1].testPostpend
        : '';
      tabs.push({
        label: 'Testcases',
        iconName: IconNames.AIRPLANE,
        body: (
          <SideContentAutograderEditor
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
    } else {
      tabs.push({
        label: 'Testcases',
        iconName: IconNames.AIRPLANE,
        body: (
          <SideContentAutograder
            handleTestcaseEval={props.handleTestcaseEval}
            autogradingResults={[]}
            testcases={editorTestcases}
          />
        ),
        id: SideContentType.testcases,
        toSpawn: () => true
      });
    }
    */

    return {
      handleActiveTabChange: props.handleActiveTabChange,
      defaultSelectedTabId: selectedTab,
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
    handleEditorEval: props.handleEditorEval,
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
    editorProps: editorProps,
    replProps: replProps,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    mobileSideContentProps: mobileSideContentProps()
  };

  if (isLoading) {
    return (
      <div className={classNames('missionLoading', Classes.DARK)}>
        <NonIdealState description="Loading Mission" icon={<Spinner size={SpinnerSize.LARGE} />} />
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
