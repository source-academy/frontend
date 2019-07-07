import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  IPlaybackData,
  IPosition,
  ISelectionData,
  PlaybackStatus
} from 'src/components/sourcecast/sourcecastShape';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeActiveTab,
  changeEditorHeight,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  debuggerReset,
  debuggerResume,
  evalEditor,
  evalRepl,
  fetchSourcecastIndex,
  generateLzString,
  invalidEditorSessionId,
  playgroundExternalSelect,
  recordAudioUrl,
  setDeltasToApply,
  setEditorBreakpoint,
  setEditorReadonly,
  setEditorSessionId,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus,
  setWebsocketStatus,
  toggleEditorAutorun,
  updateEditorCursorPosition,
  updateEditorSelectionData,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import Sourcecast, { IDispatchProps, IStateProps } from '../../components/sourcecast/Sourcecast';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.sourcecast.sideContentActiveTab,
  audioUrl: state.workspaces.sourcereel.audioUrl,
  codeDeltasToApply: state.workspaces.sourcecast.codeDeltasToApply,
  title: state.workspaces.sourcecast.title,
  description: state.workspaces.sourcecast.description,
  editorCursorPositionToBeApplied: state.workspaces.sourcecast.editorCursorPositionToBeApplied,
  editorSelectionDataToBeApplied: state.workspaces.sourcecast.editorSelectionDataToBeApplied,
  editorReadonly: state.workspaces.sourcecast.editorReadonly,
  editorSessionId: state.workspaces.sourcecast.editorSessionId,
  editorWidth: state.workspaces.sourcecast.editorWidth,
  editorValue: state.workspaces.sourcecast.editorValue!,
  isEditorAutorun: state.workspaces.sourcecast.isEditorAutorun,
  breakpoints: state.workspaces.sourcecast.breakpoints,
  highlightedLines: state.workspaces.sourcecast.highlightedLines,
  isRunning: state.workspaces.sourcecast.isRunning,
  isDebugging: state.workspaces.sourcecast.isDebugging,
  enableDebugging: state.workspaces.sourcecast.enableDebugging,
  output: state.workspaces.sourcecast.output,
  playbackDuration: state.workspaces.sourcecast.playbackDuration,
  playbackData: state.workspaces.sourcereel.playbackData,
  playbackStatus: state.workspaces.sourcecast.playbackStatus,
  queryString: state.playground.queryString,
  replValue: state.workspaces.sourcecast.replValue,
  sideContentHeight: state.workspaces.sourcecast.sideContentHeight,
  sourcecastIndex: state.workspaces.sourcecast.sourcecastIndex,
  sourceChapter: state.workspaces.sourcecast.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.playgroundExternal
});

const location: WorkspaceLocation = 'sourcecast';

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, location),
      handleFetchSourcecastIndex: fetchSourcecastIndex,
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(location),
      handleInvalidEditorSessionId: () => invalidEditorSessionId(),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, location),
      handleRecordAudioUrl: recordAudioUrl,
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSetCodeDeltasToApply: setDeltasToApply,
      handleSetEditorReadonly: (editorReadonly: boolean) =>
        setEditorReadonly(location, editorReadonly),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleSetSourcecastData: (title: string, description: string, playbackData: IPlaybackData) =>
        setSourcecastData(title, description, playbackData),
      handleSetSourcecastDuration: (duration: number) => setSourcecastDuration(duration),
      handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastStatus(playbackStatus),
      handleSetWebsocketStatus: (websocketStatus: number) =>
        setWebsocketStatus(location, websocketStatus),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleToggleEditorAutorun: () => toggleEditorAutorun(location),
      handleUpdateEditorCursorPosition: (editorCursorPositionToBeApplied: IPosition) =>
        updateEditorCursorPosition(location, editorCursorPositionToBeApplied),
      handleUpdateEditorSelectionData: (editorSelectionDataToBeApplied: ISelectionData) =>
        updateEditorSelectionData(location, editorSelectionDataToBeApplied),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sourcecast);
