import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { ControlBarAutorunButtons } from 'src/commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from 'src/commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from 'src/commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from 'src/commons/controlBar/ControlBarEvalButton';
import {
  convertEditorTabStateToProps,
  SourcecastEditorContainerProps
} from 'src/commons/editor/EditorContainer';
import { allWorkspaceActions } from 'src/commons/redux/workspace/AllWorkspacesRedux';
import {
  useEditorState,
  useRepl,
  useSideContent,
  useWorkspace
} from 'src/commons/redux/workspace/Hooks';
import { sourcecastActions } from 'src/commons/redux/workspace/sourceRecorder/SourcecastRedux';
import { sourcereelActions } from 'src/commons/redux/workspace/sourceRecorder/SourcereelRedux';
import { SideContentLocation } from 'src/commons/redux/workspace/WorkspaceReduxTypes';
import SideContentDataVisualizer from 'src/commons/sideContent/content/SideContentDataVisualizer';
import SideContentEnvVisualizer from 'src/commons/sideContent/content/SideContentEnvVisualizer';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from 'src/commons/sourceRecorder/SourceRecorderControlBar';
import SourcecastTable from 'src/commons/sourceRecorder/SourceRecorderTable';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import Workspace, { WorkspaceProps } from 'src/commons/workspace/Workspace';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  PlaybackData,
  PlaybackStatus,
  RecordingStatus
} from 'src/features/sourceRecorder/SourceRecorderTypes';

import SourcereelControlbar from './subcomponents/SourcereelControlbar';

const workspaceLocation: SideContentLocation = 'sourcereel';
const sourcecastLocation: SideContentLocation = 'sourcecast';

