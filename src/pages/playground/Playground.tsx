import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import { Ace, Range } from 'ace-builds';
import classNames from 'classnames';
import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import { Chapter, Variant } from 'js-slang/dist/types';
import { isEqual } from 'lodash';
import { decompressFromEncodedURIComponent } from 'lz-string';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { RouteComponentProps } from 'react-router';
import { showFullJSWarningOnUrlLoad } from 'src/commons/fullJS/FullJSUtils';

import {
  InterpreterOutput,
  OverallState,
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
import { ControlBarGitHubButtons } from '../../commons/controlBar/github/ControlBarGitHubButtons';
import { HighlightedLines, Position } from '../../commons/editor/EditorTypes';
import Markdown from '../../commons/Markdown';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import SideContentDataVisualizer from '../../commons/sideContent/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../commons/sideContent/SideContentEnvVisualizer';
import SideContentRemoteExecution from '../../commons/sideContent/SideContentRemoteExecution';
import SideContentSubstVisualizer from '../../commons/sideContent/SideContentSubstVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import Constants, { Links } from '../../commons/utils/Constants';
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

export type PlaygroundProps = OwnProps & DispatchProps & StateProps & RouteComponentProps<{}>;

export type OwnProps = {
  isSicpEditor?: boolean;
  initialEditorValueHash?: string;
  prependLength?: number;
  handleCloseEditor?: () => void;
};

export type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeExecTime: (execTime: number) => void;
  handleChangeStepLimit: (stepLimit: number) => void;
  handleChapterSelect: (chapter: Chapter, variant: Variant) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleGenerateLz: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  handleInterruptEval: () => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetSharedbConnected: (connected: boolean) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleToggleEditorAutorun: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handlePersistenceOpenPicker: () => void;
  handlePersistenceSaveFile: () => void;
  handlePersistenceUpdateFile: (file: PersistenceFile) => void;
  handlePersistenceInitialise: () => void;
  handlePersistenceLogOut: () => void;
  handleGitHubOpenFile: () => void;
  handleGitHubSaveFileAs: () => void;
  handleGitHubSaveFile: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  handleUpdatePrepend?: (s: string) => void;
};

