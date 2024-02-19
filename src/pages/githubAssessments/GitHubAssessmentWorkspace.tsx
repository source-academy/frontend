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
import { Chapter, Variant } from 'js-slang/dist/types';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  clearReplOutput,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  runAllTestcases,
  setEditorBreakpoint,
  updateActiveEditorTabIndex,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateWorkspace
} from 'src/commons/workspace/WorkspaceActions';
import classes from 'src/styles/GithubAssessments.module.scss';

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
import {
  convertEditorTabStateToProps,
  NormalEditorContainerProps
} from '../../commons/editor/EditorContainer';
import { Position } from '../../commons/editor/EditorTypes';
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
import { showWarningMessage } from '../../commons/utils/notifications/NotificationsHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import { WorkspaceLocation, WorkspaceState } from '../../commons/workspace/WorkspaceTypes';
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

const workspaceLocation: WorkspaceLocation = 'githubAssessment';

const GitHubAssessmentWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const octokit = getGitHubOctokitInstance();

  if (octokit === undefined) {
    navigate('/githubassessments/login');
  }

  // Handlers migrated over from deprecated withRouter implementation
  const {
    handleEditorEval,
    handleEditorValueChange,
    handleReplEval,
    handleReplOutputClear,
    handleUpdateHasUnsavedChanges,
    handleUpdateWorkspace,
    setActiveEditorTabIndex,
    removeEditorTabByIndex
  } = useMemo(() => {
    return {
      handleEditorEval: () => dispatch(evalEditor(workspaceLocation)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue)),
      handleReplEval: () => dispatch(evalRepl(workspaceLocation)),
      handleReplOutputClear: () => dispatch(clearReplOutput(workspaceLocation)),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        dispatch(updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges)),
      handleUpdateWorkspace: (options: Partial<WorkspaceState>) =>
        dispatch(updateWorkspace(workspaceLocation, options)),
      setActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(removeEditorTab(workspaceLocation, editorTabIndex))
    };
  }, [dispatch]);

  /**
   * State variables relating to information we are concerned with saving
   */
  const [missionMetadata, setMissionMetadata] = useState(defaultMissionMetadata);
  const [cachedMissionMetadata, setCachedMissionMetadata] = useState(defaultMissionMetadata);
  const [hasUnsavedChangesToMetadata, setHasUnsavedChangesToMetadata] = useState(false);

  const [briefingContent, setBriefingContent] = useState(defaultMissionBriefing);
  const [cachedBriefingContent, setCachedBriefingContent] = useState(defaultMissionBriefing);
  const [hasUnsavedChangesToBriefing, setHasUnsavedChangesToBriefing] = useState(false);

  const [cachedTaskList, setCachedTaskList] = useState<TaskData[]>([]);
  const [taskList, setTaskList] = useState<TaskData[]>([]);
  const [hasUnsavedChangesToTasks, setHasUnsavedChangesToTasks] = useState(false);

  /**
   * State variables relating to the rendering and function of the workspace
   */
  const [summary, setSummary] = useState('');
  const [currentTaskNumber, setCurrentTaskNumber] = useState(0);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTaskIsMCQ, setCurrentTaskIsMCQ] = useState(false);
  const [displayMCQInEditor, setDisplayMCQInEditor] = useState(true);
  const [mcqQuestion, setMCQQuestion] = useState(defaultMCQQuestion);
  const [missionRepoData, setMissionRepoData] = useState<MissionRepoData | undefined>(undefined);
  const assessmentOverview = location.state as GHAssessmentOverview;

  const [showBriefingOverlay, setShowBriefingOverlay] = useState(false);
  const [selectedTab, setSelectedTab] = useState(SideContentType.questionOverview);
  const { isMobileBreakpoint } = useResponsive();

  const {
    isFolderModeEnabled,
    activeEditorTabIndex,
    editorTabs,
    editorTestcases,
    hasUnsavedChanges,
    isRunning,
    output,
    replValue,
    sideContentHeight
  } = useTypedSelector(state => state.workspaces.githubAssessment);

  /**
   * Should be called to change the task number, rather than using setCurrentTaskNumber
   */
  const changeStateDueToChangedTaskNumber = useCallback(
    (newTaskNumber: number, currentTaskList: TaskData[]) => {
      setCurrentTaskNumber(newTaskNumber);
      const actualTaskIndex = newTaskNumber - 1;

      handleUpdateWorkspace({
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        editorTabs: [
          {
            value: currentTaskList[actualTaskIndex].savedCode,
            highlightedLines: [],
            breakpoints: []
          }
        ],
        programPrependValue: currentTaskList[actualTaskIndex].testPrepend,
        programPostpendValue: currentTaskList[actualTaskIndex].testPostpend,
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
    if (assessmentOverview === undefined || assessmentOverview === null) {
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
    // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
    handleEditorValueChange(0, originalCode);
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
    navigate('/githubassessments/missions');
  }, [navigate]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.questionOverview);
    }
  }, [isMobileBreakpoint, selectedTab]);

  const onEditorValueChange = useCallback(
    (editorTabIndex: number, val: string) => {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange(0, val);
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
  const activeTab = useRef(selectedTab);
  activeTab.current = selectedTab;
  const handleEval = () => {
    handleEditorEval();

    // Run testcases when the GitHub testcases tab is selected
    if (activeTab.current === SideContentType.testcases) {
      dispatch(runAllTestcases(workspaceLocation));
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

  const sideContentProps: () => SideContentProps = () => {
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
        id: SideContentType.questionOverview
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
        id: SideContentType.briefing
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
          handleTestcaseEval={testcaseId => dispatch(evalTestcase(workspaceLocation, testcaseId))}
        />
      ),
      id: SideContentType.testcases
    });

    if (isTeacherMode) {
      // Teachers have ability to edit mission metadata
      tabs.push({
        label: 'Mission Metadata',
        iconName: IconNames.BUILD,
        body: (
          <SideContentMissionEditor
            isFolderModeEnabled={isFolderModeEnabled}
            missionMetadata={missionMetadata}
            setMissionMetadata={setMissionMetadataWrapper}
          />
        ),
        id: SideContentType.missionMetadata
      });
    }

    return {
      selectedTabId: selectedTab,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      onChange: onChangeTabs,
      workspaceLocation: workspaceLocation
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
    const runButton = (
      <ControlBarRunButton
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        handleEditorEval={handleEval}
        key="run"
      />
    );

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
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={missionMetadata.sourceVersion}
        sourceVariant={Constants.defaultSourceVariant}
        disabled={true}
        key="chapter"
      />
    );

    const nextButton = (
      <ControlBarNextButton
        onClickNext={onClickNext}
        onClickReturn={onClickReturn}
        questionProgress={[currentTaskNumber, taskList.length]}
        key="next_question"
      />
    );

    const previousButton = (
      <ControlBarPreviousButton
        onClick={onClickPrevious}
        questionProgress={[currentTaskNumber, taskList.length]}
        key="previous_question"
      />
    );

    const questionView = (
      <ControlBarQuestionViewButton
        key="task_view"
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
          key="add_task"
        />
      );
      const deleteTaskButton = (
        <ControlBarTaskDeleteButton
          deleteCurrentQuestion={deleteCurrentQuestion}
          numberOfTasks={taskList.length}
          key="delete_task"
        />
      );
      const showMCQButton = (
        <ControlBarDisplayMCQButton
          displayMCQInEditor={() => setDisplayMCQInEditorWrapper(true)}
          displayTextInEditor={() => setDisplayMCQInEditorWrapper(false)}
          mcqDisplayed={displayMCQInEditor}
          key="display MCQ"
        />
      );

      editorButtons.push(addTaskButton, deleteTaskButton, showMCQButton);
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

    const sideContent = sideContentProps();

    return {
      mobileControlBarProps: {
        ...controlBarProps()
      },
      ...sideContent,
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
      <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
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

  const editorContainerProps: NormalEditorContainerProps = {
    editorVariant: 'normal',
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    editorSessionId: '',
    handleDeclarationNavigate: (cursorPosition: Position) =>
      dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
    handleEditorEval: handleEval,
    handleEditorValueChange: onEditorValueChange,
    handleUpdateHasUnsavedChanges: handleUpdateHasUnsavedChanges,
    handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
      dispatch(setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)),
    handlePromptAutocomplete: (row: number, col: number, callback: any) =>
      dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
    isEditorAutorun: false
  };
  const replProps = {
    handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
    handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
    handleReplEval: handleReplEval,
    handleReplValueChange: (newValue: string) =>
      dispatch(updateReplValue(newValue, workspaceLocation)),
    output: output,
    replValue: replValue,
    sourceChapter: missionMetadata.sourceVersion || Chapter.SOURCE_4,
    sourceVariant: Variant.DEFAULT,
    externalLibrary: ExternalLibraryName.NONE,
    replButtons: replButtons()
  };
  const sideBarProps = {
    tabs: []
  };
  const workspaceProps: WorkspaceProps = {
    controlBarProps: controlBarProps(),
    editorContainerProps: currentTaskIsMCQ && displayMCQInEditor ? undefined : editorContainerProps,
    handleSideContentHeightChange: heightChange =>
      dispatch(changeSideContentHeight(heightChange, workspaceLocation)),
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    sideBarProps: sideBarProps,
    sideContentHeight: sideContentHeight,
    sideContentProps: sideContentProps(),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps: currentTaskIsMCQ && displayMCQInEditor ? undefined : editorContainerProps,
    replProps: replProps,
    sideBarProps: sideBarProps,
    hasUnsavedChanges: hasUnsavedChanges,
    mcqProps: mcqProps,
    mobileSideContentProps: mobileSideContentProps()
  };

  if (isLoading) {
    return (
      <div className={classNames(classes['missionLoading'], Classes.DARK)}>
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
