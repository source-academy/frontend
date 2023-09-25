import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { allWorkspaceActions } from 'src/commons/redux/workspace/AllWorkspacesRedux';
import {
  useEditorState,
  useRepl,
  useSideContent,
  useWorkspace
} from 'src/commons/redux/workspace/Hooks';
import { sourcecastActions } from 'src/commons/redux/workspace/sourceRecorder/SourcecastRedux';
import { SideContentLocation } from 'src/commons/redux/workspace/WorkspaceReduxTypes';
import { ReplProps } from 'src/commons/repl/Repl';
import { useResponsive, useTypedSelector } from 'src/commons/utils/Hooks';

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
import SideContentDataVisualizer from '../../commons/sideContent/content/SideContentDataVisualizer';
import SideContentEnvVisualizer from '../../commons/sideContent/content/SideContentEnvVisualizer';
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

const workspaceLocation: SideContentLocation = 'sourcecast';

const Sourcecast: React.FC = () => {
  const { isMobileBreakpoint } = useResponsive();
  const params = useParams<{ sourcecastId: string }>();

  const {
    activeEditorTabIndex,
    editorTabs,
    isEditorAutorun,
    isEditorReadonly,
    isFolderModeEnabled,
    removeEditorTab: handleRemoveEditorTab,
    toggleEditorAutorun: handleToggleEditorAutorun,
    updateActiveEditorTabIndex: handleSetActiveEditorTabIndex,
    updateEditorValue: handleEditorValueChange,
    updateEditorBreakpoints: handleEditorUpdateBreakpoints,
    setIsEditorReadonly: handleSetIsEditorReadonly
  } = useEditorState(workspaceLocation);

  // Handlers migrated over from deprecated withRouter implementation
  const {
    audioUrl,
    currentPlayerTime,
    codeDeltasToApply,
    title,
    description,
    inputToApply,
    isRunning,
    isDebugging,
    output,
    playbackDuration,
    playbackData,
    playbackStatus,
    sourcecastIndex,
    context: { chapter: sourceChapter, variant: sourceVariant },
    uid,
    beginDebugPause: handleDebuggerPause,
    beginInterruptExecution: handleInterruptEval,
    debugReset: handleDebuggerReset,
    debugResume: handleDebuggerResume,
    evalEditor: handleEditorEval,
    evalRepl: handleReplEval,
    navDeclaration: handleDeclarationNavigate,
    promptAutocomplete: handlePromptAutocomplete
  } = useWorkspace(workspaceLocation);

  const { clearReplOutput: handleReplOutputClear } = useRepl(workspaceLocation);

  const courseId = useTypedSelector(store => store.session.courseId);

  const dispatch = useDispatch();
  const {
    handleFetchSourcecastIndex,
    handleChapterSelect,
    handleSetSourcecastData,
    handleSetSourcecastStatus
  } = useMemo(() => {
    return {
      handleFetchSourcecastIndex: () => dispatch(sourcecastActions.fetchSourcecastIndex()),
      handleChapterSelect: (chapter: Chapter) =>
        dispatch(allWorkspaceActions.chapterSelect(workspaceLocation, chapter, Variant.DEFAULT)),
      //   dispatch(externalLibrarySelect(externalLibraryName, workspaceLocation)),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) =>
        dispatch(
          sourcecastActions.setSourcecastData(title, description, uid, audioUrl, playbackData)
        ),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        dispatch(sourcecastActions.setSourcecastPlaybackStatus(playbackStatus))
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
      // case 'externalLibrarySelect':
      //   handleExternalSelect(inputToApply.data);
      //   break;
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

  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={handleDebuggerPause}
      handleDebuggerReset={handleDebuggerReset}
      handleDebuggerResume={handleDebuggerResume}
      handleEditorEval={handleEditorEval}
      handleInterruptEval={handleInterruptEval}
      handleToggleEditorAutorun={handleToggleEditorAutorun}
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

  const dataVisualizerTab: SideContentTab = {
    label: 'Data Visualizer',
    iconName: IconNames.EYE_OPEN,
    body: <SideContentDataVisualizer workspaceLocation={workspaceLocation} />,
    id: SideContentType.dataVisualizer
  };

  const envVisualizerTab: SideContentTab = {
    label: 'Env Visualizer',
    iconName: IconNames.GLOBE,
    body: <SideContentEnvVisualizer workspaceLocation={workspaceLocation} />,
    id: SideContentType.envVisualizer
  };

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
    envVisualizerTab
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

  const editorContainerProps: SourcecastEditorContainerProps = {
    editorVariant: 'sourcecast',
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    codeDeltasToApply: codeDeltasToApply,
    isEditorReadonly: isEditorReadonly,
    isFolderModeEnabled,
    editorSessionId: '',
    handleDeclarationNavigate,
    handleEditorEval: handleEditorEval,
    handleEditorValueChange: (value: string) => handleEditorValueChange(0, value),
    isEditorAutorun: isEditorAutorun,
    inputToApply: inputToApply,
    isPlaying: playbackStatus === PlaybackStatus.playing,
    // TODO check editor tab hardcoding
    handleEditorUpdateBreakpoints: breakpoints => handleEditorUpdateBreakpoints(0, breakpoints),
    setActiveEditorTabIndex: handleSetActiveEditorTabIndex,
    removeEditorTabByIndex: handleRemoveEditorTab,
    activeEditorTabIndex
  };

  const replProps: ReplProps = {
    output: output,
    handleReplEval: handleReplEval,
    location: workspaceLocation,
    sourceChapter: sourceChapter,
    sourceVariant: sourceVariant,
    // externalLibrary: externalLibraryName,
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
    replProps,
    sideBarProps,
    sideContentProps: {
      selectedTabId: selectedTab,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      location: workspaceLocation
    },
    workspaceLocation
  };
  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorContainerProps,
    replProps,
    sideBarProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [autorunButtons, chapterSelectButton]
      },
      selectedTabId: selectedTab!,
      onChange: onChangeTabs,
      tabs: {
        beforeDynamicTabs: tabs,
        afterDynamicTabs: []
      },
      location: workspaceLocation
    }
  };

  const sourcecastControlbarHandlers = useMemo(() => {
    return {
      handleSetCurrentPlayerTime: (playerTime: number) =>
        dispatch(sourcecastActions.setCurrentPlayerTime(playerTime)),
      handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
        dispatch(sourcecastActions.setCodeDeltasToApply(deltas)),
      handleSetInputToApply: (inputToApply: Input) =>
        dispatch(sourcecastActions.setInputToApply(inputToApply)),
      handleSetSourcecastDuration: (duration: number) =>
        dispatch(sourcecastActions.setSourcecastPlaybackDuration(duration))
    };
  }, [dispatch]);
  const sourcecastControlbarProps: SourceRecorderControlBarProps = {
    handleEditorValueChange: (value: string) => handleEditorValueChange(0, value),
    handlePromptAutocomplete,
    handleSetCurrentPlayerTime: sourcecastControlbarHandlers.handleSetCurrentPlayerTime,
    handleSetCodeDeltasToApply: sourcecastControlbarHandlers.handleSetCodeDeltasToApply,
    handleSetIsEditorReadonly,
    handleSetInputToApply: sourcecastControlbarHandlers.handleSetInputToApply,
    handleSetSourcecastDuration: sourcecastControlbarHandlers.handleSetSourcecastDuration,
    handleSetSourcecastStatus: handleSetSourcecastStatus,
    audioUrl: audioUrl,
    currentPlayerTime: currentPlayerTime,
    duration: playbackDuration,
    playbackData: playbackData,
    playbackStatus: playbackStatus,
    handleChapterSelect: handleChapterSelect,
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
