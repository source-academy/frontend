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
  recordEditorInput,
  setEditorBreakpoint,
  setEditorSessionId,
  setSourcecastIsRecording,
  setWebsocketStatus,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import SourceCastRecording, {
  IDispatchProps,
  IStateProps
} from '../../components/sourceCast/SourceCastRecording';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.sourceCastRecording.sideContentActiveTab,
  breakpoints: state.workspaces.sourceCastRecording.breakpoints,
  editorSessionId: state.workspaces.sourceCastRecording.editorSessionId,
  editorValue: state.workspaces.sourceCastRecording.editorValue!,
  editorWidth: state.workspaces.sourceCastRecording.editorWidth,
  enableDebugging: state.workspaces.sourceCastRecording.enableDebugging,
  externalLibraryName: state.workspaces.playground.playgroundExternal,
  highlightedLines: state.workspaces.sourceCastRecording.highlightedLines,
  isDebugging: state.workspaces.sourceCastRecording.isDebugging,
  isEditorAutorun: state.workspaces.sourceCastRecording.isEditorAutorun,
  isRecording: state.workspaces.sourceCastRecording.isRecording,
  isRunning: state.workspaces.sourceCastRecording.isRunning,
  output: state.workspaces.sourceCastRecording.output,
  playbackData: state.workspaces.sourceCastRecording.playbackData,
  queryString: state.playground.queryString,
  replValue: state.workspaces.sourceCastRecording.replValue,
  sideContentHeight: state.workspaces.sourceCastRecording.sideContentHeight,
  sourceChapter: state.workspaces.sourceCastRecording.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus
});

const location: WorkspaceLocation = 'sourceCastRecording';

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
      handleRecordEditorInput: recordEditorInput,
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleSetSourcecastIsRecording: setSourcecastIsRecording,
      handleSetWebsocketStatus: (websocketStatus: number) =>
        setWebsocketStatus(location, websocketStatus),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
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
)(SourceCastRecording);
