import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../../../commons/application/actions/InterpreterActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { Position } from '../../../commons/editor/EditorTypes';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  navigateToDeclaration,
  promptAutocomplete,
  setEditorBreakpoint,
  setEditorReadonly,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue
} from '../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { fetchSourcecastIndex } from '../../../features/sourceRecorder/sourcecast/SourcecastActions';
import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from '../../../features/sourceRecorder/SourceRecorderActions';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus
} from '../../../features/sourceRecorder/SourceRecorderTypes';
import {
  deleteSourcecastEntry,
  recordInit,
  recordInput,
  resetInputs,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop
} from '../../../features/sourceRecorder/sourcereel/SourcereelActions';
import Sourcereel, { DispatchProps, StateProps } from './Sourcereel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  audioUrl: state.workspaces.sourcecast.audioUrl,
  currentPlayerTime: state.workspaces.sourcecast.currentPlayerTime,
  codeDeltasToApply: state.workspaces.sourcecast.codeDeltasToApply,
  breakpoints: state.workspaces.sourcereel.breakpoints,
  editorReadonly: state.workspaces.sourcereel.editorReadonly,
  editorValue: state.workspaces.sourcereel.editorValue!,
  editorWidth: state.workspaces.sourcereel.editorWidth,
  enableDebugging: state.workspaces.sourcereel.enableDebugging,
  externalLibraryName: state.workspaces.sourcereel.externalLibrary,
  highlightedLines: state.workspaces.sourcereel.highlightedLines,
  inputToApply: state.workspaces.sourcecast.inputToApply,
  isDebugging: state.workspaces.sourcereel.isDebugging,
  isEditorAutorun: state.workspaces.sourcereel.isEditorAutorun,
  isRunning: state.workspaces.sourcereel.isRunning,
  newCursorPosition: state.workspaces.sourcereel.newCursorPosition,
  output: state.workspaces.sourcereel.output,
  playbackData: state.workspaces.sourcereel.playbackData,
  playbackDuration: state.workspaces.sourcecast.playbackDuration,
  playbackStatus: state.workspaces.sourcecast.playbackStatus,
  recordingStatus: state.workspaces.sourcereel.recordingStatus,
  replValue: state.workspaces.sourcereel.replValue,
  sideContentHeight: state.workspaces.sourcereel.sideContentHeight,
  sourcecastIndex: state.workspaces.sourcecast.sourcecastIndex,
  sourceChapter: state.workspaces.sourcereel.context.chapter,
  sourceVariant: state.workspaces.sourcereel.context.variant,
  timeElapsedBeforePause: state.workspaces.sourcereel.timeElapsedBeforePause,
  timeResumed: state.workspaces.sourcereel.timeResumed
});

const location: WorkspaceLocation = 'sourcereel';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, 'default', location),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(location, cursorPosition),
      handleDeleteSourcecastEntry: (id: number) => deleteSourcecastEntry(id, 'sourcecast'),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, location),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), location),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, location),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, location),
      handleFetchSourcecastIndex: () => fetchSourcecastIndex('sourcecast'),
      handleInterruptEval: () => beginInterruptExecution(location),
      handleRecordInput: (input: Input) => recordInput(input, location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSaveSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audio: Blob,
        playbackData: PlaybackData
      ) => saveSourcecastData(title, description, uid, audio, playbackData, 'sourcecast'),
      handleSetCurrentPlayerTime: (playerTime: number) =>
        setCurrentPlayerTime(playerTime, 'sourcecast'),
      handleSetCodeDeltasToApply: (deltas: CodeDelta[]) =>
        setCodeDeltasToApply(deltas, 'sourcecast'),
      handleSetInputToApply: (inputToApply: Input) => setInputToApply(inputToApply, 'sourcecast'),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) => setSourcecastData(title, description, uid, audioUrl, playbackData, 'sourcecast'),
      handleSetSourcecastDuration: (duration: number) =>
        setSourcecastDuration(duration, 'sourcecast'),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastStatus(playbackStatus, 'sourcecast'),
      handleSetEditorReadonly: (readonly: boolean) => setEditorReadonly(location, readonly),
      handleResetInputs: (inputs: Input[]) => resetInputs(inputs, location),
      handleRecordInit: (initData: PlaybackData['init']) => recordInit(initData, location),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleTimerPause: () => timerPause(location),
      handleTimerReset: () => timerReset(location),
      handleTimerResume: (timeBefore: number) => timerResume(timeBefore, location),
      handleTimerStart: () => timerStart(location),
      handleTimerStop: () => timerStop(location),
      handleToggleEditorAutorun: () => toggleEditorAutorun(location),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(location, row, col, callback)
    },
    dispatch
  );

const SourcereelContainer = connect(mapStateToProps, mapDispatchToProps)(Sourcereel);

export default SourcereelContainer;
