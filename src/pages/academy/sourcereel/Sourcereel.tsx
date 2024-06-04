import { Classes, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import { changeSideContentHeight } from 'src/commons/sideContent/SideContentActions';
import { fetchSourcecastIndex } from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from 'src/features/sourceRecorder/SourceRecorderActions';
import SourcereelActions from 'src/features/sourceRecorder/sourcereel/SourcereelActions';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { ControlBarAutorunButtons } from '../../../commons/controlBar/ControlBarAutorunButtons';
import { ControlBarChapterSelect } from '../../../commons/controlBar/ControlBarChapterSelect';
import { ControlBarClearButton } from '../../../commons/controlBar/ControlBarClearButton';
import { ControlBarEvalButton } from '../../../commons/controlBar/ControlBarEvalButton';
import {
  convertEditorTabStateToProps,
  SourcecastEditorContainerProps
} from '../../../commons/editor/EditorContainer';
import { Position } from '../../../commons/editor/EditorTypes';
import makeCseMachineTabFrom from '../../../commons/sideContent/content/SideContentCseMachine';
import makeDataVisualizerTabFrom from '../../../commons/sideContent/content/SideContentDataVisualizer';
import { useSideContent } from '../../../commons/sideContent/SideContentHelper';
import { SideContentType } from '../../../commons/sideContent/SideContentTypes';
import SourceRecorderControlBar, {
  SourceRecorderControlBarProps
} from '../../../commons/sourceRecorder/SourceRecorderControlBar';
import SourcecastTable from '../../../commons/sourceRecorder/SourceRecorderTable';
import { useTypedSelector } from '../../../commons/utils/Hooks';
import Workspace, { WorkspaceProps } from '../../../commons/workspace/Workspace';
import WorkspaceActions from '../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import {
  CodeDelta,
  Input,
  KeyboardCommand,
  PlaybackData,
  PlaybackStatus,
  RecordingStatus
} from '../../../features/sourceRecorder/SourceRecorderTypes';
import SourcereelControlbar from './subcomponents/SourcereelControlbar';

const workspaceLocation: WorkspaceLocation = 'sourcereel';
const sourcecastLocation: WorkspaceLocation = 'sourcecast';