const Sourcereel: React.FC = () => {
  const courseId = useTypedSelector(state => state.session.courseId);

  const {
    audioUrl,
    currentPlayerTime,
    codeDeltasToApply,
    inputToApply,
    playbackDuration,
    playbackStatus,
    sourcecastIndex
  } = useTypedSelector(state => state.workspaces.sourcecast);

  const {
    activeEditorTabIndex,
    editorTabs,
    isEditorAutorun,
    isEditorReadonly,
    isFolderModeEnabled,
    setIsEditorReadonly: handleSetIsEditorReadonly,
    toggleEditorAutorun: handleToggleEditorAutorun,
    updateEditorValue: handleEditorValueChange,
    updateActiveEditorTabIndex: handleUpdateActiveEditorTabIndex,
    updateEditorBreakpoints: handleUpdateEditorBreakpoints,
    removeEditorTab: handleRemoveEditorTabByIndex
  } = useEditorState(workspaceLocation);
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
    SideContentType.sourcereel
  );

  const dispatch = useDispatch();

  const {
    isDebugging,
    isRunning,
    output,
    playbackData,
    recordingStatus,
    timeElapsedBeforePause,
    timeResumed,
    context: { chapter: sourceChapter, variant: sourceVariant },
    evalEditor: handleEditorEval,
    beginDebugPause: handleDebuggerPause,
    beginInterruptExecution: handleInterruptEval,
    debugReset: handleDebuggerReset,
    debugResume: handleDebuggerResume,
    evalRepl: handleReplEval,
    navDeclaration: handleDeclarationNavigate,
    promptAutocomplete: handlePromptAutocomplete
  } = useWorkspace(workspaceLocation);

  const { clearReplOutput } = useRepl(workspaceLocation);

  const { handleChapterSelect, handleRecordInput, handleSetSourcecastStatus } = useMemo(() => {
    return {
      handleChapterSelect: (chapter: Chapter) =>
        dispatch(allWorkspaceActions.chapterSelect(workspaceLocation, chapter, Variant.DEFAULT)),
      handleRecordInput: (input: Input) => dispatch(sourcereelActions.recordInput(input)),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        dispatch(sourcecastActions.setSourcecastPlaybackStatus(playbackStatus))
    };
  }, [dispatch]);

  useEffect(() => {
    sourcecastActions.fetchSourcecastIndex();
  }, []);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputToApply]);

  const getTimerDuration = () => timeElapsedBeforePause + Date.now() - timeResumed;

  const handleRecordInit = () => {
    const initData: PlaybackData['init'] = {
      chapter: sourceChapter,
      // TODO investigate
      // externalLibrary: externalLibraryName,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: editorTabs[0].value
    };
    dispatch(sourcereelActions.recordInit(initData));
  };

  const handleRecordPause = () =>
    handleRecordInput({
      time: getTimerDuration(),
      type: 'forcePause',
      data: null
    });

  const editorEvalHandler = () => {
    handleEditorEval();
    if (recordingStatus !== RecordingStatus.recording) {
      return;
    }
    handleRecordInput({
      time: getTimerDuration(),
      type: 'keyboardCommand',
      data: KeyboardCommand.run
    });
  };

  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={handleDebuggerPause}
      handleDebuggerResume={handleDebuggerResume}
      handleDebuggerReset={handleDebuggerReset}
      handleEditorEval={editorEvalHandler}
      handleInterruptEval={handleInterruptEval}
      handleToggleEditorAutorun={handleToggleEditorAutorun}
      isEntrypointFileDefined={activeEditorTabIndex !== null}
      isDebugging={isDebugging}
      isEditorAutorun={isEditorAutorun}
      isRunning={isRunning}
      key="autorun"
    />
  );

  const chapterSelectHandler = ({ chapter }: { chapter: Chapter }, e: any) => {
    handleChapterSelect(chapter);
    if (recordingStatus !== RecordingStatus.recording) {
      return;
    }
    handleRecordInput({
      time: getTimerDuration(),
      type: 'chapterSelect',
      data: chapter
    });
  };

  const chapterSelectButton = (
    <ControlBarChapterSelect
      handleChapterSelect={chapterSelectHandler}
      isFolderModeEnabled={isFolderModeEnabled}
      sourceChapter={sourceChapter}
      sourceVariant={sourceVariant}
      key="chapter"
    />
  );

  const clearButton = useMemo(
    () => <ControlBarClearButton handleReplOutputClear={clearReplOutput} key="clear_repl" />,
    [clearReplOutput]
  );

  const evalButton = (
    <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
  );

  const editorContainerProps: SourcecastEditorContainerProps = {
    activeEditorTabIndex,
    handleEditorEval,
    handleRecordInput: handleRecordInput,
    codeDeltasToApply: codeDeltasToApply,
    inputToApply: inputToApply,
    isEditorAutorun,
    isEditorReadonly,
    isFolderModeEnabled,
    setActiveEditorTabIndex: handleUpdateActiveEditorTabIndex,
    removeEditorTabByIndex: handleRemoveEditorTabByIndex,
    // TODO check for hardcoding
    handleEditorUpdateBreakpoints: value => handleUpdateEditorBreakpoints(0, value),
    handleEditorValueChange: value => handleEditorValueChange(0, value),
    editorVariant: sourcecastLocation,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    handleDeclarationNavigate,
    editorSessionId: '',
    getTimerDuration: getTimerDuration,
    isPlaying: playbackStatus === PlaybackStatus.playing,
    isRecording: recordingStatus === RecordingStatus.recording
  };

  const activeTabChangeHandler = (activeTab: SideContentType) => {
    setSelectedTab(activeTab);
    if (recordingStatus !== RecordingStatus.recording) {
      return;
    }
    handleRecordInput({
      time: getTimerDuration(),
      type: 'activeTabChange',
      data: activeTab
    });
  };

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

  const workspaceHandlers = useMemo(() => {
    return {
      handleDeleteSourcecastEntry: (id: number) =>
        dispatch(sourcereelActions.deleteSourcecastEntry(id)),
      // SourcereelControlbar handlers
      handleResetInputs: (inputs: Input[]) => dispatch(sourcereelActions.resetInputs(inputs)),
      handleSaveSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audio: Blob,
        playbackData: PlaybackData
      ) =>
        dispatch(
          sourcecastActions.saveSourcecastData(title, description, uid, audio, playbackData)
        ),
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
      handleTimerPause: () => dispatch(sourcereelActions.timerPause()),
      handleTimerReset: () => dispatch(sourcereelActions.timerReset()),
      handleTimerResume: (timeBefore: number) =>
        dispatch(sourcereelActions.timerResume(timeBefore)),
      handleTimerStart: () => dispatch(sourcereelActions.timerStart()),
      handleTimerStop: () => dispatch(sourcereelActions.timerStop())
    };
  }, [dispatch]);
  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelectButton]
    },
    editorContainerProps: editorContainerProps,
    replProps: {
      output: output,
      handleReplEval: handleReplEval,
      sourceChapter: sourceChapter,
      sourceVariant: sourceVariant,
      // externalLibrary: externalLibraryName,
      replButtons: [evalButton, clearButton],
      location: workspaceLocation
    },
    sideBarProps: {
      tabs: []
    },
    sideContentProps: {
      onChange: activeTabChangeHandler,
      selectedTabId: selectedTab,
      /**
       * NOTE: An ag-grid console warning is shown here on load as the 'Sourcecast Table' tab
       * is not the default tab, and the ag-grid table inside it has not been rendered.
       * This is a known issue with ag-grid, and is okay since only staff and admins have
       * access to Sourcereel. For more info, see issue #1152 in frontend.
       */
      tabs: {
        beforeDynamicTabs: [
          {
            label: 'Recording Panel',
            iconName: IconNames.COMPASS,
            body: (
              <div>
                <span className="Multi-line">
                  <Pre> {INTRODUCTION} </Pre>
                </span>
                <SourcereelControlbar
                  currentPlayerTime={currentPlayerTime}
                  // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
                  editorValue={editorTabs[0].value}
                  getTimerDuration={getTimerDuration}
                  playbackData={playbackData}
                  handleRecordInit={handleRecordInit}
                  handleRecordPause={handleRecordPause}
                  handleResetInputs={workspaceHandlers.handleResetInputs}
                  handleSaveSourcecastData={workspaceHandlers.handleSaveSourcecastData}
                  handleSetSourcecastData={workspaceHandlers.handleSetSourcecastData}
                  handleSetIsEditorReadonly={handleSetIsEditorReadonly}
                  handleTimerPause={workspaceHandlers.handleTimerPause}
                  handleTimerReset={workspaceHandlers.handleTimerReset}
                  handleTimerResume={workspaceHandlers.handleTimerResume}
                  handleTimerStart={workspaceHandlers.handleTimerStart}
                  handleTimerStop={workspaceHandlers.handleTimerStop}
                  recordingStatus={recordingStatus}
                />
              </div>
            ),
            id: SideContentType.sourcereel
          },
          {
            label: 'Sourcecast Table',
            iconName: IconNames.EDIT,
            body: (
              <div>
                <SourcecastTable
                  handleDeleteSourcecastEntry={workspaceHandlers.handleDeleteSourcecastEntry}
                  sourcecastIndex={sourcecastIndex}
                  courseId={courseId}
                />
              </div>
            ),
            id: SideContentType.introduction
          },
          dataVisualizerTab,
          envVisualizerTab
        ],
        afterDynamicTabs: []
      },
      location: workspaceLocation
    },
    workspaceLocation
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
    handleChapterSelect: handleChapterSelect,
    // TODO Check this
    handleEditorValueChange: value => handleEditorValueChange(0, value),
    handleSetSourcecastStatus: handleSetSourcecastStatus,
    handleSetIsEditorReadonly: handleSetIsEditorReadonly,
    audioUrl: audioUrl,
    currentPlayerTime: currentPlayerTime,
    playbackData: playbackData,
    playbackStatus: playbackStatus,
    handleSetCurrentPlayerTime: sourcecastControlbarHandlers.handleSetCurrentPlayerTime,
    handleSetCodeDeltasToApply: sourcecastControlbarHandlers.handleSetCodeDeltasToApply,
    handleSetInputToApply: sourcecastControlbarHandlers.handleSetInputToApply,
    handleSetSourcecastDuration: sourcecastControlbarHandlers.handleSetSourcecastDuration,
    handlePromptAutocomplete,
    duration: playbackDuration
  };
  return (
    <div className={classNames('Sourcereel', Classes.DARK)}>
      {recordingStatus === RecordingStatus.paused ? (
        <SourceRecorderControlBar {...sourcecastControlbarProps} />
      ) : undefined}
      <Workspace {...workspaceProps} />
    </div>
  );
};

const INTRODUCTION = 'Welcome to Sourcereel!';

export default Sourcereel;
