import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from 'src/commons/application/actions/InterpreterActions';
import { Position } from 'src/commons/editor/EditorTypes';
import { changeSideContentHeight } from 'src/commons/sideContent/SideContentActions';
import { useSideContent } from 'src/commons/sideContent/SideContentHelper';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  setEditorBreakpoint,
  setIsEditorReadonly,
  toggleEditorAutorun,
  updateActiveEditorTabIndex,
  updateEditorValue,
  updateReplValue
} from 'src/commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { fetchSourcecastIndex } from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import {
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from 'src/features/sourceRecorder/SourceRecorderActions';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../commons/controlBar/ControlBarEvalButton';
import {
  convertEditorTabStateToProps,
  SourcecastEditorContainerProps
} from '../../commons/editor/EditorContainer';
import MobileWorkspace, {
  MobileWorkspaceProps
} from '../../commons/mobileWorkspace/MobileWorkspace';
import makeCseMachineTabFrom from '../../commons/sideContent/content/SideContentCseMachine';
import makeDataVisualizerTabFrom from '../../commons/sideContent/content/SideContentDataVisualizer';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../commons/sourceRecorder/SourceRecorderControlBar';
import SourceRecorderTable from '../../commons/sourceRecorder/SourceRecorderTable';
import Workspace, { WorkspaceProps } from '../../commons/workspace/Workspace';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus
} from '../../features/sourceRecorder/SourceRecorderTypes';

const workspaceLocation: WorkspaceLocation = 'sourcecast';

