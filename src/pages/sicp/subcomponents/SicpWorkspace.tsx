import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Ace, Range } from 'ace-builds';
import { FSModule } from 'browserfs/dist/node/core/FS';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import { isEqual } from 'lodash';
import { decompressFromEncodedURIComponent } from 'lz-string';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useDispatch } from 'react-redux';
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
import { setSharedbConnected } from 'src/commons/collabEditing/CollabEditingActions';
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
  changeExecTime,
  changeSideContentHeight,
  changeStepLimit,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  removeEditorTabsForDirectory,
  sendReplInputToOutput,
  setEditorBreakpoint,
  setEditorHighlightedLines,
  setFolderMode,
  toggleEditorAutorun,
  toggleFolderMode,
  toggleUpdateEnv,
  toggleUsingEnv,
  toggleUsingSubst,
  updateActiveEditorTabIndex,
  updateEditorValue,
  updateEnvSteps,
  updateEnvStepsTotal,
  updateReplValue
} from 'src/commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
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
  playgroundConfigLanguage,
  shortenURL,
  updateShortURL
} from 'src/features/playground/PlaygroundActions';
import {
  dataVisualizerTab,
  desktopOnlyTabIds,
  makeEnvVisualizerTabFrom,
  makeHtmlDisplayTabFrom,
  makeIntroductionTabFrom,
  makeSubstVisualizerTabFrom,
  mobileOnlyTabIds
} from 'src/pages/playground/PlaygroundTabs';

import {
  getDefaultFilePath,
  getLanguageConfig,
  isSourceLanguage,
  ResultOutput,
  SALanguage
} from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../commons/controlBar/ControlBarEvalButton';
import { ControlBarExecutionTime } from '../../../commons/controlBar/ControlBarExecutionTime';
import { ControlBarGoogleDriveButtons } from '../../../commons/controlBar/ControlBarGoogleDriveButtons';
import { ControlBarShareButton } from '../../../commons/controlBar/ControlBarShareButton';
import { ControlBarStepLimit } from '../../../commons/controlBar/ControlBarStepLimit';
import { ControlBarToggleFolderModeButton } from '../../../commons/controlBar/ControlBarToggleFolderModeButton';
import { ControlBarGitHubButtons } from '../../../commons/controlBar/github/ControlBarGitHubButtons';
import {
  convertEditorTabStateToProps,
  NormalEditorContainerProps
} from '../../../commons/editor/EditorContainer';
import { Position } from '../../../commons/editor/EditorTypes';
import { overwriteFilesInWorkspace } from '../../../commons/fileSystem/utils';
import FileSystemView from '../../../commons/fileSystemView/FileSystemView';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../../commons/mobileWorkspace/MobileWorkspace';
import { SideBarTab } from '../../../commons/sideBar/SideBar';
import { SideContentTab, SideContentType } from '../../../commons/sideContent/SideContentTypes';
import { Links } from '../../../commons/utils/Constants';
import { generateLanguageIntroduction } from '../../../commons/utils/IntroductionHelper';
import { convertParamToBoolean, convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import { IParsedQuery, parseQuery } from '../../../commons/utils/QueryHelper';
import Workspace, { WorkspaceProps } from '../../../commons/workspace/Workspace';
import { initSession, log } from '../../../features/eventLogging';
import {
  CodeDelta,
  Input,
  SelectionRange
} from '../../../features/sourceRecorder/SourceRecorderTypes';
import { WORKSPACE_BASE_PATHS } from '../../fileSystem/createInBrowserFileSystem';

export type PlaygroundProps = {
  initialEditorValueHash?: string;
  prependLength?: number;
  handleCloseEditor?: () => void;
};

const keyMap = { goGreen: 'h u l k' };

export async function handleHash(
  hash: string,
  handlers: {
    handleChapterSelect: (chapter: Chapter, variant: Variant) => void;
    handleChangeExecTime: (execTime: number) => void;
  },
  workspaceLocation: WorkspaceLocation,
  dispatch: Dispatch<AnyAction>,
  fileSystem: FSModule | null
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
    if (fileSystem !== null) {
      await overwriteFilesInWorkspace(workspaceLocation, fileSystem, files);
    }

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
    if (chapter) {
      // TODO: To migrate the state logic away from playgroundSourceChapter
      //       and playgroundSourceVariant into the language config instead
      const languageConfig = getLanguageConfig(chapter, qs.variant as Variant);
      handlers.handleChapterSelect(chapter, languageConfig.variant);
      // Hardcoded for Playground only for now, while we await workspace refactoring
      // to decouple the SicpWorkspace from the Playground.
      dispatch(playgroundConfigLanguage(languageConfig));
    }

    const execTime = Math.max(convertParamToInt(qs.exec || '1000') || 1000, 1000);
    if (execTime) {
      handlers.handleChangeExecTime(execTime);
    }
  }
}

