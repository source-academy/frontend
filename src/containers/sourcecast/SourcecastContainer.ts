import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  debuggerReset,
  debuggerResume,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  fetchSourcecastIndex,
  navigateToDeclaration,
  promptAutocomplete,
  setCodeDeltasToApply,
  setEditorBreakpoint,
  setEditorReadonly,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus,
  toggleEditorAutorun,
  updateActiveTab,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions';
import { ExternalLibraryName } from '../../components/assessment/assessmentShape';
import Sourcecast, { IDispatchProps, IStateProps } from '../../components/sourcecast/Sourcecast';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
  IPosition,
  PlaybackStatus
} from '../../components/sourcecast/sourcecastShape';
import { IState, SideContentType } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  audioUrl: state.workspaces.sourcecast.audioUrl,
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
  sourceChapter: state.workspaces.sourcecast.context.chapter
});

const location: WorkspaceLocation = 'sourcecast';

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleActiveTabChange: (activeTab: SideContentType) => updateActiveTab(activeTab, location),
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, location),
      handleDeclarationNavigate: (cursorPosition: IPosition) =>
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
      handleSetCodeDeltasToApply: (deltas: ICodeDelta[]) => setCodeDeltasToApply(deltas, location),
      handleSetEditorReadonly: (editorReadonly: boolean) =>
        setEditorReadonly(location, editorReadonly),
      handleSetInputToApply: (inputToApply: Input) => setInputToApply(inputToApply, location),
      handleSetSourcecastData: (
        title: string,
        description: string,
        audioUrl: string,
        playbackData: IPlaybackData
      ) => setSourcecastData(title, description, audioUrl, playbackData, location),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sourcecast);
