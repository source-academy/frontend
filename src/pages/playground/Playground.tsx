import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { Ace, Range } from 'ace-builds';
import classNames from 'classnames';
import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import { Chapter, Variant } from 'js-slang/dist/types';
import _, { isEqual } from 'lodash';
import { decompressFromEncodedURIComponent } from 'lz-string';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { useDispatch, useStore } from 'react-redux';
import { RouteComponentProps, useHistory, useLocation } from 'react-router';
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
import SideContentHtmlDisplay from 'src/commons/sideContent/SideContentHtmlDisplay';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';
import {
  showFullJSWarningOnUrlLoad,
  showFulTSWarningOnUrlLoad,
  showHTMLDisclaimer
} from 'src/commons/utils/WarningDialogHelper';
import {
  addHtmlConsoleError,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  changeStepLimit,
  evalEditor,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  sendReplInputToOutput,
  setFolderMode,
  toggleEditorAutorun,
  toggleFolderMode,
  updateActiveEditorTabIndex,
  updateReplValue
} from 'src/commons/workspace/WorkspaceActions';
import { EditorTabState, WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
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
import FileSystemView from '../../commons/fileSystemView/FileSystemView';
import Markdown from '../../commons/Markdown';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import { SideBarTab } from '../../commons/sideBar/SideBar';
import SideContentRemoteExecution from '../../commons/sideContent/remoteExecution/SideContentRemoteExecution';
import SideContentDataVisualizer from '../../commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../commons/sideContent/SideContentEnvVisualizer';
import SideContentSubstVisualizer from '../../commons/sideContent/SideContentSubstVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import { Links } from '../../commons/utils/Constants';
import { generateSourceIntroduction } from '../../commons/utils/IntroductionHelper';
import { stringParamToInt } from '../../commons/utils/ParamParseHelper';
import { parseQuery } from '../../commons/utils/QueryHelper';
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
  playgroundSourceChapter: number;
  playgroundSourceVariant: Variant;
  courseSourceChapter?: number;
  courseSourceVariant?: Variant;
  stepLimit: number;
  sharedbConnected: boolean;
  usingSubst: boolean;
  persistenceUser: string | undefined;
  persistenceFile: PersistenceFile | undefined;
  githubOctokitObject: { octokit: Octokit | undefined };
  githubSaveInfo: GitHubSaveInfo;
};

const keyMap = { goGreen: 'h u l k' };

