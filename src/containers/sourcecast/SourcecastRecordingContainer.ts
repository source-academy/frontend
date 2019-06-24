import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

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
  generateLzString,
  invalidEditorSessionId,
  playgroundExternalSelect,
  recordAudioUrl,
  recordEditorDelta,
  recordEditorInitValue,
  savePlaybackData,
  setEditorBreakpoint,
  setEditorReadonly,
  setEditorSessionId,
  setWebsocketStatus,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import SourcecastRecording, {
  IDispatchProps,
  IStateProps
} from '../../components/sourcecast/SourcecastRecording';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.sourcecastRecording.sideContentActiveTab,
  breakpoints: state.workspaces.sourcecastRecording.breakpoints,
  editorSessionId: state.workspaces.sourcecastRecording.editorSessionId,
  editorReadonly: state.workspaces.sourcecastRecording.editorReadonly,
  editorValue: state.workspaces.sourcecastRecording.editorValue!,
  editorWidth: state.workspaces.sourcecastRecording.editorWidth,
  enableDebugging: state.workspaces.sourcecastRecording.enableDebugging,
  externalLibraryName: state.workspaces.playground.playgroundExternal,
  highlightedLines: state.workspaces.sourcecastRecording.highlightedLines,
  isDebugging: state.workspaces.sourcecastRecording.isDebugging,
  isEditorAutorun: state.workspaces.sourcecastRecording.isEditorAutorun,
  isRunning: state.workspaces.sourcecastRecording.isRunning,
  output: state.workspaces.sourcecastRecording.output,
  playbackData: state.workspaces.sourcecastRecording.playbackData,
  queryString: state.playground.queryString,
  recordingStatus: state.workspaces.sourcecastRecording.recordingStatus,
  replValue: state.workspaces.sourcecastRecording.replValue,
  sideContentHeight: state.workspaces.sourcecastRecording.sideContentHeight,
  sourceChapter: state.workspaces.sourcecastRecording.context.chapter,
  timeElapsedBeforePause: state.workspaces.sourcecastRecording.timeElapsedBeforePause,
  timeResumed: state.workspaces.sourcecastRecording.timeResumed,
  websocketStatus: state.workspaces.playground.websocketStatus
});

const location: WorkspaceLocation = 'sourcecastRecording';

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
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(location),
      handleInvalidEditorSessionId: () => invalidEditorSessionId(),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, location),
      handleRecordAudioUrl: recordAudioUrl,
      handleRecordEditorDelta: recordEditorDelta,
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSavePlaybackData: (audio: Blob, playbackData: string) =>
        savePlaybackData(audio, playbackData),
      handleSetEditorReadonly: (readonly: boolean) => setEditorReadonly(location, readonly),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleRecordEditorInitValue: (editorValue: string) => recordEditorInitValue(editorValue),
      handleSetWebsocketStatus: (websocketStatus: number) =>
        setWebsocketStatus(location, websocketStatus),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleTimerPause: timerPause,
      handleTimerReset: timerReset,
      handleTimerResume: timerResume,
      handleTimerStart: timerStart,
      handleTimerStop: timerStop,
      handleToggleEditorAutorun: () => toggleEditorAutorun(location),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SourcecastRecording);