const Sourcecast: React.FC = () => {
  const { isMobileBreakpoint } = useResponsive();
  const params = useParams<{ sourcecastId: string }>();

  // Handlers migrated over from deprecated withRouter implementation
  const {
    audioUrl,
    currentPlayerTime,
    codeDeltasToApply,
    title,
    description,
    externalLibrary: externalLibraryName,
    isEditorAutorun,
    isEditorReadonly,
    inputToApply,
    isRunning,
    isDebugging,
    output,
    playbackDuration,
    playbackData,
    playbackStatus,
    replValue,
    sourcecastIndex,
    context: { chapter: sourceChapter, variant: sourceVariant },
    uid,
    isFolderModeEnabled,
    activeEditorTabIndex,
    editorTabs
  } = useTypedSelector(store => store.workspaces[workspaceLocation]);
  const courseId = useTypedSelector(store => store.session.courseId);

  const dispatch = useDispatch();
  const {
    handleFetchSourcecastIndex,
    handleChapterSelect,
    handleEditorEval,
    handleEditorValueChange,
    handleExternalSelect,
    handleReplEval,
    handleSetSourcecastData,
    handleSetSourcecastStatus,
    handleReplOutputClear,
    handleSideContentHeightChange
  } = useMemo(() => {
    return {
      handleFetchSourcecastIndex: () => dispatch(fetchSourcecastIndex(workspaceLocation)),
      handleChapterSelect: (chapter: Chapter) =>
        dispatch(chapterSelect(chapter, Variant.DEFAULT, workspaceLocation)),
      handleEditorEval: () => dispatch(evalEditor(workspaceLocation)),
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange: (newEditorValue: string) =>
        dispatch(updateEditorValue(workspaceLocation, 0, newEditorValue)),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        dispatch(externalLibrarySelect(externalLibraryName, workspaceLocation)),
      handleReplEval: () => dispatch(evalRepl(workspaceLocation)),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) =>
        dispatch(
          setSourcecastData(title, description, uid, audioUrl, playbackData, workspaceLocation)
        ),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        dispatch(setSourcecastStatus(playbackStatus, workspaceLocation)),
      handleReplOutputClear: () => dispatch(clearReplOutput(workspaceLocation)),
      handleSideContentHeightChange: (change: number) =>
        dispatch(changeSideContentHeight(change, workspaceLocation))
    };
  }, [dispatch]);

  /**
   * The default selected tab for the Sourcecast workspace is the introduction tab,
   * which contains the ag-grid table of available Sourcecasts. This is intentional
   * to avoid an ag-grid console warning. For more info, see issue #1152 in frontend.
   */
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
    SideContentType.introduction
  );

  const handleQueryParam = () => {
    const newUid = params.sourcecastId;
    if (newUid && newUid !== uid && sourcecastIndex) {
      const cast = sourcecastIndex.find(data => data.uid === newUid);
      if (cast) {
        handleSetSourcecastData(
          cast.title,
          cast.description,
          cast.uid,
          cast.url,
          JSON.parse(cast.playbackData)
        );
      }
    }
  };

  useEffect(() => {
    handleFetchSourcecastIndex();
    // This effect should only fire once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleQueryParam();

    if (!inputToApply) {
      return;
    }

    switch (inputToApply.type) {
      case 'activeTabChange':
        setSelectedTab(inputToApply.data);
        break;
      case 'chapterSelect':
        handleChapterSelect(inputToApply.data);
        break;
      case 'externalLibrarySelect':
        handleExternalSelect(inputToApply.data);
        break;
      case 'forcePause':
        handleSetSourcecastStatus(PlaybackStatus.forcedPaused);
        break;
    }
    // This effect should only fire when props.inputToApply changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleQueryParam, inputToApply]);

  /**
   * Handles toggling of relevant SideContentTabs when exiting the mobile breakpoint
   */
  useEffect(() => {
    if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, selectedTab, setSelectedTab]);

  const autorunButtonHandlers = useMemo(() => {
    return {
      handleDebuggerPause: () => dispatch(beginDebuggerPause(workspaceLocation)),
      handleDebuggerReset: () => dispatch(debuggerReset(workspaceLocation)),
      handleDebuggerResume: () => dispatch(debuggerResume(workspaceLocation)),
      handleInterruptEval: () => dispatch(beginInterruptExecution(workspaceLocation)),
      handleToggleEditorAutorun: () => dispatch(toggleEditorAutorun(workspaceLocation))
    };
  }, [dispatch]);
  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={autorunButtonHandlers.handleDebuggerPause}
      handleDebuggerReset={autorunButtonHandlers.handleDebuggerReset}
      handleDebuggerResume={autorunButtonHandlers.handleDebuggerResume}
      handleEditorEval={handleEditorEval}
      handleInterruptEval={autorunButtonHandlers.handleInterruptEval}
      handleToggleEditorAutorun={autorunButtonHandlers.handleToggleEditorAutorun}
      isEntrypointFileDefined={activeEditorTabIndex !== null}
      isDebugging={isDebugging}
      isEditorAutorun={isEditorAutorun}
      isRunning={isRunning}
      key="autorun"
    />
  );

  const chapterSelectHandler = ({ chapter }: { chapter: Chapter }, e: any) =>
    handleChapterSelect(chapter);

  const chapterSelectButton = (
    <ControlBarChapterSelect
      handleChapterSelect={chapterSelectHandler}
      isFolderModeEnabled={isFolderModeEnabled}
      sourceChapter={sourceChapter}
      sourceVariant={sourceVariant}
      key="chapter"
    />
  );

  const clearButton = (
    <ControlBarClearButton handleReplOutputClear={handleReplOutputClear} key="clear_repl" />
  );

  const evalButton = (
    <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
  );

  const dataVisualizerTab = makeDataVisualizerTabFrom(workspaceLocation);

  const cseMachineTab = makeCseMachineTabFrom(workspaceLocation);

  const tabs: SideContentTab[] = [
    {
      label: 'Sourcecast Table',
      iconName: IconNames.HOME,
      body: (
        <div>
          <span className="Multi-line">
            <Pre>{title ? 'Title: ' + title + '\nDescription: ' + description : INTRODUCTION}</Pre>
          </span>
          <SourceRecorderTable
            handleSetSourcecastData={handleSetSourcecastData}
            sourcecastIndex={sourcecastIndex}
            courseId={courseId}
          />
        </div>
      ),
      id: SideContentType.introduction
    },
    dataVisualizerTab,
    cseMachineTab
  ];

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

  const editorContainerHandlers = useMemo(() => {
    return {
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(navigateToDeclaration(workspaceLocation, cursorPosition)),
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorUpdateBreakpoints: (newBreakpoints: string[]) =>
        dispatch(setEditorBreakpoint(workspaceLocation, 0, newBreakpoints)),
      setActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(removeEditorTab(workspaceLocation, editorTabIndex))
    };
  }, [dispatch]);
  const editorContainerProps: SourcecastEditorContainerProps = {
    editorVariant: 'sourcecast',
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex: editorContainerHandlers.setActiveEditorTabIndex,
    removeEditorTabByIndex: editorContainerHandlers.removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    codeDeltasToApply: codeDeltasToApply,
    isEditorReadonly: isEditorReadonly,
    editorSessionId: '',
    handleDeclarationNavigate: editorContainerHandlers.handleDeclarationNavigate,
    handleEditorEval: handleEditorEval,
    handleEditorValueChange: handleEditorValueChange,
    isEditorAutorun: isEditorAutorun,
    inputToApply: inputToApply,
    isPlaying: playbackStatus === PlaybackStatus.playing,
    handleEditorUpdateBreakpoints: editorContainerHandlers.handleEditorUpdateBreakpoints
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
    output: output,
    replValue: replValue,
    handleBrowseHistoryDown: replHandlers.handleBrowseHistoryDown,
    handleBrowseHistoryUp: replHandlers.handleBrowseHistoryUp,
    handleReplEval: handleReplEval,
    handleReplValueChange: replHandlers.handleReplValueChange,
    sourceChapter: sourceChapter,
    sourceVariant: sourceVariant,
    externalLibrary: externalLibraryName,
    replButtons: [evalButton, clearButton]
  };

  const sideBarProps = {
    tabs: []
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelectButton]
    },
    editorContainerProps,
    handleSideContentHeightChange: handleSideContentHeightChange,
    replProps,
    sideBarProps,
    sideContentProps: {
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation
    }
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps,
    replProps,
    sideBarProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelectButton]
      },
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      workspaceLocation
    }
  };

  const sourcecastControlbarHandlers = useMemo(() => {
    return {
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(promptAutocomplete(workspaceLocation, row, col, callback)),
      handleSetCurrentPlayerTime: (playerTime: number) =>
        dispatch(setCurrentPlayerTime(playerTime, workspaceLocation)),
      handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
        dispatch(setCodeDeltasToApply(deltas, workspaceLocation)),
      handleSetIsEditorReadonly: (editorReadonly: boolean) =>
        dispatch(setIsEditorReadonly(workspaceLocation, editorReadonly)),
      handleSetInputToApply: (inputToApply: Input) =>
        dispatch(setInputToApply(inputToApply, workspaceLocation)),
      handleSetSourcecastDuration: (duration: number) =>
        dispatch(setSourcecastDuration(duration, workspaceLocation))
    };
  }, [dispatch]);
  const sourcecastControlbarProps: SourceRecorderControlBarProps = {
    handleEditorValueChange: handleEditorValueChange,
    handlePromptAutocomplete: sourcecastControlbarHandlers.handlePromptAutocomplete,
    handleSetCurrentPlayerTime: sourcecastControlbarHandlers.handleSetCurrentPlayerTime,
    handleSetCodeDeltasToApply: sourcecastControlbarHandlers.handleSetCodeDeltasToApply,
    handleSetIsEditorReadonly: sourcecastControlbarHandlers.handleSetIsEditorReadonly,
    handleSetInputToApply: sourcecastControlbarHandlers.handleSetInputToApply,
    handleSetSourcecastDuration: sourcecastControlbarHandlers.handleSetSourcecastDuration,
    handleSetSourcecastStatus: handleSetSourcecastStatus,
    audioUrl: audioUrl,
    currentPlayerTime: currentPlayerTime,
    duration: playbackDuration,
    playbackData: playbackData,
    playbackStatus: playbackStatus,
    handleChapterSelect: handleChapterSelect,
    handleExternalSelect: handleExternalSelect,
    setSelectedTab: setSelectedTab
  };

  return (
    <div className={classNames('Sourcecast', Classes.DARK)}>
      <SourceRecorderControlBar {...sourcecastControlbarProps} />
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
};

const INTRODUCTION = 'Welcome to Sourcecast!';

export default Sourcecast;
