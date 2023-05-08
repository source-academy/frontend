import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { Ace, Range } from 'ace-builds';
import { FSModule } from 'browserfs/dist/node/core/FS';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import _, { isEqual } from 'lodash';
import { decompressFromEncodedURIComponent } from 'lz-string';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { useDispatch, useStore } from 'react-redux';
import { RouteComponentProps, useHistory, useLocation } from 'react-router';
import { AnyAction, Dispatch } from 'redux';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from 'src/commons/application/actions/InterpreterActions';
import {
  loginGitHub,
  logoutGitHub,
  logoutGoogle
} from 'src/commons/application/actions/SessionActions';
import {
  setEditorSessionId,
  setSharedbConnected
} from 'src/commons/collabEditing/CollabEditingActions';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';
import {
  showFullJSWarningOnUrlLoad,
  showFulTSWarningOnUrlLoad,
  showHTMLDisclaimer
} from 'src/commons/utils/WarningDialogHelper';
import {
  addEditorTab,
  addHtmlConsoleError,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  changeStepLimit,
  evalEditor,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  removeEditorTabsForDirectory,
  sendReplInputToOutput,
  setEditorHighlightedLines,
  setFolderMode,
  toggleEditorAutorun,
  toggleFolderMode,
  toggleUpdateEnv,
  updateActiveEditorTabIndex,
  updateEnvSteps,
  updateEnvStepsTotal,
  updateReplValue
} from 'src/commons/workspace/WorkspaceActions';
import { EditorTabState, WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';
import {
  githubOpenFile,
  githubSaveFile,
  githubSaveFileAs
} from 'src/features/github/GitHubActions';
import {
  persistenceInitialise,
  persistenceOpenPicker,
  persistenceSaveFile,
  persistenceSaveFileAs
} from 'src/features/persistence/PersistenceActions';
import {
  generateLzString,
  shortenURL,
  updateShortURL
} from 'src/features/playground/PlaygroundActions';

import {
  getDefaultFilePath,
  InterpreterOutput,
  isSourceLanguage,
  OverallState,
  ResultOutput,
  sourceLanguages
} from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExecutionTime } from '../../commons/controlBar/ControlBarExecutionTime';
import { ControlBarGoogleDriveButtons } from '../../commons/controlBar/ControlBarGoogleDriveButtons';
import { ControlBarSessionButtons } from '../../commons/controlBar/ControlBarSessionButton';
import { ControlBarShareButton } from '../../commons/controlBar/ControlBarShareButton';
import { ControlBarStepLimit } from '../../commons/controlBar/ControlBarStepLimit';
import { ControlBarToggleFolderModeButton } from '../../commons/controlBar/ControlBarToggleFolderModeButton';
import { ControlBarGitHubButtons } from '../../commons/controlBar/github/ControlBarGitHubButtons';
import {
  convertEditorTabStateToProps,
  NormalEditorContainerProps
} from '../../commons/editor/EditorContainer';
import { Position } from '../../commons/editor/EditorTypes';
import { overwriteFilesInWorkspace } from '../../commons/fileSystem/utils';
import FileSystemView from '../../commons/fileSystemView/FileSystemView';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import { SideBarTab } from '../../commons/sideBar/SideBar';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import { Links } from '../../commons/utils/Constants';
import { generateSourceIntroduction } from '../../commons/utils/IntroductionHelper';
import { convertParamToBoolean, convertParamToInt } from '../../commons/utils/ParamParseHelper';
import { IParsedQuery, parseQuery } from '../../commons/utils/QueryHelper';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import { initSession, log } from '../../features/eventLogging';
import { GitHubSaveInfo } from '../../features/github/GitHubTypes';
import { PersistenceFile } from '../../features/persistence/PersistenceTypes';
import {
  CodeDelta,
  Input,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { WORKSPACE_BASE_PATHS } from '../fileSystem/createInBrowserFileSystem';
import {
  dataVisualizerTab,
  desktopOnlyTabIds,
  makeEnvVisualizerTabFrom,
  makeHtmlDisplayTabFrom,
  makeIntroductionTabFrom,
  makeRemoteExecutionTabFrom,
  makeSubstVisualizerTabFrom,
  mobileOnlyTabIds
} from './PlaygroundTabs';

export type PlaygroundProps = OwnProps &
  DispatchProps &
  StateProps &
  RouteComponentProps<{}> & {
    workspaceLocation?: WorkspaceLocation;
  };

export type OwnProps = {
  isSicpEditor?: boolean;
  initialEditorValueHash?: string;
  prependLength?: number;
  handleCloseEditor?: () => void;
};

export type DispatchProps = {
  handleChangeExecTime: (execTime: number) => void;
  handleChapterSelect: (chapter: Chapter, variant: Variant) => void;
  handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleUsingEnv: (usingEnv: boolean) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
};

export type StateProps = {
  editorTabs: EditorTabState[];
  programPrependValue: string;
  programPostpendValue: string;
  editorSessionId: string;
  execTime: number;
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  output: InterpreterOutput[];
  queryString?: string;
  shortURL?: string;
  replValue: string;
  sideContentHeight?: number;
  playgroundSourceChapter: Chapter;
  playgroundSourceVariant: Variant;
  courseSourceChapter?: number;
  courseSourceVariant?: Variant;
  stepLimit: number;
  sharedbConnected: boolean;
  usingEnv: boolean;
  usingSubst: boolean;
  persistenceUser: string | undefined;
  persistenceFile: PersistenceFile | undefined;
  githubOctokitObject: { octokit: Octokit | undefined };
  githubSaveInfo: GitHubSaveInfo;
};

const keyMap = { goGreen: 'h u l k' };

export async function handleHash(
  hash: string,
  props: PlaygroundProps,
  workspaceLocation: WorkspaceLocation,
  dispatch: Dispatch<AnyAction>,
  fileSystem: FSModule
) {
  // Make the parsed query string object a Partial because we might access keys which are not set.
  const qs: Partial<IParsedQuery> = parseQuery(hash);

  const chapter = convertParamToInt(qs.chap) ?? undefined;
  if (chapter === Chapter.FULL_JS) {
    showFullJSWarningOnUrlLoad();
  } else if (chapter === Chapter.FULL_TS) {
    showFulTSWarningOnUrlLoad();
  } else {
    if (chapter === Chapter.HTML) {
      const continueToHtml = await showHTMLDisclaimer();
      if (!continueToHtml) {
        return;
      }
    }

    // For backward compatibility with old share links - 'prgrm' is no longer used.
    const program = qs.prgrm === undefined ? '' : decompressFromEncodedURIComponent(qs.prgrm);

    // By default, create just the default file.
    const defaultFilePath = getDefaultFilePath(workspaceLocation);
    const files: Record<string, string> =
      qs.files === undefined
        ? {
            [defaultFilePath]: program
          }
        : parseQuery(decompressFromEncodedURIComponent(qs.files));
    await overwriteFilesInWorkspace(workspaceLocation, fileSystem, files);

    // BrowserFS does not provide a way of listening to changes in the file system, which makes
    // updating the file system view troublesome. To force the file system view to re-render
    // (and thus display the updated file system), we first disable Folder mode.
    dispatch(setFolderMode(workspaceLocation, false));
    const isFolderModeEnabled = convertParamToBoolean(qs.isFolder) ?? false;
    // If Folder mode should be enabled, enabling it after disabling it earlier will cause the
    // newly-added files to be shown. Note that this has to take place after the files are
    // already added to the file system.
    dispatch(setFolderMode(workspaceLocation, isFolderModeEnabled));

    // By default, open a single editor tab containing the default playground file.
    const editorTabFilePaths = qs.tabs?.split(',').map(decompressFromEncodedURIComponent) ?? [
      defaultFilePath
    ];
    // Remove all editor tabs before populating with the ones from the query string.
    dispatch(
      removeEditorTabsForDirectory(workspaceLocation, WORKSPACE_BASE_PATHS[workspaceLocation])
    );
    // Add editor tabs from the query string.
    editorTabFilePaths.forEach(filePath =>
      // Fall back on the empty string if the file contents do not exist.
      dispatch(addEditorTab(workspaceLocation, filePath, files[filePath] ?? ''))
    );

    // By default, use the first editor tab.
    const activeEditorTabIndex = convertParamToInt(qs.tabIdx) ?? 0;
    dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex));

    const variant: Variant =
      sourceLanguages.find(
        language => language.chapter === chapter && language.variant === qs.variant
      )?.variant ?? Variant.DEFAULT;

    if (chapter) {
      props.handleChapterSelect(chapter, variant);
    }

    const execTime = Math.max(convertParamToInt(qs.exec || '1000') || 1000, 1000);
    if (execTime) {
      props.handleChangeExecTime(execTime);
    }
  }
}

