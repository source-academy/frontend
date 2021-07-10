import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../../commons/application/actions/InterpreterActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Position } from '../../commons/editor/EditorTypes';
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
} from '../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import { fetchSourcecastIndex } from '../../features/sourceRecorder/sourcecast/SourcecastActions';
import {
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from '../../features/sourceRecorder/SourceRecorderActions';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus
} from '../../features/sourceRecorder/SourceRecorderTypes';
import Sourcecast, { DispatchProps, StateProps } from './Sourcecast';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  audioUrl: state.workspaces.sourcecast.audioUrl,
  currentPlayerTime: state.workspaces.sourcecast.currentPlayerTime,
  codeDeltasToApply: state.workspaces.sourcecast.codeDeltasToApply,
  title: state.workspaces.sourcecast.title,
  description: state.workspaces.sourcecast.description,
  editorReadonly: state.workspaces.sourcecast.editorReadonly,
  editorWidth: state.workspaces.sourcecast.editorWidth,
  editorValue: state.workspaces.sourcecast.editorValue!,
  externalLibraryName: state.workspaces.sourcecast.externalLibrary,
  isEditorAutorun: state.workspaces.sourcecast.isEditorAutorun,
  inputToApply: state.workspaces.sourcecast.inputToApply,
  breakpoints: state.workspaces.sourcecast.breakpoints,
  highlightedLines: state.workspaces.sourcecast.highlightedLines,
  isRunning: state.workspaces.sourcecast.isRunning,
  isDebugging: state.workspaces.sourcecast.isDebugging,
  enableDebugging: state.workspaces.sourcecast.enableDebugging,
  newCursorPosition: state.workspaces.sourcecast.newCursorPosition,
  output: state.workspaces.sourcecast.output,
  playbackDuration: state.workspaces.sourcecast.playbackDuration,
  playbackData: state.workspaces.sourcecast.playbackData,
  playbackStatus: state.workspaces.sourcecast.playbackStatus,
  replValue: state.workspaces.sourcecast.replValue,
  sideContentHeight: state.workspaces.sourcecast.sideContentHeight,
  sourcecastIndex: state.workspaces.sourcecast.sourcecastIndex,
  sourceChapter: state.workspaces.sourcecast.context.chapter,
  sourceVariant: state.workspaces.sourcecast.context.variant,
  uid: state.workspaces.sourcecast.uid
});

const location: WorkspaceLocation = 'sourcecast';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, 'default', location),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(location, cursorPosition),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, location),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), location),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, location),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, location),
      handleFetchSourcecastIndex: () => fetchSourcecastIndex(location),
      handleInterruptEval: () => beginInterruptExecution(location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSetCurrentPlayerTime: (playerTime: number) =>
        setCurrentPlayerTime(playerTime, location),
      handleSetCodeDeltasToApply: (deltas: CodeDelta[]) => setCodeDeltasToApply(deltas, location),
      handleSetEditorReadonly: (editorReadonly: boolean) =>
        setEditorReadonly(location, editorReadonly),
      handleSetInputToApply: (inputToApply: Input) => setInputToApply(inputToApply, location),
      handleSetSourcecastData: (
        title: string,
        description: string,
        uid: string,
        audioUrl: string,
        playbackData: PlaybackData
      ) => setSourcecastData(title, description, uid, audioUrl, playbackData, location),
      handleSetSourcecastDuration: (duration: number) => setSourcecastDuration(duration, location),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastStatus(playbackStatus, location),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleToggleEditorAutorun: () => toggleEditorAutorun(location),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(location, row, col, callback)
    },
    dispatch
  );

const SourcecastContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Sourcecast));

export default SourcecastContainer;
