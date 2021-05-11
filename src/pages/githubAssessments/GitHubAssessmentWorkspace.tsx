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
import { ControlBarTaskAddButton } from '../../commons/controlBar/ControlBarTaskAddButton';
import { ControlBarTaskDeleteButton } from '../../commons/controlBar/ControlBarTaskDeleteButton';
import controlButton from '../../commons/ControlButton';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import {
  convertMissionMetadataToMetadataString,
  getMissionData
} from '../../commons/githubAssessments/GitHubMissionDataUtils';
import {
  GitHubMissionSaveDialog,
  GitHubMissionSaveDialogProps,
  GitHubMissionSaveDialogResolution
} from '../../commons/githubAssessments/GitHubMissionSaveDialog';
import MissionData from '../../commons/githubAssessments/MissionData';
import MissionMetadata from '../../commons/githubAssessments/MissionMetadata';
import MissionRepoData from '../../commons/githubAssessments/MissionRepoData';
import TaskData from '../../commons/githubAssessments/TaskData';
import Markdown from '../../commons/Markdown';
import { MobileSideContentProps } from '../../commons/mobileWorkspace/mobileSideContent/MobileSideContent';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import { SideContentProps } from '../../commons/sideContent/SideContent';
import SideContentMarkdownEditor from '../../commons/sideContent/SideContentMarkdownEditor';
import SideContentMissionEditor from '../../commons/sideContent/SideContentMissionEditor';
import SideContentTaskEditor from '../../commons/sideContent/SideContentTaskEditor';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import Constants from '../../commons/utils/Constants';
import { promisifyDialog } from '../../commons/utils/DialogHelper';
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
  const octokit = getGitHubOctokitInstance();

  if (octokit === undefined) {
    history.push('/githubassessments/missions');
  }

  const defaultMissionMetadata = {
    coverImage: '',
    kind: '',
    number: '',
    title: '',
    sourceVersion: 1,
    dueDate: new Date(8640000000000000),
    reading: '',
    webSummary: ''
  } as MissionMetadata;

  const defaultMissionBriefing =
    'Welcome to Mission Mode! This is where the Mission Briefing for each assignment will appear.';

  const defaultTaskDescription =
    'Welcome to Mission Mode! This is where the Task Description for each assignment will appear.';

  const defaultStarterCode = '// Your code here!\n';

  const [showOverlay, setShowOverlay] = React.useState(false);
  const [showResetTemplateOverlay, setShowResetTemplateOverlay] = React.useState(false);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.questionOverview);

  /**
   * Handles re-rendering the webpage + tracking states relating to the loaded mission
   */
  const [missionMetadata, setMissionMetadata] = React.useState(
    Object.assign({}, defaultMissionMetadata)
  );
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
  const [summary, setSummary] = React.useState('');
  const [isTeacherMode, setIsTeacherMode] = React.useState(false);
  const handleEditorValueChange = props.handleEditorValueChange;
  //const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const missionRepoData = props.location.state as MissionRepoData;

  const loadMission = useCallback(async () => {
    if (octokit === undefined) return;
    const missionData: MissionData = await getMissionData(missionRepoData, octokit);
    setSummary(missionData.missionBriefing);

    setMissionMetadata(missionData.missionMetadata);
    setCachedMissionMetadata(Object.assign({}, missionData.missionMetadata));

    setBriefingContent(missionData.missionBriefing);
    setCachedBriefingContent(missionData.missionBriefing);

    setTaskList(missionData.tasksData);
    setCachedTaskList(
      missionData.tasksData.map(taskData => Object.assign({}, taskData) as TaskData)
    );

    setCurrentTaskNumber(1);
    handleEditorValueChange(missionData.tasksData[0].savedCode);

    setHasUnsavedChangesToTasks(false);
    setHasUnsavedChangesToBriefing(false);
    setHasUnsavedChangesToMetadata(false);

    let userInTeacherMode = false;
    const userOrganisations = (await octokit.orgs.listForAuthenticatedUser()).data;
    for (let i = 0; i < userOrganisations.length; i++) {
      const org = userOrganisations[i];
      userInTeacherMode = org.login === missionRepoData.repoOwner;
      if (userInTeacherMode) {
        break;
      }
    }
    setIsTeacherMode(userInTeacherMode);

    setIsLoading(false);
  }, [missionRepoData, octokit, handleEditorValueChange]);

  useEffect(() => {
    loadMission();
  }, [loadMission]);

  /**
   * After mounting show the briefing.
   */
  React.useEffect(() => {
    if (summary !== '') setShowOverlay(true);
  }, [summary]);

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

  const closeOverlay = () => setShowResetTemplateOverlay(false);
  const resetToTemplate = () => {
    const originalCode = taskList[currentTaskNumber - 1].starterCode;
    handleEditorValueChange(originalCode);
    editCode(currentTaskNumber, originalCode);
  };
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
              resetToTemplate();
            },
            { minimal: false, intent: Intent.DANGER }
          )}
        </ButtonGroup>
      </div>
    </Dialog>
  );

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
      const editedTaskList = taskList;
      editedTaskList[questionNumber - 1].savedCode = newValue;
      setTaskList(editedTaskList);
    },
    [taskList]
  );

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
    [missionRepoData.repoOwner, missionRepoData.repoName, octokit]
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
    [octokit, missionRepoData.repoOwner, missionRepoData.repoName]
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

  const onClickSave = useCallback(async () => {
    if (missionRepoData === undefined) {
      showWarningMessage("You can't save without a mission open!", 2000);
      return;
    }

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

      if (taskNumber >= cachedTaskList.length) {
        filenameToContentMap['Q' + taskNumber + '/StarterCode.js'] = taskList[j].starterCode;
        filenameToContentMap['Q' + taskNumber + '/Problem.md'] = taskList[j].taskDescription;
      } else {
        if (taskList[j].savedCode !== cachedTaskList[j].savedCode) {
          filenameToContentMap['Q' + taskNumber + '/SavedCode.js'] = taskList[j].savedCode;
        }

        if (taskList[j].taskDescription !== cachedTaskList[j].taskDescription) {
          filenameToContentMap['Q' + taskNumber + '/Problem.md'] = taskList[j].taskDescription;
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
      octokit,
      repoName: missionRepoData.repoName,
      filesToChangeOrCreate: changedFiles,
      filesToDelete: foldersToDelete,
      resolveDialog: dialogResults => resolve(dialogResults)
    }));

    if (!dialogResults.confirmSave) {
      return;
    }

    const authUser = await octokit.users.getAuthenticated();
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

    setCachedTaskList(taskList.map(taskData => Object.assign({}, taskData) as TaskData));
    setCachedBriefingContent(briefingContent);
    setCachedMissionMetadata(missionMetadata);
  }, [
    briefingContent,
    cachedBriefingContent,
    taskList,
    cachedTaskList,
    missionMetadata,
    cachedMissionMetadata,
    conductSave,
    conductDelete,
    missionRepoData,
    octokit,
    setCachedBriefingContent
  ]);

  const onClickReset = useCallback(() => {
    setShowResetTemplateOverlay(true);
  }, []);

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

  const onEditorValueChange = React.useCallback(
    val => {
      handleEditorValueChange(val);
      editCode(currentTaskNumber, val);
      computeAndSetHasUnsavedChangesToTasks(taskList, cachedTaskList);
    },
    [
      currentTaskNumber,
      editCode,
      handleEditorValueChange,
      taskList,
      cachedTaskList,
      computeAndSetHasUnsavedChangesToTasks
    ]
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
      }
    ];

    if (isTeacherMode) {
      tabs.push({
        label: 'Mission Metadata',
        iconName: IconNames.AIRPLANE,
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
      .concat([
        {
          taskDescription: defaultTaskDescription,
          starterCode: defaultStarterCode,
          savedCode: defaultStarterCode
        } as TaskData
      ])
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
        hasUnsavedChanges={
          hasUnsavedChangesToTasks || hasUnsavedChangesToMetadata || hasUnsavedChangesToBriefing
        }
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
    sideContentHeight: props.sideContentHeight,
    sideContentProps: sideContentProps(props),
    replProps: replProps
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: mobileSideContentProps()
  };

  if (isLoading) {
    return (
      <div className={classNames('SideContentMissionEditor', Classes.DARK)}>
        <NonIdealState
          description="Loading Missions"
          icon={<Spinner size={Spinner.SIZE_LARGE} />}
        />
      </div>
    );
  } else {
    return (
      <div className={classNames('SideContentMissionEditor', Classes.DARK)}>
        {overlay}
        {resetTemplateOverlay}
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
