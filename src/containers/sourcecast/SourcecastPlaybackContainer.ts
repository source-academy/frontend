import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { PlaybackStatus } from 'src/components/sourcecast/sourcecastShape';
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
  setSourcecastPlaybackStatus,
  setWebsocketStatus,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import { IDispatchProps, IStateProps } from '../../components/sourcecast/SourcecastPlayback';
import SourcecastPlayback from '../../components/sourcecast/SourcecastPlayback';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.sourcecastPlayback.sideContentActiveTab,
  editorReadonly: state.workspaces.sourcecastPlayback.editorReadonly,
  editorSessionId: state.workspaces.sourcecastPlayback.editorSessionId,
  editorWidth: state.workspaces.sourcecastPlayback.editorWidth,
  editorValue: state.workspaces.sourcecastPlayback.editorValue!,
  isEditorAutorun: state.workspaces.sourcecastPlayback.isEditorAutorun,
  breakpoints: state.workspaces.sourcecastPlayback.breakpoints,
  highlightedLines: state.workspaces.sourcecastPlayback.highlightedLines,
  isRunning: state.workspaces.sourcecastPlayback.isRunning,
  isDebugging: state.workspaces.sourcecastPlayback.isDebugging,
  enableDebugging: state.workspaces.sourcecastPlayback.enableDebugging,
  output: state.workspaces.sourcecastPlayback.output,
  playbackDuration: state.workspaces.sourcecastPlayback.playbackDuration,
  playbackData: state.workspaces.sourcecastRecording.playbackData,
  playbackStatus: state.workspaces.sourcecastPlayback.playbackStatus,
  queryString: state.playground.queryString,
  replValue: state.workspaces.sourcecastPlayback.replValue,
  sideContentHeight: state.workspaces.sourcecastPlayback.sideContentHeight,
  sourceChapter: state.workspaces.sourcecastPlayback.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.playgroundExternal
});

const location: WorkspaceLocation = 'sourcecastPlayback';

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
      handleSetEditorReadonly: (editorReadonly: boolean) =>
        setEditorReadonly(location, editorReadonly),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleSetSourcecastPlaybackDuration: (duration: number) =>
        setSourcecastPlaybackDuration(duration),
      handleSetSourcecastPlaybackStatus: (playbackStatus: PlaybackStatus) =>
        setSourcecastPlaybackStatus(playbackStatus),
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
)(SourcecastPlayback);