const Sourcereel: React.FC = () => {
  const { selectedTab, setSelectedTab } = useSideContent(
    workspaceLocation,
    SideContentType.sourcereel
  );

  const courseId = useTypedSelector(state => state.session.courseId);
  const { chapter: sourceChapter, variant: sourceVariant } = useTypedSelector(
    state => state.workspaces[workspaceLocation].context
  );
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
    isFolderModeEnabled,
    activeEditorTabIndex,
    editorTabs,
    externalLibrary: externalLibraryName,
    isDebugging,
    isEditorAutorun,
    isEditorReadonly,
    isRunning,
    output,
    playbackData,
    recordingStatus,
    replValue,
    timeElapsedBeforePause,
    timeResumed
  } = useTypedSelector(store => store.workspaces[workspaceLocation]);

  const dispatch = useDispatch();
  const {
    handleChapterSelect,
    handleEditorEval,
    handleEditorValueChange,
    handleExternalSelect,
    handleRecordInput,
    handleReplEval,
    handleSetSourcecastStatus,
    handleSetIsEditorReadonly
  } = useMemo(() => {
    return {
      handleChapterSelect: (chapter: Chapter) =>
        dispatch(WorkspaceActions.chapterSelect(chapter, Variant.DEFAULT, workspaceLocation)),
      handleEditorEval: () => dispatch(WorkspaceActions.evalEditor(workspaceLocation)),
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorValueChange: (newEditorValue: string) =>
        dispatch(WorkspaceActions.updateEditorValue(workspaceLocation, 0, newEditorValue)),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        dispatch(WorkspaceActions.externalLibrarySelect(externalLibraryName, workspaceLocation)),
      handleRecordInput: (input: Input) =>
        dispatch(SourcereelActions.recordInput(input, workspaceLocation)),
      handleReplEval: () => dispatch(WorkspaceActions.evalRepl(workspaceLocation)),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        dispatch(setSourcecastStatus(playbackStatus, sourcecastLocation)),
      handleSetIsEditorReadonly: (readonly: boolean) =>
        dispatch(WorkspaceActions.setIsEditorReadonly(workspaceLocation, readonly))
    };
  }, [dispatch]);

  useEffect(() => {
    fetchSourcecastIndex(sourcecastLocation);
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
      case 'externalLibrarySelect':
        handleExternalSelect(inputToApply.data);
        break;
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
      externalLibrary: externalLibraryName,
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      editorValue: editorTabs[0].value
    };
    dispatch(SourcereelActions.recordInit(initData, workspaceLocation));
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
  const autorunButtonHandlers = useMemo(() => {
    return {
      handleDebuggerPause: () => dispatch(InterpreterActions.beginDebuggerPause(workspaceLocation)),
      handleDebuggerResume: () => dispatch(InterpreterActions.debuggerResume(workspaceLocation)),
      handleDebuggerReset: () => dispatch(InterpreterActions.debuggerReset(workspaceLocation)),
      handleInterruptEval: () =>
        dispatch(InterpreterActions.beginInterruptExecution(workspaceLocation)),
      handleToggleEditorAutorun: () =>
        dispatch(WorkspaceActions.toggleEditorAutorun(workspaceLocation))
    };
  }, [dispatch]);
  const autorunButtons = (
    <ControlBarAutorunButtons
      handleDebuggerPause={autorunButtonHandlers.handleDebuggerPause}
      handleDebuggerResume={autorunButtonHandlers.handleDebuggerResume}
      handleDebuggerReset={autorunButtonHandlers.handleDebuggerReset}
      handleEditorEval={editorEvalHandler}
      handleInterruptEval={autorunButtonHandlers.handleInterruptEval}
      handleToggleEditorAutorun={autorunButtonHandlers.handleToggleEditorAutorun}
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
    () => (
      <ControlBarClearButton
        handleReplOutputClear={() => dispatch(WorkspaceActions.clearReplOutput(workspaceLocation))}
        key="clear_repl"
      />
    ),
    [dispatch]
  );

  const evalButton = (
    <ControlBarEvalButton handleReplEval={handleReplEval} isRunning={isRunning} key="eval_repl" />
  );

  const editorContainerHandlers = useMemo(() => {
    return {
      setActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        dispatch(
          WorkspaceActions.updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex)
        ),
      removeEditorTabByIndex: (editorTabIndex: number) =>
        dispatch(WorkspaceActions.removeEditorTab(workspaceLocation, editorTabIndex)),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        dispatch(WorkspaceActions.navigateToDeclaration(workspaceLocation, cursorPosition)),
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable Folder mode.
      handleEditorUpdateBreakpoints: (newBreakpoints: string[]) =>
        dispatch(WorkspaceActions.setEditorBreakpoint(workspaceLocation, 0, newBreakpoints))
    };
  }, [dispatch]);
  const editorContainerProps: SourcecastEditorContainerProps = {
    handleEditorEval: handleEditorEval,
    handleEditorValueChange: handleEditorValueChange,
    handleRecordInput: handleRecordInput,
    codeDeltasToApply: codeDeltasToApply,
    inputToApply: inputToApply,
    isEditorAutorun: isEditorAutorun,
    isEditorReadonly: isEditorReadonly,
    editorVariant: sourcecastLocation,
    isFolderModeEnabled,
    activeEditorTabIndex,
    setActiveEditorTabIndex: editorContainerHandlers.setActiveEditorTabIndex,
    removeEditorTabByIndex: editorContainerHandlers.removeEditorTabByIndex,
    editorTabs: editorTabs.map(convertEditorTabStateToProps),
    handleDeclarationNavigate: editorContainerHandlers.handleDeclarationNavigate,
    handleEditorUpdateBreakpoints: editorContainerHandlers.handleEditorUpdateBreakpoints,
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

  const dataVisualizerTab = makeDataVisualizerTabFrom(workspaceLocation);
  const cseMachineTab = makeCseMachineTabFrom(workspaceLocation);

  const workspaceHandlers = useMemo(() => {
    return {
      handleBrowseHistoryDown: () =>
        dispatch(WorkspaceActions.browseReplHistoryDown(workspaceLocation)),
      handleBrowseHistoryUp: () =>
        dispatch(WorkspaceActions.browseReplHistoryUp(workspaceLocation)),
      handleReplValueChange: (newValue: string) =>
        dispatch(WorkspaceActions.updateReplValue(newValue, workspaceLocation)),
      handleDeleteSourcecastEntry: (id: number) =>
        dispatch(SourcereelActions.deleteSourcecastEntry(id, sourcecastLocation)),
      // SourcereelControlbar handlers
      handleResetInputs: (inputs: Input[]) =>
        dispatch(SourcereelActions.resetInputs(inputs, workspaceLocation)),
      handleSaveSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audio: Blob,
        playbackData: PlaybackData
      ) =>
        dispatch(
          saveSourcecastData(title, description, uid, audio, playbackData, sourcecastLocation)
        ),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) =>
        dispatch(
          setSourcecastData(title, description, uid, audioUrl, playbackData, sourcecastLocation)
        ),
      handleTimerPause: () => dispatch(SourcereelActions.timerPause(workspaceLocation)),
      handleTimerReset: () => dispatch(SourcereelActions.timerReset(workspaceLocation)),
      handleTimerResume: (timeBefore: number) =>
        dispatch(SourcereelActions.timerResume(timeBefore, workspaceLocation)),
      handleTimerStart: () => dispatch(SourcereelActions.timerStart(workspaceLocation)),
      handleTimerStop: () => dispatch(SourcereelActions.timerStop(workspaceLocation))
    };
  }, [dispatch]);

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [autorunButtons, chapterSelectButton]
    },
    editorContainerProps: editorContainerProps,
    handleSideContentHeightChange: heightChange =>
      dispatch(changeSideContentHeight(heightChange, workspaceLocation)),
    replProps: {
      output: output,
      replValue: replValue,
      handleBrowseHistoryDown: workspaceHandlers.handleBrowseHistoryDown,
      handleBrowseHistoryUp: workspaceHandlers.handleBrowseHistoryUp,
      handleReplEval: handleReplEval,
      handleReplValueChange: workspaceHandlers.handleReplValueChange,
      sourceChapter: sourceChapter,
      sourceVariant: sourceVariant,
      externalLibrary: externalLibraryName,
      replButtons: [evalButton, clearButton]
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
          cseMachineTab
        ],
        afterDynamicTabs: []
      },
      workspaceLocation
    }
  };

  const sourcecastControlbarHandlers = useMemo(() => {
    return {
      handleSetCurrentPlayerTime: (playerTime: number) =>
        dispatch(setCurrentPlayerTime(playerTime, sourcecastLocation)),
      handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
        dispatch(setCodeDeltasToApply(deltas, sourcecastLocation)),
      handleSetInputToApply: (inputToApply: Input) =>
        dispatch(setInputToApply(inputToApply, sourcecastLocation)),
      handleSetSourcecastDuration: (duration: number) =>
        dispatch(setSourcecastDuration(duration, sourcecastLocation)),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        dispatch(WorkspaceActions.promptAutocomplete(workspaceLocation, row, col, callback))
    };
  }, [dispatch]);
  const sourcecastControlbarProps: SourceRecorderControlBarProps = {
    handleChapterSelect: handleChapterSelect,
    handleEditorValueChange: handleEditorValueChange,
    handleExternalSelect: handleExternalSelect,
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
    handlePromptAutocomplete: sourcecastControlbarHandlers.handlePromptAutocomplete,
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

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Sourcereel;
Component.displayName = 'Sourcereel';

export default Sourcereel;
