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
import React, { useCallback, useEffect, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';

import { InterpreterOutput } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { AutogradingResult, Testcase } from '../../commons/assessment/AssessmentTypes';
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
import { ControlBarTaskAddButton } from '../../commons/controlBar/ControlBarTaskAddButton';
import { ControlBarTaskDeleteButton } from '../../commons/controlBar/ControlBarTaskDeleteButton';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import {
  GitHubMissionCreateDialog,
  GitHubMissionCreateDialogProps,
  GitHubMissionCreateDialogResolution
} from '../../commons/githubAssessments/GitHubMissionCreateDialog';
import {
  convertMissionMetadataToMetadataString,
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
import { SideContentProps } from '../../commons/sideContent/SideContent';
import SideContentAutograderEditor from '../../commons/sideContent/SideContentAutograderEditor';
import SideContentMarkdownEditor from '../../commons/sideContent/SideContentMarkdownEditor';
import SideContentMissionEditor from '../../commons/sideContent/SideContentMissionEditor';
import SideContentTaskEditor from '../../commons/sideContent/SideContentTaskEditor';
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
  handleResetWorkspace: (options: Partial<WorkspaceState>) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleTestcaseEval: (testcaseId: number) => void;
  handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

export type StateProps = {
  autogradingResults: AutogradingResult[];
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

  const defaultMissionBriefing =
    'Welcome to Mission Mode! This is where the Mission Briefing for each assignment will appear.';

  const defaultTaskDescription =
    'Welcome to Mission Mode! This is where the Task Description for each assignment will appear.';

  const defaultStarterCode = '// Your code here!\n';

  const defaultMissionMetadata = useMemo<MissionMetadata>(() => {
    return {
      coverImage: '',
      kind: '',
      number: '',
      title: '',
      sourceVersion: 1,
      dueDate: new Date(8640000000000000),
      reading: '',
      webSummary: ''
    } as MissionMetadata;
  }, []);

  const defaultTask = useMemo<TaskData>(() => {
    return {
      questionNumber: 0,
      taskDescription: defaultTaskDescription,
      starterCode: defaultStarterCode,
      savedCode: defaultStarterCode,
      testPrepend: '',
      testPostpend: '',
      testCases: []
    } as TaskData;
  }, []);

  const [showOverlay, setShowOverlay] = React.useState(false);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.questionOverview);

  /**
   * Handles re-rendering the webpage + tracking states relating to the loaded mission
   */
  const [missionMetadata, setMissionMetadata] = React.useState(
    Object.assign({}, defaultMissionMetadata)
  );
  const [summary, setSummary] = React.useState('');

  const [cachedMissionMetadata, setCachedMissionMetadata] = React.useState(
    Object.assign({}, defaultMissionMetadata)
  );
  const [hasUnsavedChangesToMetadata, setHasUnsavedChangesToMetadata] = React.useState(false);

  const [briefingContent, setBriefingContent] = React.useState(defaultMissionBriefing);
  const [cachedBriefingContent, setCachedBriefingContent] = React.useState(defaultMissionBriefing);
  const [hasUnsavedChangesToBriefing, setHasUnsavedChangesToBriefing] = React.useState(false);

  const [cachedTaskList, setCachedTaskList] = React.useState<TaskData[]>([]);
  const [taskList, setTaskList] = React.useState<TaskData[]>([]);
  const [hasUnsavedChangesToTasks, setHasUnsavedChangesToTasks] = React.useState(false);

  const [currentTaskNumber, setCurrentTaskNumber] = React.useState(0);
  const [isTeacherMode, setIsTeacherMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const hasUnsavedChanges = props.hasUnsavedChanges;
  const handleEditorValueChange = props.handleEditorValueChange;
  const handleResetWorkspace = props.handleResetWorkspace;
  const handleUpdateHasUnsavedChanges = props.handleUpdateHasUnsavedChanges;

  const [missionRepoData, setMissionRepoData] = React.useState<MissionRepoData>(
    props.location.state as MissionRepoData
  );
  const autogradingResults: AutogradingResult[] = props.autogradingResults;
  const editorTestcases = props.editorTestcases;

  const computedHasUnsavedChanges = useMemo(() => {
    return hasUnsavedChangesToMetadata || hasUnsavedChangesToBriefing || hasUnsavedChangesToTasks;
  }, [hasUnsavedChangesToMetadata, hasUnsavedChangesToBriefing, hasUnsavedChangesToTasks]);

  const setUpWithMissionRepoData = useCallback(async () => {
    if (octokit === undefined) return;
    const missionData: MissionData = await getMissionData(missionRepoData, octokit);
    setSummary(missionData.missionBriefing);

    setMissionMetadata(missionData.missionMetadata);
    setCachedMissionMetadata(Object.assign({}, missionData.missionMetadata));

    setBriefingContent(missionData.missionBriefing);
    setCachedBriefingContent(missionData.missionBriefing);

    setTaskList(missionData.tasksData);
    setCachedTaskList(missionData.tasksData);
    setCurrentTaskNumber(1);

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);

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

    handleEditorValueChange(missionData.tasksData[0].savedCode);
    handleUpdateHasUnsavedChanges(false);
    setIsLoading(false);

    handleResetWorkspace({
      autogradingResults: [],
      editorValue: missionData.tasksData[0].savedCode,
      editorPrepend: missionData.tasksData[0].testPrepend,
      editorPostpend: missionData.tasksData[0].testPostpend,
      editorTestcases: missionData.tasksData[0].testCases
    });

    if (missionData.missionBriefing !== '') setShowOverlay(true);
  }, [
    handleResetWorkspace,
    missionRepoData,
    octokit,
    handleEditorValueChange,
    handleUpdateHasUnsavedChanges
  ]);

  const setUpWithoutMissionRepoData = useCallback(() => {
    setSummary(defaultMissionBriefing);

    setMissionMetadata(defaultMissionMetadata);
    setCachedMissionMetadata(defaultMissionMetadata);

    setBriefingContent(defaultMissionBriefing);
    setCachedBriefingContent(defaultMissionBriefing);

    setTaskList([defaultTask]);
    setCachedTaskList([defaultTask]);

    setCurrentTaskNumber(1);
    handleResetWorkspace({
      autogradingResults: [],
      editorValue: defaultStarterCode,
      editorPrepend: '',
      editorPostpend: '',
      editorTestcases: []
    });

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);

    setIsTeacherMode(true);
    setIsLoading(false);
  }, [defaultMissionMetadata, defaultTask, handleResetWorkspace]);

  useEffect(() => {
    if (missionRepoData === undefined) {
      setUpWithoutMissionRepoData();
    } else {
      setUpWithMissionRepoData();
    }
  }, [missionRepoData, setUpWithMissionRepoData, setUpWithoutMissionRepoData]);

  useEffect(() => {
    if (computedHasUnsavedChanges !== hasUnsavedChanges) {
      handleUpdateHasUnsavedChanges(computedHasUnsavedChanges);
    }
  }, [computedHasUnsavedChanges, hasUnsavedChanges, handleUpdateHasUnsavedChanges]);

  const overlay = (
    <Dialog className="assessment-briefing" isOpen={showOverlay}>
      <Card>
        <Markdown content={summary} />
        <Button
          className="assessment-briefing-button"
          onClick={() => setShowOverlay(false)}
          text="Continue"
        />
      </Card>
    </Dialog>
  );

  const computeAndSetHasUnsavedChangesToTasks = useCallback(
    (newTaskList: TaskData[], cachedTaskList: TaskData[]) => {
      if (newTaskList.length !== cachedTaskList.length) {
        setHasUnsavedChangesToTasks(true);
        return;
      }

      for (let i = 0; i < newTaskList.length; i++) {
        if (!objectsAreShallowlyEqual<TaskData>(newTaskList[i], cachedTaskList[i])) {
          setHasUnsavedChangesToTasks(true);
          return;
        }
      }

      setHasUnsavedChangesToTasks(false);
    },
    []
  );

  const editCode = useCallback(
    (questionNumber: number, newValue: string) => {
      if (questionNumber > taskList.length) {
        return;
      }
      const editedTaskList = [...taskList];
      editedTaskList[questionNumber - 1] = {
        ...editedTaskList[questionNumber - 1],
        savedCode: newValue
      };
      setTaskList(editedTaskList);
      computeAndSetHasUnsavedChangesToTasks(editedTaskList, taskList);
    },
    [taskList, computeAndSetHasUnsavedChangesToTasks]
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

  function objectsAreShallowlyEqual<T>(first: T, second: T) {
    const keys = Object.keys(first);
    for (let i = 0; i < keys.length; i++) {
      if (first[keys[i]] !== second[keys[i]]) {
        return false;
      }
    }

    return true;
  }

  const saveWithMissionRepoData = useCallback(async () => {
    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const filenameToContentMap = {};
    const foldersToDelete: string[] = [];

    if (!objectsAreShallowlyEqual<MissionMetadata>(missionMetadata, cachedMissionMetadata)) {
      filenameToContentMap['.metadata'] = convertMissionMetadataToMetadataString(missionMetadata);
    }

    if (briefingContent !== cachedBriefingContent) {
      filenameToContentMap['README.md'] = briefingContent;
    }

    let j = 0;
    while (j < taskList.length) {
      const taskNumber = j + 1;
      const qTaskNumber = 'Q' + taskNumber;

      if (taskNumber > cachedTaskList.length) {
        filenameToContentMap[qTaskNumber + '/StarterCode.js'] = taskList[j].savedCode;
        filenameToContentMap[qTaskNumber + '/Problem.md'] = taskList[j].taskDescription;
      } else {
        if (taskList[j].savedCode !== cachedTaskList[j].savedCode) {
          if (isTeacherMode) {
            filenameToContentMap[qTaskNumber + '/StarterCode.js'] = taskList[j].savedCode;
          } else {
            filenameToContentMap[qTaskNumber + '/SavedCode.js'] = taskList[j].savedCode;
          }
        }

        if (taskList[j].taskDescription !== cachedTaskList[j].taskDescription) {
          filenameToContentMap[qTaskNumber + '/Problem.md'] = taskList[j].taskDescription;
        }

        if (taskList[j].testCases !== cachedTaskList[j].testCases) {
          filenameToContentMap[qTaskNumber + '/TestCases.json'] = JSON.stringify(
            taskList[j].testCases,
            null,
            4
          );
        }

        if (taskList[j].testPrepend !== cachedTaskList[j].testPrepend) {
          filenameToContentMap[qTaskNumber + '/TestPrepend.js'] = taskList[j].testPrepend;
        }

        if (taskList[j].testPostpend !== cachedTaskList[j].testPostpend) {
          filenameToContentMap[qTaskNumber + '/TestPostpend.js'] = taskList[j].testPostpend;
        }
      }

      j++;
    }

    while (j < cachedTaskList.length) {
      const taskNumber = j + 1;
      foldersToDelete.push('Q' + taskNumber);
      j++;
    }

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

  const saveWithoutMissionRepoData = useCallback(async () => {
    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const filenameToContentMap = {};
    filenameToContentMap['.metadata'] = convertMissionMetadataToMetadataString(missionMetadata);
    filenameToContentMap['README.md'] = briefingContent;

    for (let i = 0; i < taskList.length; i++) {
      const taskNumber = i + 1;
      const qTaskNumber = 'Q' + taskNumber;

      filenameToContentMap[qTaskNumber + '/StarterCode.js'] = taskList[i].savedCode;
      filenameToContentMap[qTaskNumber + '/Problem.md'] = taskList[i].taskDescription;

      if (taskList[i].testCases !== cachedTaskList[i].testCases) {
        filenameToContentMap[qTaskNumber + '/TestCases.json'] = JSON.stringify(
          taskList[i].testCases,
          null,
          4
        );
      }

      if (taskList[i].testPrepend !== cachedTaskList[i].testPrepend) {
        filenameToContentMap[qTaskNumber + '/TestPrepend.js'] = taskList[i].testPrepend;
      }

      if (taskList[i].testPostpend !== cachedTaskList[i].testPostpend) {
        filenameToContentMap[qTaskNumber + '/TestPostpend.js'] = taskList[i].testPostpend;
      }
    }

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
  }, [briefingContent, missionMetadata, octokit, taskList, cachedTaskList]);

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

    if (!confirmReset) {
      return;
    }

    resetToTemplate();
  }, [resetToTemplate]);

  const shouldProceedToChangeTask = useCallback(
    (currentTaskNumber: number, taskList: TaskData[], cachedTaskList: TaskData[]) => {
      if (taskList[currentTaskNumber - 1] !== cachedTaskList[currentTaskNumber - 1]) {
        return window.confirm(
          'You have unsaved changes to the current question. Are you sure you want to continue?'
        );
      }
      return true;
    },
    []
  );

  const changeStateDueToChangedTask = useCallback(
    (newTaskNumber: number) => {
      setCurrentTaskNumber(newTaskNumber);

      handleResetWorkspace({
        autogradingResults: [],
        editorValue: taskList[newTaskNumber - 1].savedCode,
        editorPrepend: taskList[newTaskNumber - 1].testPrepend,
        editorPostpend: taskList[newTaskNumber - 1].testPostpend,
        editorTestcases: taskList[newTaskNumber - 1].testCases
      });
    },
    [setCurrentTaskNumber, handleResetWorkspace, taskList]
  );

  const onClickPrevious = useCallback(() => {
    if (shouldProceedToChangeTask(currentTaskNumber, taskList, cachedTaskList)) {
      const newTaskNumber = currentTaskNumber - 1;
      changeStateDueToChangedTask(newTaskNumber);
    }
  }, [
    currentTaskNumber,
    taskList,
    cachedTaskList,
    shouldProceedToChangeTask,
    changeStateDueToChangedTask
  ]);

  const onClickNext = useCallback(() => {
    if (shouldProceedToChangeTask(currentTaskNumber, taskList, cachedTaskList)) {
      const newTaskNumber = currentTaskNumber + 1;
      changeStateDueToChangedTask(newTaskNumber);
    }
  }, [
    currentTaskNumber,
    taskList,
    cachedTaskList,
    shouldProceedToChangeTask,
    changeStateDueToChangedTask
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

      setTaskList(newTaskList);
      computeAndSetHasUnsavedChangesToTasks(newTaskList, cachedTaskList);
    },
    [taskList, cachedTaskList, computeAndSetHasUnsavedChangesToTasks]
  );

  const setTaskTestcases = useCallback(
    (newTestcases: Testcase[]) => {
      const editedTaskList = [...taskList];
      editedTaskList[currentTaskNumber - 1] = {
        ...editedTaskList[currentTaskNumber - 1],
        testCases: newTestcases
      };

      console.log(editedTaskList);

      handleResetWorkspace({
        autogradingResults: [],
        editorValue: editedTaskList[currentTaskNumber - 1].savedCode,
        editorPrepend: editedTaskList[currentTaskNumber - 1].testPrepend,
        editorPostpend: editedTaskList[currentTaskNumber - 1].testPostpend,
        editorTestcases: editedTaskList[currentTaskNumber - 1].testCases
      });

      setTaskList(editedTaskList);
      computeAndSetHasUnsavedChangesToTasks(editedTaskList, cachedTaskList);
    },
    [
      currentTaskNumber,
      taskList,
      cachedTaskList,
      computeAndSetHasUnsavedChangesToTasks,
      handleResetWorkspace
    ]
  );

  const getTaskListWithSinglePropertyChanged = useCallback(
    (changeAtIndex: number, taskList: TaskData[], propertyToChange: string, newValue: any) => {
      const editedTaskList = [...taskList];
      const taskReplacement = Object.assign({}, taskList[changeAtIndex]);
      taskReplacement[propertyToChange] = newValue;
      editedTaskList[changeAtIndex] = taskReplacement;
      return editedTaskList;
    },
    []
  );

  const setTestPrepend = useCallback(
    (newTestPrepend: string) => {
      const editedTaskList = getTaskListWithSinglePropertyChanged(
        currentTaskNumber - 1,
        taskList,
        'testPrepend',
        newTestPrepend
      );
      setTaskList(editedTaskList);
      computeAndSetHasUnsavedChangesToTasks(editedTaskList, cachedTaskList);
    },
    [
      currentTaskNumber,
      taskList,
      cachedTaskList,
      computeAndSetHasUnsavedChangesToTasks,
      getTaskListWithSinglePropertyChanged
    ]
  );

  const setTestPostpend = useCallback(
    (newTestPostpend: string) => {
      const editedTaskList = getTaskListWithSinglePropertyChanged(
        currentTaskNumber - 1,
        taskList,
        'testPostpend',
        newTestPostpend
      );
      setTaskList(editedTaskList);
      computeAndSetHasUnsavedChangesToTasks(editedTaskList, cachedTaskList);
    },
    [
      currentTaskNumber,
      taskList,
      cachedTaskList,
      computeAndSetHasUnsavedChangesToTasks,
      getTaskListWithSinglePropertyChanged
    ]
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
      setHasUnsavedChangesToMetadata(
        !objectsAreShallowlyEqual<MissionMetadata>(newMissionMetadata, cachedMissionMetadata)
      );
    },
    [cachedMissionMetadata]
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
      },
      {
        label: 'Autograder',
        iconName: IconNames.AIRPLANE,
        body: (
          <SideContentAutograderEditor
            testcases={editorTestcases}
            autogradingResults={autogradingResults ? autogradingResults : []}
            testPrepend={
              taskList[currentTaskNumber - 1] ? taskList[currentTaskNumber - 1].testPrepend : ''
            }
            testPostpend={
              taskList[currentTaskNumber - 1] ? taskList[currentTaskNumber - 1].testPostpend : ''
            }
            isTeacherMode={isTeacherMode}
            handleTestcaseEval={props.handleTestcaseEval}
            setTaskTestcases={setTaskTestcases}
            setTestPrepend={setTestPrepend}
            setTestPostpend={setTestPostpend}
          />
        ),
        id: SideContentType.autograder,
        toSpawn: () => true
      }
    ];

    if (isTeacherMode) {
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
    setTaskList(newTaskList);

    const newTaskNumber = currentTaskNumber + 1;
    setCurrentTaskNumber(newTaskNumber);
    handleEditorValueChange(newTaskList[newTaskNumber - 1].savedCode);

    computeAndSetHasUnsavedChangesToTasks(newTaskList, cachedTaskList);
  };

  const deleteCurrentQuestion = () => {
    const deleteAtIndex = currentTaskNumber - 1;

    const newTaskList = taskList
      .slice(0, deleteAtIndex)
      .concat(taskList.slice(currentTaskNumber, taskList.length));
    setTaskList(newTaskList);

    const newTaskNumber = currentTaskNumber === 1 ? currentTaskNumber : currentTaskNumber - 1;
    setCurrentTaskNumber(newTaskNumber);
    handleEditorValueChange(newTaskList[newTaskNumber - 1].savedCode);

    computeAndSetHasUnsavedChangesToTasks(newTaskList, cachedTaskList);
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
      editorButtons.push(addTaskButton);
      editorButtons.push(deleteTaskButton);
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
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    hasUnsavedChanges: hasUnsavedChanges,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    hasUnsavedChanges: hasUnsavedChanges,
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
        {overlay}
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
