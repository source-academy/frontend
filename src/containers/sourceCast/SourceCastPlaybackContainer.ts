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
  setEditorBreakpoint,
  setEditorReadonly,
  setEditorSessionId,
  setSourcecastPlaybackDuration,
  setSourcecastPlaybackIsPlaying,
  setWebsocketStatus,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import { IDispatchProps, IStateProps } from '../../components/sourceCast/SourceCastPlayback';
import SourceCastPlayback from '../../components/sourceCast/SourceCastPlayback';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.sourceCastPlayback.sideContentActiveTab,
  editorReadonly: state.workspaces.sourceCastPlayback.editorReadonly,
  editorSessionId: state.workspaces.sourceCastPlayback.editorSessionId,
  editorWidth: state.workspaces.sourceCastPlayback.editorWidth,
  editorValue: state.workspaces.sourceCastPlayback.editorValue!,
  isEditorAutorun: state.workspaces.sourceCastPlayback.isEditorAutorun,
  breakpoints: state.workspaces.sourceCastPlayback.breakpoints,
  highlightedLines: state.workspaces.sourceCastPlayback.highlightedLines,
  isRunning: state.workspaces.sourceCastPlayback.isRunning,
  isDebugging: state.workspaces.sourceCastPlayback.isDebugging,
  isPlaying: state.workspaces.sourceCastPlayback.isPlaying,
  enableDebugging: state.workspaces.sourceCastPlayback.enableDebugging,
  output: state.workspaces.sourceCastPlayback.output,
  playbackDuration: state.workspaces.sourceCastPlayback.playbackDuration,
  queryString: state.playground.queryString,
  replValue: state.workspaces.sourceCastPlayback.replValue,
  sideContentHeight: state.workspaces.sourceCastPlayback.sideContentHeight,
  sourceChapter: state.workspaces.sourceCastPlayback.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.playgroundExternal
});

const location: WorkspaceLocation = 'sourceCastPlayback';

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
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSetEditorReadonly: (editorReadonly: boolean) => setEditorReadonly(editorReadonly),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleSetSourcecastPlaybackDuration: (duration: number) =>
        setSourcecastPlaybackDuration(duration),
      handleSetSourcecastPlaybackIsPlaying: (isPlaying: boolean) =>
        setSourcecastPlaybackIsPlaying(isPlaying),
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
)(SourceCastPlayback);