export async function handleHash(hash: string, props: PlaygroundProps) {
  const qs = parseQuery(hash);

  const chapter = stringParamToInt(qs.chap) || undefined;
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
    const programLz = qs.lz ?? qs.prgrm;
    const program = programLz && decompressFromEncodedURIComponent(programLz);
    if (program) {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      props.handleEditorValueChange(0, program);
      props.handleEditorUpdateBreakpoints(0, []);
    }
    const variant: Variant =
      sourceLanguages.find(
        language => language.chapter === chapter && language.variant === qs.variant
      )?.variant ?? Variant.DEFAULT;
    if (chapter) {
      props.handleChapterSelect(chapter, variant);
    }

    const execTime = Math.max(stringParamToInt(qs.exec || '1000') || 1000, 1000);
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
    () => ({
      label: 'Remote Execution',
      iconName: IconNames.SATELLITE,
      body: (
        <SideContentRemoteExecution
          workspace="playground"
          secretParams={deviceSecret || undefined}
          callbackFunction={setDeviceSecret}
        />
      ),
      id: SideContentType.remoteExecution
    }),
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
    handleHash(hash, propsRef.current);
  }, [dispatch, hash, props.courseSourceChapter, props.courseSourceVariant, workspaceLocation]);

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

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      const { handleUsingSubst, handleReplOutputClear, playgroundSourceChapter } = propsRef.current;

      /**
       * Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
       */
      if (
        !(
          prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun
        )
      ) {
        if (playgroundSourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
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

  const processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      isStepperOutput(editorOutput.value[0])
    ) {
      return editorOutput.value;
    } else {
      return [];
    }
  };

  const pushLog = React.useCallback(
    (newInput: Input) => {
      log(sessionId, newInput);
    },
    [sessionId]
  );

  const handleEditorEval = React.useCallback(
    () => dispatch(evalEditor(workspaceLocation)),
    [dispatch, workspaceLocation]
  );

  const handleInterruptEval = React.useCallback(
    () => dispatch(beginInterruptExecution(workspaceLocation)),
    [dispatch, workspaceLocation]
  );
  const handleToggleEditorAutorun = React.useCallback(
    () => dispatch(toggleEditorAutorun(workspaceLocation)),
    [dispatch, workspaceLocation]
  );
  const handleDebuggerPause = React.useCallback(
    () => dispatch(beginDebuggerPause(workspaceLocation)),
    [dispatch, workspaceLocation]
  );
  const handleDebuggerReset = React.useCallback(
    () => dispatch(debuggerReset(workspaceLocation)),
    [dispatch, workspaceLocation]
  );
  const handleDebuggerResume = React.useCallback(
    () => dispatch(debuggerResume(workspaceLocation)),
    [dispatch, workspaceLocation]
  );

  const autorunButtons = React.useMemo(() => {
    return (
      <ControlBarAutorunButtons
        isDebugging={props.isDebugging}
        isEditorAutorun={props.isEditorAutorun}
        isRunning={props.isRunning}
        handleInterruptEval={handleInterruptEval}
        handleToggleEditorAutorun={handleToggleEditorAutorun}
        handleEditorEval={handleEditorEval}
        handleDebuggerPause={handleDebuggerPause}
        handleDebuggerReset={handleDebuggerReset}
        handleDebuggerResume={handleDebuggerResume}
        key="autorun"
        autorunDisabled={usingRemoteExecution}
        sourceChapter={props.playgroundSourceChapter}
        // Disable pause for non-Source languages since they cannot be paused
        pauseDisabled={usingRemoteExecution || !isSourceLanguage(props.playgroundSourceChapter)}
      />
    );
  }, [
    handleDebuggerPause,
    handleDebuggerReset,
    handleDebuggerResume,
    handleEditorEval,
    handleInterruptEval,
    handleToggleEditorAutorun,
    props.isDebugging,
    props.isEditorAutorun,
    props.isRunning,
    props.playgroundSourceChapter,
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
        sourceChapter={props.playgroundSourceChapter}
        sourceVariant={props.playgroundSourceVariant}
        key="chapter"
        disabled={usingRemoteExecution}
      />
    ),
    [
      chapterSelectHandler,
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
  }, [dispatch, persistenceUser, persistenceFile, persistenceIsDirty]);

  const githubOctokitObject = useTypedSelector(store => store.session.githubOctokitObject);
  const githubSaveInfo = props.githubSaveInfo;
  const githubPersistenceIsDirty =
    githubSaveInfo && (!githubSaveInfo.lastSaved || githubSaveInfo.lastSaved < lastEdit);
  const githubButtons = React.useMemo(() => {
    return (
      <ControlBarGitHubButtons
        key="github"
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
  }, [dispatch, githubOctokitObject, githubPersistenceIsDirty, githubSaveInfo]);

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
    () => store.getState().workspaces[workspaceLocation].editorTabs[0].value,
    [store, workspaceLocation]
  );

  const sessionButtons = React.useMemo(
    () => (
      <ControlBarSessionButtons
        editorSessionId={props.editorSessionId}
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        getEditorValue={getEditorValue}
        handleSetEditorSessionId={id => dispatch(setEditorSessionId(workspaceLocation, id))}
        sharedbConnected={props.sharedbConnected}
        key="session"
      />
    ),
    [dispatch, getEditorValue, props.editorSessionId, props.sharedbConnected, workspaceLocation]
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
    // TODO: Remove this once the Folder mode is ready for production.
    if (true) {
      return <></>;
    }

    return (
      <ControlBarToggleFolderModeButton
        isFolderModeEnabled={isFolderModeEnabled}
        toggleFolderMode={() => dispatch(toggleFolderMode(workspaceLocation))}
        key="folder"
      />
    );
  }, [dispatch, isFolderModeEnabled, workspaceLocation]);

  const playgroundIntroductionTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Introduction',
      iconName: IconNames.HOME,
      body: (
        <Markdown
          content={generateSourceIntroduction(
            props.playgroundSourceChapter,
            props.playgroundSourceVariant
          )}
          openLinksInNewWindow={true}
        />
      ),
      id: SideContentType.introduction
    }),
    [props.playgroundSourceChapter, props.playgroundSourceVariant]
  );

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [playgroundIntroductionTab];

    // For HTML Chapter, HTML Display tab is added only after code is run
    if (props.playgroundSourceChapter === Chapter.HTML) {
      if (props.output.length > 0 && props.output[0].type === 'result') {
        tabs.push({
          label: 'HTML Display',
          iconName: IconNames.MODAL,
          body: (
            <SideContentHtmlDisplay
              content={(props.output[0] as ResultOutput).value}
              handleAddHtmlConsoleError={errorMsg =>
                dispatch(addHtmlConsoleError(errorMsg, workspaceLocation))
              }
            />
          ),
          id: SideContentType.htmlDisplay
        });
      }
      return tabs;
    }

    // (TEMP) Remove tabs for fullJS until support is integrated
    if (
      props.playgroundSourceChapter === Chapter.FULL_JS ||
      props.playgroundSourceChapter === Chapter.FULL_TS
    ) {
      return [...tabs, dataVisualizerTab];
    }

    if (props.playgroundSourceChapter >= 2 && !usingRemoteExecution) {
      // Enable Data Visualizer for Source Chapter 2 and above
      tabs.push(dataVisualizerTab);
    }
    if (
      props.playgroundSourceChapter >= 3 &&
      props.playgroundSourceVariant !== Variant.CONCURRENT &&
      props.playgroundSourceVariant !== Variant.NON_DET &&
      !usingRemoteExecution
    ) {
      // Enable Env Visualizer for Source Chapter 3 and above
      tabs.push(envVisualizerTab);
    }

    if (
      props.playgroundSourceChapter <= 2 &&
      (props.playgroundSourceVariant === Variant.DEFAULT ||
        props.playgroundSourceVariant === Variant.NATIVE)
    ) {
      // Enable Subst Visualizer only for default Source 1 & 2
      tabs.push({
        label: 'Stepper',
        iconName: IconNames.FLOW_REVIEW,
        body: <SideContentSubstVisualizer content={processStepperOutput(props.output)} />,
        id: SideContentType.substVisualizer
      });
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
    },
    [pushLog]
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
    },
    [selectedTab]
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
    baseFilePath: WORKSPACE_BASE_PATHS.playground,
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
    handleEditorEval,
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
    hidden: selectedTab === SideContentType.substVisualizer,
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
                    basePath={WORKSPACE_BASE_PATHS.playground}
                  />
                ),
                iconName: IconNames.FOLDER_CLOSE,
                id: SideContentType.folder
              }
            ]
          : [])
      ]
    };
  }, [isFolderModeEnabled]);

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
          persistenceButtons,
          githubButtons,
          toggleFolderModeButton
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

const mobileOnlyTabIds: readonly SideContentType[] = [
  SideContentType.mobileEditor,
  SideContentType.mobileEditorRun
];
const desktopOnlyTabIds: readonly SideContentType[] = [SideContentType.introduction];

const dataVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer />,
  id: SideContentType.dataVisualizer
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualizer
};

export default Playground;