export type StateProps = {
  editorSessionId: string;
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

export function handleHash(hash: string, props: PlaygroundProps) {
  const qs = parseQuery(hash);

  const chapter = stringParamToInt(qs.chap) || undefined;
  if (chapter === Chapter.FULL_JS) {
    showFullJSWarningOnUrlLoad();
  } else {
    const programLz = qs.lz ?? qs.prgrm;
    const program = programLz && decompressFromEncodedURIComponent(programLz);
    if (program) {
      props.handleEditorValueChange(program);
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

const Playground: React.FC<PlaygroundProps> = props => {
  const { isSicpEditor } = props;
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const [lastEdit, setLastEdit] = React.useState(new Date());
  const [isGreen, setIsGreen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.introduction);
  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(() =>
    initSession('playground', {
      editorValue: propsRef.current.editorValue,
      chapter: propsRef.current.playgroundSourceChapter
    })
  );

  const usingRemoteExecution =
    useSelector((state: OverallState) => !!state.session.remoteExecutionSession) && !isSicpEditor;
  // this is still used by remote execution (EV3)
  // specifically, for the editor Ctrl+B to work
  const externalLibraryName = useSelector(
    (state: OverallState) => state.workspaces.playground.externalLibrary
  );

  React.useEffect(() => {
    // When the editor session Id changes, then treat it as a new session.
    setSessionId(
      initSession('playground', {
        editorValue: propsRef.current.editorValue,
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
      }
      return;
    }
    handleHash(hash, propsRef.current);
  }, [hash, props.courseSourceChapter, props.courseSourceVariant]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      isMobileBreakpoint &&
      (selectedTab === SideContentType.introduction ||
        selectedTab === SideContentType.remoteExecution)
    ) {
      setSelectedTab(SideContentType.mobileEditor);
    } else if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, selectedTab]);

  const handlers = React.useMemo(
    () => ({
      goGreen: () => setIsGreen(!isGreen)
    }),
    [isGreen]
  );

  const onEditorValueChange = React.useCallback(val => {
    setLastEdit(new Date());
    propsRef.current.handleEditorValueChange(val);
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
        sourceChapter={props.playgroundSourceChapter}
        key="autorun"
        autorunDisabled={usingRemoteExecution}
        // Disable pause for FullJS, because: one cannot stop `eval()`
        pauseDisabled={usingRemoteExecution || props.playgroundSourceChapter === Chapter.FULL_JS}
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
      props.isRunning,
      props.playgroundSourceChapter,
      usingRemoteExecution
    ]
  );

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

  const { persistenceUser, persistenceFile, handlePersistenceUpdateFile } = props;
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
        onClickSaveAs={props.handlePersistenceSaveFile}
        onClickOpen={props.handlePersistenceOpenPicker}
        onClickSave={
          persistenceFile ? () => handlePersistenceUpdateFile(persistenceFile) : undefined
        }
        onClickLogOut={props.handlePersistenceLogOut}
        onPopoverOpening={props.handlePersistenceInitialise}
      />
    );
  }, [
    persistenceUser,
    persistenceFile,
    persistenceIsDirty,
    props.handlePersistenceSaveFile,
    props.handlePersistenceOpenPicker,
    props.handlePersistenceLogOut,
    props.handlePersistenceInitialise,
    handlePersistenceUpdateFile
  ]);

  const githubOctokitObject = useSelector((store: any) => store.session.githubOctokitObject);
  const githubSaveInfo = props.githubSaveInfo;
  const githubPersistenceIsDirty =
    githubSaveInfo && (!githubSaveInfo.lastSaved || githubSaveInfo.lastSaved < lastEdit);
  const githubButtons = React.useMemo(() => {
    const octokit = githubOctokitObject === undefined ? undefined : githubOctokitObject.octokit;
    return (
      <ControlBarGitHubButtons
        key="github"
        loggedInAs={octokit}
        githubSaveInfo={githubSaveInfo}
        isDirty={githubPersistenceIsDirty}
        onClickOpen={props.handleGitHubOpenFile}
        onClickSave={props.handleGitHubSaveFile}
        onClickSaveAs={props.handleGitHubSaveFileAs}
        onClickLogIn={props.handleGitHubLogIn}
        onClickLogOut={props.handleGitHubLogOut}
      />
    );
  }, [
    githubOctokitObject,
    githubPersistenceIsDirty,
    githubSaveInfo,
    props.handleGitHubOpenFile,
    props.handleGitHubSaveFileAs,
    props.handleGitHubSaveFile,
    props.handleGitHubLogIn,
    props.handleGitHubLogOut
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
        handleChangeStepLimit={props.handleChangeStepLimit}
        key="step_limit"
      />
    ),
    [props.handleChangeStepLimit, props.stepLimit]
  );

  const { handleEditorValueChange } = props;

  // No point memoing this, it uses props.editorValue
  const sessionButtons = (
    <ControlBarSessionButtons
      editorSessionId={props.editorSessionId}
      editorValue={props.editorValue}
      handleSetEditorSessionId={props.handleSetEditorSessionId}
      sharedbConnected={props.sharedbConnected}
      key="session"
    />
  );

  const shareButton = React.useMemo(() => {
    const queryString = isSicpEditor
      ? Links.playground + '#' + props.initialEditorValueHash
      : props.queryString;
    return (
      <ControlBarShareButton
        handleGenerateLz={props.handleGenerateLz}
        handleShortenURL={props.handleShortenURL}
        handleUpdateShortURL={props.handleUpdateShortURL}
        queryString={queryString}
        shortURL={props.shortURL}
        isSicp={isSicpEditor}
        key="share"
      />
    );
  }, [
    isSicpEditor,
    props.handleGenerateLz,
    props.handleShortenURL,
    props.handleUpdateShortURL,
    props.initialEditorValueHash,
    props.queryString,
    props.shortURL
  ]);

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

    // (TEMP) Remove tabs for fullJS until support is integrated
    if (props.playgroundSourceChapter === Chapter.FULL_JS) {
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
    isSicpEditor,
    playgroundIntroductionTab,
    props.output,
    props.playgroundSourceChapter,
    props.playgroundSourceVariant,
    usingRemoteExecution
  ]);

  // Remove Intro and Remote Execution tabs for mobile
  const mobileTabs = [...tabs].filter(
    x => x !== playgroundIntroductionTab && x !== remoteExecutionTab
  );

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
      handleEditorValueChange(newCode);

      const input: Input = {
        time: Date.now(),
        type: 'codeDelta',
        data: delta
      };

      pushLog(input);
    },
    [handleEditorValueChange, pushLog]
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
    (breakpoints: string[]) => {
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
      propsRef.current.handleEditorUpdateBreakpoints(breakpoints);
    },
    [selectedTab]
  );

  const replDisabled = props.playgroundSourceVariant === Variant.CONCURRENT || usingRemoteExecution;

  const editorProps = {
    onChange: onChangeMethod,
    onCursorChange: onCursorChangeMethod,
    onSelectionChange: onSelectionChangeMethod,
    onLoad: isSicpEditor && props.prependLength ? onLoadMethod : undefined,
    sourceChapter: props.playgroundSourceChapter,
    externalLibraryName,
    sourceVariant: props.playgroundSourceVariant,
    editorValue: props.editorValue,
    editorSessionId: props.editorSessionId,
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: onEditorValueChange,
    handleSendReplInputToOutput: props.handleSendReplInputToOutput,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: props.isEditorAutorun,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints,
    handleSetSharedbConnected: props.handleSetSharedbConnected
  };

  const replProps = {
    sourceChapter: props.playgroundSourceChapter,
    sourceVariant: props.playgroundSourceVariant,
    externalLibrary: ExternalLibraryName.NONE, // temporary placeholder as we phase out libraries
    output: props.output,
    replValue: props.replValue,
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    hidden: selectedTab === SideContentType.substVisualizer,
    inputHidden: replDisabled,
    usingSubst: props.usingSubst,
    replButtons: [replDisabled ? null : evalButton, clearButton],
    disableScrolling: isSicpEditor
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [
        autorunButtons,
        props.playgroundSourceChapter === Chapter.FULL_JS ? null : shareButton,
        chapterSelect,
        isSicpEditor ? null : sessionButtons,
        persistenceButtons,
        githubButtons,
        usingRemoteExecution || props.playgroundSourceChapter === Chapter.FULL_JS
          ? null
          : props.usingSubst
          ? stepperStepLimit
          : executionTime
      ]
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
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation: isSicpEditor ? 'sicp' : 'playground',
      sideContentHeight: props.sideContentHeight,
      editorWidth: props.editorWidth
    },
    sideContentIsResizeable: selectedTab !== SideContentType.substVisualizer
  };

  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [
          autorunButtons,
          chapterSelect,
          props.playgroundSourceChapter === Chapter.FULL_JS ? null : shareButton,
          isSicpEditor ? null : sessionButtons,
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
    <MobileWorkspace {...mobileWorkspaceProps} />
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

const remoteExecutionTab: SideContentTab = {
  label: 'Remote Execution',
  iconName: IconNames.SATELLITE,
  body: <SideContentRemoteExecution workspace="playground" />,
  id: SideContentType.remoteExecution
};

export default Playground;