const Playground: React.FC<PlaygroundProps> = ({ workspaceLocation = 'playground', ...props }) => {
  const { isSicpEditor } = props;
  const { isMobileBreakpoint } = useResponsive();
  const propsRef = React.useRef(props);
  propsRef.current = props;

  const dispatch = useDispatch();

  const [deviceSecret, setDeviceSecret] = React.useState<string | undefined>();
  const location = useLocation();
  const history = useHistory();
  const store = useStore<OverallState>();
  const searchParams = new URLSearchParams(location.search);
  const shouldAddDevice = searchParams.get('add_device');

  const { isFolderModeEnabled, activeEditorTabIndex } = useTypedSelector(
    state => state.workspaces[workspaceLocation]
  );
  const fileSystem = useTypedSelector(state => state.fileSystem.inBrowserFileSystem);

  // Hide search query from URL to maintain an illusion of security. The device secret
  // is still exposed via the 'Referer' header when requesting external content (e.g. Google API fonts)
  if (shouldAddDevice && !deviceSecret) {
    setDeviceSecret(shouldAddDevice);
    history.replace(location.pathname);
  }

  const [lastEdit, setLastEdit] = React.useState(new Date());
  const [isGreen, setIsGreen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState(
    shouldAddDevice ? SideContentType.remoteExecution : SideContentType.introduction
  );
  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(() =>
    initSession('playground', {
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: propsRef.current.editorTabs[0]?.value ?? '',
      chapter: propsRef.current.playgroundSourceChapter
    })
  );

  const remoteExecutionTab: SideContentTab = React.useMemo(
    () => makeRemoteExecutionTabFrom(deviceSecret, setDeviceSecret),
    [deviceSecret]
  );

  const usingRemoteExecution =
    useTypedSelector(state => !!state.session.remoteExecutionSession) && !isSicpEditor;
  // this is still used by remote execution (EV3)
  // specifically, for the editor Ctrl+B to work
  const externalLibraryName = useTypedSelector(
    state => state.workspaces.playground.externalLibrary
  );

  React.useEffect(() => {
    // When the editor session Id changes, then treat it as a new session.
    setSessionId(
      initSession('playground', {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        editorValue: propsRef.current.editorTabs[0]?.value ?? '',
        chapter: propsRef.current.playgroundSourceChapter
      })
    );
  }, [props.editorSessionId]);

  const hash = isSicpEditor ? props.initialEditorValueHash : props.location.hash;

  React.useEffect(() => {
    if (!hash) {
      // If not a accessing via shared link, use the Source chapter and variant in the current course
      if (props.courseSourceChapter && props.courseSourceVariant) {
        propsRef.current.handleChapterSelect(props.courseSourceChapter, props.courseSourceVariant);
        // Disable Folder mode when forcing the Source chapter and variant to follow the current course's.
        // This is because Folder mode only works in Source 2+.
        dispatch(setFolderMode(workspaceLocation, false));
      }
      return;
    }
    if (fileSystem !== null) {
      handleHash(hash, propsRef.current, workspaceLocation, dispatch, fileSystem);
    }
  }, [
    dispatch,
    fileSystem,
    hash,
    props.courseSourceChapter,
    props.courseSourceVariant,
    workspaceLocation
  ]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (isMobileBreakpoint && desktopOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.mobileEditor);
    } else if (!isMobileBreakpoint && mobileOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, selectedTab]);

  const handlers = React.useMemo(
    () => ({
      goGreen: () => setIsGreen(!isGreen)
    }),
    [isGreen]
  );

  const onEditorValueChange = React.useCallback((editorTabIndex, newEditorValue) => {
    setLastEdit(new Date());
    propsRef.current.handleEditorValueChange(editorTabIndex, newEditorValue);
  }, []);

  const handleEnvVisualiserReset = React.useCallback(() => {
    const { handleUsingEnv } = propsRef.current;
    handleUsingEnv(false);
    EnvVisualizer.clearEnv();
    dispatch(updateEnvSteps(-1, workspaceLocation));
    dispatch(updateEnvStepsTotal(0, workspaceLocation));
    dispatch(toggleUpdateEnv(true, workspaceLocation));
    dispatch(setEditorHighlightedLines(workspaceLocation, 0, []));
  }, [dispatch, workspaceLocation]);

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      // Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
      if (
        prevTabId === SideContentType.substVisualizer &&
        newTabId === SideContentType.mobileEditorRun
      ) {
        return;
      }

      const { handleUsingEnv, handleUsingSubst, handleReplOutputClear, playgroundSourceChapter } =
        propsRef.current;

      if (newTabId !== SideContentType.envVisualizer) {
        handleEnvVisualiserReset();
      }

      if (
        isSourceLanguage(playgroundSourceChapter) &&
        (newTabId === SideContentType.substVisualizer || newTabId === SideContentType.envVisualizer)
      ) {
        if (playgroundSourceChapter <= Chapter.SOURCE_2) {
          handleUsingSubst(true);
        } else {
          handleUsingEnv(true);
        }
      }

      if (prevTabId === SideContentType.substVisualizer && !hasBreakpoints) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      setSelectedTab(newTabId);
    },
    [hasBreakpoints, handleEnvVisualiserReset]
  );

  const pushLog = React.useCallback(
    (newInput: Input) => {
      log(sessionId, newInput);
    },
    [sessionId]
  );

  const memoizedHandlers = React.useMemo(() => {
    return {
      handleEditorEval: () => dispatch(evalEditor(workspaceLocation)),
      handleInterruptEval: () => dispatch(beginInterruptExecution(workspaceLocation)),
      handleToggleEditorAutorun: () => dispatch(toggleEditorAutorun(workspaceLocation)),
      handleDebuggerPause: () => dispatch(beginDebuggerPause(workspaceLocation)),
      handleDebuggerReset: () => dispatch(debuggerReset(workspaceLocation)),
      handleDebuggerResume: () => dispatch(debuggerResume(workspaceLocation))
    };
  }, [dispatch, workspaceLocation]);

  const autorunButtons = React.useMemo(() => {
    return (
      <ControlBarAutorunButtons
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        isDebugging={props.isDebugging}
        isEditorAutorun={props.isEditorAutorun}
        isRunning={props.isRunning}
        key="autorun"
        autorunDisabled={usingRemoteExecution}
        sourceChapter={props.playgroundSourceChapter}
        // Disable pause for non-Source languages since they cannot be paused
        pauseDisabled={usingRemoteExecution || !isSourceLanguage(props.playgroundSourceChapter)}
        {...memoizedHandlers}
      />
    );
  }, [
    activeEditorTabIndex,
    props.isDebugging,
    props.isEditorAutorun,
    props.isRunning,
    props.playgroundSourceChapter,
    memoizedHandlers,
    usingRemoteExecution
  ]);

  const chapterSelectHandler = React.useCallback(
    ({ chapter, variant }: { chapter: Chapter; variant: Variant }, e: any) => {
      const { handleUsingSubst, handleReplOutputClear, handleChapterSelect } = propsRef.current;
      if ((chapter <= 2 && hasBreakpoints) || selectedTab === SideContentType.substVisualizer) {
        handleUsingSubst(true);
      }
      if (chapter > 2) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      const input: Input = {
        time: Date.now(),
        type: 'chapterSelect',
        data: chapter
      };

      pushLog(input);

      handleChapterSelect(chapter, variant);
    },
    [hasBreakpoints, selectedTab, pushLog]
  );

  const chapterSelect = React.useMemo(
    () => (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={props.playgroundSourceChapter}
        sourceVariant={props.playgroundSourceVariant}
        key="chapter"
        disabled={usingRemoteExecution}
      />
    ),
    [
      chapterSelectHandler,
      isFolderModeEnabled,
      props.playgroundSourceChapter,
      props.playgroundSourceVariant,
      usingRemoteExecution
    ]
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

  const { persistenceUser, persistenceFile } = props;
  // Compute this here to avoid re-rendering the button every keystroke
  const persistenceIsDirty =
    persistenceFile && (!persistenceFile.lastSaved || persistenceFile.lastSaved < lastEdit);
  const persistenceButtons = React.useMemo(() => {
    return (
      <ControlBarGoogleDriveButtons
        isFolderModeEnabled={isFolderModeEnabled}
        currentFile={persistenceFile}
        loggedInAs={persistenceUser}
        isDirty={persistenceIsDirty}
        key="googledrive"
        onClickSaveAs={() => dispatch(persistenceSaveFileAs())}
        onClickOpen={() => dispatch(persistenceOpenPicker())}
        onClickSave={
          persistenceFile ? () => dispatch(persistenceSaveFile(persistenceFile)) : undefined
        }
        onClickLogOut={() => dispatch(logoutGoogle())}
        onPopoverOpening={() => dispatch(persistenceInitialise())}
      />
    );
  }, [isFolderModeEnabled, persistenceFile, persistenceUser, persistenceIsDirty, dispatch]);

  const githubOctokitObject = useTypedSelector(store => store.session.githubOctokitObject);
  const githubSaveInfo = props.githubSaveInfo;
  const githubPersistenceIsDirty =
    githubSaveInfo && (!githubSaveInfo.lastSaved || githubSaveInfo.lastSaved < lastEdit);
  const githubButtons = React.useMemo(() => {
    return (
      <ControlBarGitHubButtons
        key="github"
        isFolderModeEnabled={isFolderModeEnabled}
        loggedInAs={githubOctokitObject.octokit}
        githubSaveInfo={githubSaveInfo}
        isDirty={githubPersistenceIsDirty}
        onClickOpen={() => dispatch(githubOpenFile())}
        onClickSaveAs={() => dispatch(githubSaveFileAs())}
        onClickSave={() => dispatch(githubSaveFile())}
        onClickLogIn={() => dispatch(loginGitHub())}
        onClickLogOut={() => dispatch(logoutGitHub())}
      />
    );
  }, [
    dispatch,
    githubOctokitObject.octokit,
    githubPersistenceIsDirty,
    githubSaveInfo,
    isFolderModeEnabled
  ]);

  const executionTime = React.useMemo(
    () => (
      <ControlBarExecutionTime
        execTime={props.execTime}
        handleChangeExecTime={props.handleChangeExecTime}
        key="execution_time"
      />
    ),
    [props.execTime, props.handleChangeExecTime]
  );

  const stepperStepLimit = React.useMemo(
    () => (
      <ControlBarStepLimit
        stepLimit={props.stepLimit}
        handleChangeStepLimit={limit => dispatch(changeStepLimit(limit, workspaceLocation))}
        handleOnBlurAutoScale={limit => {
          limit % 2 === 0
            ? dispatch(changeStepLimit(limit, workspaceLocation))
            : dispatch(changeStepLimit(limit + 1, workspaceLocation));
        }}
        key="step_limit"
      />
    ),
    [dispatch, props.stepLimit, workspaceLocation]
  );

  const getEditorValue = React.useCallback(
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    () => store.getState().workspaces[workspaceLocation].editorTabs[0].value,
    [store, workspaceLocation]
  );

  const sessionButtons = React.useMemo(
    () => (
      <ControlBarSessionButtons
        isFolderModeEnabled={isFolderModeEnabled}
        editorSessionId={props.editorSessionId}
        getEditorValue={getEditorValue}
        handleSetEditorSessionId={id => dispatch(setEditorSessionId(workspaceLocation, id))}
        sharedbConnected={props.sharedbConnected}
        key="session"
      />
    ),
    [
      dispatch,
      getEditorValue,
      isFolderModeEnabled,
      props.editorSessionId,
      props.sharedbConnected,
      workspaceLocation
    ]
  );

  const shareButton = React.useMemo(() => {
    const queryString = isSicpEditor
      ? Links.playground + '#' + props.initialEditorValueHash
      : props.queryString;
    return (
      <ControlBarShareButton
        handleGenerateLz={() => dispatch(generateLzString())}
        handleShortenURL={s => dispatch(shortenURL(s))}
        handleUpdateShortURL={s => dispatch(updateShortURL(s))}
        queryString={queryString}
        shortURL={props.shortURL}
        isSicp={isSicpEditor}
        key="share"
      />
    );
  }, [dispatch, isSicpEditor, props.initialEditorValueHash, props.queryString, props.shortURL]);

  const toggleFolderModeButton = React.useMemo(() => {
    return (
      <ControlBarToggleFolderModeButton
        isFolderModeEnabled={isFolderModeEnabled}
        isSessionActive={props.editorSessionId !== ''}
        isPersistenceActive={persistenceFile !== undefined || githubSaveInfo.repoName !== ''}
        toggleFolderMode={() => dispatch(toggleFolderMode(workspaceLocation))}
        key="folder"
      />
    );
  }, [
    dispatch,
    githubSaveInfo.repoName,
    isFolderModeEnabled,
    persistenceFile,
    props.editorSessionId,
    workspaceLocation
  ]);

  const playgroundIntroductionTab: SideContentTab = React.useMemo(
    () =>
      makeIntroductionTabFrom(
        generateSourceIntroduction(props.playgroundSourceChapter, props.playgroundSourceVariant)
      ),
    [props.playgroundSourceChapter, props.playgroundSourceVariant]
  );

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [playgroundIntroductionTab];

    const currentLang = props.playgroundSourceChapter;
    const currentVariant = props.playgroundSourceVariant;

    if (!isSourceLanguage(currentLang)) {
      // For now, disable other tabs when not running Source
      return tabs;
    }

    if (currentLang === Chapter.HTML) {
      // For HTML Chapter, HTML Display tab is added only after code is run
      if (props.output.length > 0 && props.output[0].type === 'result') {
        tabs.push(
          makeHtmlDisplayTabFrom(props.output[0] as ResultOutput, errorMsg =>
            dispatch(addHtmlConsoleError(errorMsg, workspaceLocation))
          )
        );
      }
      return tabs;
    }

    if (currentLang === Chapter.FULL_JS || currentLang === Chapter.FULL_TS) {
      // (TEMP) Remove tabs for fullJS until support is integrated
      return [...tabs, dataVisualizerTab];
    }

    if (!usingRemoteExecution) {
      // Don't show the following when using remote execution

      // Enable Data Visualizer for Source Chapter 2 and above
      const shouldShowDataVisualizer = currentLang >= Chapter.SOURCE_2;
      if (shouldShowDataVisualizer) {
        tabs.push(dataVisualizerTab);
      }

      // Enable Env Visualizer for Source Chapter 3 and above
      const shouldShowEnvVisualizer =
        currentLang >= Chapter.SOURCE_3 &&
        currentVariant !== Variant.CONCURRENT &&
        currentVariant !== Variant.NON_DET;
      if (shouldShowEnvVisualizer) {
        tabs.push(makeEnvVisualizerTabFrom(workspaceLocation));
      }

      // Enable Subst Visualizer only for default Source 1 & 2
      const shouldShowSubstVisualizer =
        currentLang <= Chapter.SOURCE_2 &&
        (currentVariant === Variant.DEFAULT || currentVariant === Variant.NATIVE);
      if (shouldShowSubstVisualizer) {
        tabs.push(makeSubstVisualizerTabFrom(props.output));
      }
    }

    if (!isSicpEditor) {
      tabs.push(remoteExecutionTab);
    }

    return tabs;
  }, [
    playgroundIntroductionTab,
    props.playgroundSourceChapter,
    props.playgroundSourceVariant,
    props.output,
    usingRemoteExecution,
    isSicpEditor,
    dispatch,
    workspaceLocation,
    remoteExecutionTab
  ]);

  // Remove Intro and Remote Execution tabs for mobile
  const mobileTabs = [...tabs].filter(({ id }) => !(id && desktopOnlyTabIds.includes(id)));

  const onLoadMethod = React.useCallback(
    (editor: Ace.Editor) => {
      const addFold = () => {
        editor.getSession().addFold('    ', new Range(1, 0, props.prependLength!, 0));
        editor.renderer.off('afterRender', addFold);
      };

      editor.renderer.on('afterRender', addFold);
    },
    [props.prependLength]
  );

  const onChangeMethod = React.useCallback(
    (newCode: string, delta: CodeDelta) => {
      const input: Input = {
        time: Date.now(),
        type: 'codeDelta',
        data: delta
      };

      pushLog(input);
      dispatch(toggleUpdateEnv(true, workspaceLocation));
      dispatch(setEditorHighlightedLines(workspaceLocation, 0, []));
    },
    [pushLog, dispatch, workspaceLocation]
  );

  const onCursorChangeMethod = React.useCallback(
    (selection: any) => {
      const input: Input = {
        time: Date.now(),
        type: 'cursorPositionChange',
        data: selection.getCursor()
      };

      pushLog(input);
    },
    [pushLog]
  );

  const onSelectionChangeMethod = React.useCallback(
    (selection: any) => {
      const range: SelectionRange = selection.getRange();
      const isBackwards: boolean = selection.isBackwards();
      if (!isEqual(range.start, range.end)) {
        const input: Input = {
          time: Date.now(),
          type: 'selectionRangeData',
          data: { range, isBackwards }
        };

        pushLog(input);
      }
    },
    [pushLog]
  );

  const handleEditorUpdateBreakpoints = React.useCallback(
    (editorTabIndex: number, breakpoints: string[]) => {
      // get rid of holes in array
      const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
      if (numberOfBreakpoints > 0) {
        setHasBreakpoints(true);
        if (propsRef.current.playgroundSourceChapter <= 2) {
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
      propsRef.current.handleEditorUpdateBreakpoints(editorTabIndex, breakpoints);
      dispatch(toggleUpdateEnv(true, workspaceLocation));
    },
    [selectedTab, dispatch, workspaceLocation]
  );

  const replDisabled =
    props.playgroundSourceChapter === Chapter.HTML ||
    props.playgroundSourceVariant === Variant.CONCURRENT ||
    usingRemoteExecution;

  const setActiveEditorTabIndex = React.useCallback(
    (activeEditorTabIndex: number | null) =>
      dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
    [dispatch, workspaceLocation]
  );
  const removeEditorTabByIndex = React.useCallback(
    (editorTabIndex: number) => dispatch(removeEditorTab(workspaceLocation, editorTabIndex)),
    [dispatch, workspaceLocation]
  );

  const editorContainerProps: NormalEditorContainerProps = {
    ..._.pick(props, 'editorSessionId', 'isEditorAutorun'),
    editorVariant: 'normal',
    baseFilePath: WORKSPACE_BASE_PATHS[workspaceLocation],
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex,
    editorTabs: props.editorTabs.map(convertEditorTabStateToProps),
    handleDeclarationNavigate: React.useCallback(
      (cursorPosition: Position) =>
        dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
      [dispatch, workspaceLocation]
    ),
    handleEditorEval: memoizedHandlers.handleEditorEval,
    handlePromptAutocomplete: React.useCallback(
      (row: number, col: number, callback: any) =>
        dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
      [dispatch, workspaceLocation]
    ),
    handleSendReplInputToOutput: React.useCallback(
      (code: string) => dispatch(sendReplInputToOutput(code, workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    handleSetSharedbConnected: React.useCallback(
      (connected: boolean) => dispatch(setSharedbConnected(workspaceLocation, connected)),
      [dispatch, workspaceLocation]
    ),
    onChange: onChangeMethod,
    onCursorChange: onCursorChangeMethod,
    onSelectionChange: onSelectionChangeMethod,
    onLoad: isSicpEditor && props.prependLength ? onLoadMethod : undefined,
    sourceChapter: props.playgroundSourceChapter,
    externalLibraryName,
    sourceVariant: props.playgroundSourceVariant,
    handleEditorValueChange: onEditorValueChange,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints
  };

  const replProps = {
    ..._.pick(props, 'output', 'replValue', 'handleReplEval', 'usingSubst'),
    handleBrowseHistoryDown: React.useCallback(
      () => dispatch(browseReplHistoryDown(workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    handleBrowseHistoryUp: React.useCallback(
      () => dispatch(browseReplHistoryUp(workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    handleReplValueChange: React.useCallback(
      (newValue: string) => dispatch(updateReplValue(newValue, workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    sourceChapter: props.playgroundSourceChapter,
    sourceVariant: props.playgroundSourceVariant,
    externalLibrary: ExternalLibraryName.NONE, // temporary placeholder as we phase out libraries
    hidden:
      selectedTab === SideContentType.substVisualizer ||
      selectedTab === SideContentType.envVisualizer,
    inputHidden: replDisabled,
    replButtons: [replDisabled ? null : evalButton, clearButton],
    disableScrolling: isSicpEditor
  };

  const sideBarProps: { tabs: SideBarTab[] } = React.useMemo(() => {
    // The sidebar is rendered if and only if there is at least one tab present.
    // Because whether the sidebar is rendered or not affects the sidebar resizing
    // logic, we cannot defer the decision on which sidebar tabs should be rendered
    // to the sidebar as it would be too late - the sidebar resizing logic in the
    // workspace would not be able to act on that information. Instead, we need to
    // determine which sidebar tabs should be rendered here.
    return {
      tabs: [
        ...(isFolderModeEnabled
          ? [
              {
                label: 'Folder',
                body: (
                  <FileSystemView
                    workspaceLocation="playground"
                    basePath={WORKSPACE_BASE_PATHS[workspaceLocation]}
                  />
                ),
                iconName: IconNames.FOLDER_CLOSE,
                id: SideContentType.folder
              }
            ]
          : [])
      ]
    };
  }, [isFolderModeEnabled, workspaceLocation]);

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [
        autorunButtons,
        props.playgroundSourceChapter === Chapter.FULL_JS ? null : shareButton,
        chapterSelect,
        isSicpEditor ? null : sessionButtons,
        // Local imports/exports require Source 2+ as Source 1 does not have lists.
        props.playgroundSourceChapter === Chapter.SOURCE_1 ? null : toggleFolderModeButton,
        persistenceButtons,
        githubButtons,
        usingRemoteExecution || !isSourceLanguage(props.playgroundSourceChapter)
          ? null
          : props.usingSubst
          ? stepperStepLimit
          : executionTime
      ]
    },
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: React.useCallback(
      change => dispatch(changeSideContentHeight(change, workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    replProps: replProps,
    sideBarProps: sideBarProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: isSicpEditor ? 'sicp' : 'playground',
      sideContentHeight: props.sideContentHeight
    },
    sideContentIsResizeable: selectedTab !== SideContentType.substVisualizer
  };

  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps: editorContainerProps,
    replProps: replProps,
    sideBarProps: sideBarProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [
          autorunButtons,
          chapterSelect,
          props.playgroundSourceChapter === Chapter.FULL_JS ? null : shareButton,
          isSicpEditor ? null : sessionButtons,
          // Local imports/exports require Source 2+ as Source 1 does not have lists.
          props.playgroundSourceChapter === Chapter.SOURCE_1 ? null : toggleFolderModeButton,
          persistenceButtons,
          githubButtons
        ]
      },
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: mobileTabs,
        afterDynamicTabs: []
      },
      workspaceLocation: isSicpEditor ? 'sicp' : 'playground'
    }
  };

  return isMobileBreakpoint ? (
    <div className={classNames('Playground', Classes.DARK, isGreen ? 'GreenScreen' : undefined)}>
      <MobileWorkspace {...mobileWorkspaceProps} />
    </div>
  ) : (
    <HotKeys
      className={classNames('Playground', Classes.DARK, isGreen ? 'GreenScreen' : undefined)}
      keyMap={keyMap}
      handlers={handlers}
    >
      <Workspace {...workspaceProps} />
    </HotKeys>
  );
};

export default Playground;