const SicpWorkspace: React.FC<PlaygroundProps> = props => {
  const workspaceLocation: WorkspaceLocation = 'sicp';
  const { isMobileBreakpoint } = useResponsive();

  // Selectors and handlers migrated over from deprecated withRouter implementation
  const {
    editorTabs,
    editorSessionId,
    execTime,
    stepLimit,
    isEditorAutorun,
    isRunning,
    isDebugging,
    output,
    replValue,
    sideContentHeight,
    usingSubst,
    isFolderModeEnabled,
    activeEditorTabIndex,
    context: { chapter: playgroundSourceChapter, variant: playgroundSourceVariant }
  } = useTypedSelector(state => state.workspaces[workspaceLocation]);
  const fileSystem = useTypedSelector(state => state.fileSystem.inBrowserFileSystem);
  const { shortURL, persistenceFile, githubSaveInfo } = useTypedSelector(state => state.playground);
  const {
    sourceChapter: courseSourceChapter,
    sourceVariant: courseSourceVariant,
    googleUser: persistenceUser,
    githubOctokitObject
  } = useTypedSelector(state => state.session);

  const dispatch = useDispatch();
  const {
    handleChangeExecTime,
    handleChapterSelect,
    handleEditorValueChange,
    handleSetEditorBreakpoints,
    handleReplEval,
    handleReplOutputClear,
    handleUsingEnv,
    handleUsingSubst
  } = useMemo(() => {
    return {
      handleChangeExecTime: (execTime: number) =>
        dispatch(changeExecTime(execTime, workspaceLocation)),
      handleChapterSelect: (chapter: Chapter, variant: Variant) =>
        dispatch(chapterSelect(chapter, variant, workspaceLocation)),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        dispatch(updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue)),
      handleSetEditorBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        dispatch(setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints)),
      handleReplEval: () => dispatch(evalRepl(workspaceLocation)),
      handleReplOutputClear: () => dispatch(clearReplOutput(workspaceLocation)),
      handleUsingEnv: (usingEnv: boolean) => dispatch(toggleUsingEnv(usingEnv, workspaceLocation)),
      handleUsingSubst: (usingSubst: boolean) =>
        dispatch(toggleUsingSubst(usingSubst, workspaceLocation))
    };
  }, [dispatch, workspaceLocation]);

  const [lastEdit, setLastEdit] = useState(new Date());
  const [isGreen, setIsGreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(SideContentType.introduction);
  const [hasBreakpoints, setHasBreakpoints] = useState(false);
  const [sessionId, setSessionId] = useState(() =>
    initSession('playground', {
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: editorTabs[0]?.value ?? '',
      chapter: playgroundSourceChapter
    })
  );

  // this is still used by remote execution (EV3)
  // specifically, for the editor Ctrl+B to work
  const externalLibraryName = useTypedSelector(
    state => state.workspaces.playground.externalLibrary
  );

  useEffect(() => {
    // When the editor session Id changes, then treat it as a new session.
    setSessionId(
      initSession('playground', {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        editorValue: editorTabs[0]?.value ?? '',
        chapter: playgroundSourceChapter
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorSessionId]);

  const hash = props.initialEditorValueHash;

  useEffect(() => {
    if (!hash) {
      // If not a accessing via shared link, use the Source chapter and variant in the current course
      if (courseSourceChapter && courseSourceVariant) {
        handleChapterSelect(courseSourceChapter, courseSourceVariant);
        // TODO: To migrate the state logic away from playgroundSourceChapter
        //       and playgroundSourceVariant into the language config instead
        const languageConfig = getLanguageConfig(courseSourceChapter, courseSourceVariant);
        // Hardcoded for Playground only for now, while we await workspace refactoring
        // to decouple the SicpWorkspace from the Playground.
        dispatch(playgroundConfigLanguage(languageConfig));
        // Disable Folder mode when forcing the Source chapter and variant to follow the current course's.
        // This is because Folder mode only works in Source 2+.
        dispatch(setFolderMode(workspaceLocation, false));
      }
      return;
    }
    handleHash(
      hash,
      { handleChangeExecTime, handleChapterSelect },
      workspaceLocation,
      dispatch,
      fileSystem
    );
  }, [
    dispatch,
    fileSystem,
    hash,
    courseSourceChapter,
    courseSourceVariant,
    workspaceLocation,
    handleChapterSelect,
    handleChangeExecTime
  ]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  useEffect(() => {
    if (isMobileBreakpoint && desktopOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.mobileEditor);
    } else if (!isMobileBreakpoint && mobileOnlyTabIds.includes(selectedTab)) {
      setSelectedTab(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, selectedTab]);

  const handlers = useMemo(
    () => ({
      goGreen: () => setIsGreen(!isGreen)
    }),
    [isGreen]
  );

  const onEditorValueChange = useCallback(
    (editorTabIndex, newEditorValue) => {
      setLastEdit(new Date());
      handleEditorValueChange(editorTabIndex, newEditorValue);
    },
    [handleEditorValueChange]
  );

  const handleEnvVisualiserReset = useCallback(() => {
    handleUsingEnv(false);
    EnvVisualizer.clearEnv();
    dispatch(updateEnvSteps(-1, workspaceLocation));
    dispatch(updateEnvStepsTotal(0, workspaceLocation));
    dispatch(toggleUpdateEnv(true, workspaceLocation));
    dispatch(setEditorHighlightedLines(workspaceLocation, 0, []));
  }, [dispatch, workspaceLocation, handleUsingEnv]);

  const onChangeTabs = useCallback(
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
    [
      hasBreakpoints,
      handleEnvVisualiserReset,
      playgroundSourceChapter,
      handleUsingSubst,
      handleUsingEnv,
      handleReplOutputClear
    ]
  );

  const pushLog = useCallback(
    (newInput: Input) => {
      log(sessionId, newInput);
    },
    [sessionId]
  );

  const autorunButtonHandlers = useMemo(() => {
    return {
      handleEditorEval: () => dispatch(evalEditor(workspaceLocation)),
      handleInterruptEval: () => dispatch(beginInterruptExecution(workspaceLocation)),
      handleToggleEditorAutorun: () => dispatch(toggleEditorAutorun(workspaceLocation)),
      handleDebuggerPause: () => dispatch(beginDebuggerPause(workspaceLocation)),
      handleDebuggerReset: () => dispatch(debuggerReset(workspaceLocation)),
      handleDebuggerResume: () => dispatch(debuggerResume(workspaceLocation))
    };
  }, [dispatch, workspaceLocation]);

  const languageConfig: SALanguage = useTypedSelector(state => state.playground.languageConfig);

  const autorunButtons = useMemo(() => {
    return (
      <ControlBarAutorunButtons
        isEntrypointFileDefined={activeEditorTabIndex !== null}
        isDebugging={isDebugging}
        isEditorAutorun={isEditorAutorun}
        isRunning={isRunning}
        key="autorun"
        autorunDisabled={false}
        sourceChapter={languageConfig.chapter}
        // Disable pause for non-Source languages since they cannot be paused
        pauseDisabled={!isSourceLanguage(languageConfig.chapter)}
        {...autorunButtonHandlers}
      />
    );
  }, [
    activeEditorTabIndex,
    isDebugging,
    isEditorAutorun,
    isRunning,
    languageConfig.chapter,
    autorunButtonHandlers
  ]);

  const chapterSelectHandler = useCallback(
    (sublanguage: SALanguage, e: any) => {
      const { chapter, variant } = sublanguage;
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
      // Hardcoded for Playground only for now, while we await workspace refactoring
      // to decouple the SicpWorkspace from the Playground.
      dispatch(playgroundConfigLanguage(sublanguage));
    },
    [
      dispatch,
      hasBreakpoints,
      selectedTab,
      pushLog,
      handleReplOutputClear,
      handleUsingSubst,
      handleChapterSelect
    ]
  );

  const chapterSelectButton = useMemo(
    () => (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        isFolderModeEnabled={isFolderModeEnabled}
        sourceChapter={languageConfig.chapter}
        sourceVariant={languageConfig.variant}
        key="chapter"
        disabled={false}
      />
    ),
    [chapterSelectHandler, isFolderModeEnabled, languageConfig.chapter, languageConfig.variant]
  );

  const clearButton = useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarClearButton handleReplOutputClear={handleReplOutputClear} key="clear_repl" />
      ),
    [handleReplOutputClear, selectedTab]
  );

  const evalButton = useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarEvalButton
          handleReplEval={handleReplEval}
          isRunning={isRunning}
          key="eval_repl"
        />
      ),
    [handleReplEval, isRunning, selectedTab]
  );

  // Compute this here to avoid re-rendering the button every keystroke
  const persistenceIsDirty =
    persistenceFile && (!persistenceFile.lastSaved || persistenceFile.lastSaved < lastEdit);
  const persistenceButtons = useMemo(() => {
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

  const githubPersistenceIsDirty =
    githubSaveInfo && (!githubSaveInfo.lastSaved || githubSaveInfo.lastSaved < lastEdit);
  const githubButtons = useMemo(() => {
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

  const executionTime = useMemo(
    () => (
      <ControlBarExecutionTime
        execTime={execTime}
        handleChangeExecTime={handleChangeExecTime}
        key="execution_time"
      />
    ),
    [execTime, handleChangeExecTime]
  );

  const stepperStepLimit = useMemo(
    () => (
      <ControlBarStepLimit
        stepLimit={stepLimit}
        handleChangeStepLimit={limit => dispatch(changeStepLimit(limit, workspaceLocation))}
        handleOnBlurAutoScale={limit => {
          limit % 2 === 0
            ? dispatch(changeStepLimit(limit, workspaceLocation))
            : dispatch(changeStepLimit(limit + 1, workspaceLocation));
        }}
        key="step_limit"
      />
    ),
    [dispatch, stepLimit, workspaceLocation]
  );

  const shareButton = useMemo(() => {
    const qs = Links.playground + '#' + props.initialEditorValueHash;
    return (
      <ControlBarShareButton
        handleGenerateLz={() => dispatch(generateLzString())}
        handleShortenURL={s => dispatch(shortenURL(s))}
        handleUpdateShortURL={s => dispatch(updateShortURL(s))}
        queryString={qs}
        shortURL={shortURL}
        isSicp
        key="share"
      />
    );
  }, [dispatch, props.initialEditorValueHash, shortURL]);

  const toggleFolderModeButton = useMemo(() => {
    return (
      <ControlBarToggleFolderModeButton
        isFolderModeEnabled={isFolderModeEnabled}
        isSessionActive={editorSessionId !== ''}
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
    editorSessionId,
    workspaceLocation
  ]);

  useEffect(() => {
    // TODO: To migrate the state logic away from playgroundSourceChapter
    //       and playgroundSourceVariant into the language config instead
    const languageConfigToSet = getLanguageConfig(playgroundSourceChapter, playgroundSourceVariant);
    // Hardcoded for Playground only for now, while we await workspace refactoring
    // to decouple the SicpWorkspace from the Playground.
    dispatch(playgroundConfigLanguage(languageConfigToSet));
  }, [dispatch, playgroundSourceChapter, playgroundSourceVariant]);

  const shouldShowDataVisualizer = languageConfig.supports.dataVisualizer;
  const shouldShowEnvVisualizer = languageConfig.supports.envVisualizer;
  const shouldShowSubstVisualizer = languageConfig.supports.substVisualizer;

  const playgroundIntroductionTab: SideContentTab = useMemo(
    () => makeIntroductionTabFrom(generateLanguageIntroduction(languageConfig)),
    [languageConfig]
  );
  const tabs = useMemo(() => {
    const tabs: SideContentTab[] = [playgroundIntroductionTab];

    const currentLang = languageConfig.chapter;
    if (currentLang === Chapter.HTML) {
      // For HTML Chapter, HTML Display tab is added only after code is run
      if (output.length > 0 && output[0].type === 'result') {
        tabs.push(
          makeHtmlDisplayTabFrom(output[0] as ResultOutput, errorMsg =>
            dispatch(addHtmlConsoleError(errorMsg, workspaceLocation))
          )
        );
      }
      return tabs;
    }

    if (shouldShowDataVisualizer) {
      tabs.push(dataVisualizerTab);
    }
    if (shouldShowEnvVisualizer) {
      tabs.push(makeEnvVisualizerTabFrom(workspaceLocation));
    }
    if (shouldShowSubstVisualizer) {
      tabs.push(makeSubstVisualizerTabFrom(output));
    }

    return tabs;
  }, [
    playgroundIntroductionTab,
    languageConfig.chapter,
    output,
    dispatch,
    workspaceLocation,
    shouldShowDataVisualizer,
    shouldShowEnvVisualizer,
    shouldShowSubstVisualizer
  ]);

  // Remove Intro tab for mobile
  const mobileTabs = [...tabs].filter(({ id }) => !(id && desktopOnlyTabIds.includes(id)));

  const onLoadMethod = useCallback(
    (editor: Ace.Editor) => {
      const addFold = () => {
        editor.getSession().addFold('    ', new Range(1, 0, props.prependLength!, 0));
        editor.renderer.off('afterRender', addFold);
      };

      editor.renderer.on('afterRender', addFold);
    },
    [props.prependLength]
  );

  const onChangeMethod = useCallback(
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

  const onCursorChangeMethod = useCallback(
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

  const onSelectionChangeMethod = useCallback(
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

  const handleEditorUpdateBreakpoints = useCallback(
    (editorTabIndex: number, breakpoints: string[]) => {
      // get rid of holes in array
      const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
      if (numberOfBreakpoints > 0) {
        setHasBreakpoints(true);
        if (playgroundSourceChapter <= 2) {
          /**
           * There are breakpoints set on Source Chapter 2, so we set the
           * Redux state for the editor to evaluate to the substituter
           */

          handleUsingSubst(true);
        }
      }
      if (numberOfBreakpoints === 0) {
        setHasBreakpoints(false);

        if (selectedTab !== SideContentType.substVisualizer) {
          handleReplOutputClear();
          handleUsingSubst(false);
        }
      }
      handleSetEditorBreakpoints(editorTabIndex, breakpoints);
      dispatch(toggleUpdateEnv(true, workspaceLocation));
    },
    [
      selectedTab,
      dispatch,
      workspaceLocation,
      handleSetEditorBreakpoints,
      handleReplOutputClear,
      handleUsingSubst,
      playgroundSourceChapter
    ]
  );

  const replDisabled = !languageConfig.supports.repl;

  const editorContainerHandlers = useMemo(() => {
    return {
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
      handleSendReplInputToOutput: (code: string) =>
        dispatch(sendReplInputToOutput(code, workspaceLocation)),
      handleSetSharedbConnected: (connected: boolean) =>
        dispatch(setSharedbConnected(workspaceLocation, connected)),
      setActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(removeEditorTab(workspaceLocation, editorTabIndex))
    };
  }, [dispatch]);
  const editorContainerProps: NormalEditorContainerProps = {
    editorSessionId,
    isEditorAutorun,
    editorVariant: 'normal',
    baseFilePath: WORKSPACE_BASE_PATHS[workspaceLocation],
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex: editorContainerHandlers.setActiveEditorTabIndex,
    removeEditorTabByIndex: editorContainerHandlers.removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    handleDeclarationNavigate: editorContainerHandlers.handleDeclarationNavigate,
    handleEditorEval: autorunButtonHandlers.handleEditorEval,
    handlePromptAutocomplete: editorContainerHandlers.handlePromptAutocomplete,
    handleSendReplInputToOutput: editorContainerHandlers.handleSendReplInputToOutput,
    handleSetSharedbConnected: editorContainerHandlers.handleSetSharedbConnected,
    onChange: onChangeMethod,
    onCursorChange: onCursorChangeMethod,
    onSelectionChange: onSelectionChangeMethod,
    onLoad: props.prependLength ? onLoadMethod : undefined,
    sourceChapter: languageConfig.chapter,
    externalLibraryName,
    sourceVariant: languageConfig.variant,
    handleEditorValueChange: onEditorValueChange,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints
  };

  const replHandlers = useMemo(() => {
    return {
      handleBrowseHistoryDown: () => dispatch(browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () => dispatch(browseReplHistoryUp(workspaceLocation)),
      handleReplValueChange: (newValue: string) =>
        dispatch(updateReplValue(newValue, workspaceLocation))
    };
  }, [dispatch]);
  const replProps = {
    output,
    replValue,
    handleReplEval,
    usingSubst,
    handleBrowseHistoryDown: replHandlers.handleBrowseHistoryDown,
    handleBrowseHistoryUp: replHandlers.handleBrowseHistoryUp,
    handleReplValueChange: replHandlers.handleReplValueChange,
    sourceChapter: languageConfig.chapter,
    sourceVariant: languageConfig.variant,
    externalLibrary: ExternalLibraryName.NONE, // temporary placeholder as we phase out libraries
    hidden:
      selectedTab === SideContentType.substVisualizer ||
      selectedTab === SideContentType.envVisualizer,
    inputHidden: replDisabled,
    replButtons: [replDisabled ? null : evalButton, clearButton],
    disableScrolling: true
  };

  const sideBarProps: { tabs: SideBarTab[] } = useMemo(() => {
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
        languageConfig.chapter === Chapter.FULL_JS ? null : shareButton,
        chapterSelectButton,
        languageConfig.supports.multiFile ? toggleFolderModeButton : null,
        persistenceButtons,
        githubButtons,
        !isSourceLanguage(languageConfig.chapter)
          ? null
          : usingSubst
          ? stepperStepLimit
          : executionTime
      ]
    },
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: useCallback(
      change => dispatch(changeSideContentHeight(change, workspaceLocation)),
      [dispatch, workspaceLocation]
    ),
    replProps: replProps,
    sideBarProps: sideBarProps,
    sideContentHeight: sideContentHeight,
    sideContentProps: {
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: 'sicp',
      sideContentHeight: sideContentHeight
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
          chapterSelectButton,
          languageConfig.chapter === Chapter.FULL_JS ? null : shareButton,
          languageConfig.supports.multiFile ? toggleFolderModeButton : null,
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
      workspaceLocation: 'sicp'
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

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = SicpWorkspace;
Component.displayName = 'SicpWorkspace';

export default SicpWorkspace;
