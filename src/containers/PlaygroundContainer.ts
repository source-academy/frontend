import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
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
  setEditorSessionId,
  setWebsocketStatus,
  toggleEditorAutorun,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation,
  WorkspaceLocations
} from '../actions';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import Playground, { IDispatchProps, IStateProps } from '../components/Playground';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.playground.sideContentActiveTab,
  editorSessionId: state.workspaces.playground.editorSessionId,
  editorWidth: state.workspaces.playground.editorWidth,
  editorValue: state.workspaces.playground.editorValue!,
  isEditorAutorun: state.workspaces.playground.isEditorAutorun,
  breakpoints: state.workspaces.playground.breakpoints,
  highlightedLines: state.workspaces.playground.highlightedLines,
  isRunning: state.workspaces.playground.isRunning,
  isDebugging: state.workspaces.playground.isDebugging,
  enableDebugging: state.workspaces.playground.enableDebugging,
  output: state.workspaces.playground.output,
  queryString: state.playground.queryString,
  replValue: state.workspaces.playground.replValue,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  sourceChapter: state.workspaces.playground.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.playgroundExternal
});

const wkspLocation: WorkspaceLocation = WorkspaceLocations.playground;

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(wkspLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(wkspLocation),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, wkspLocation),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, wkspLocation),
      handleEditorEval: () => evalEditor(wkspLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, wkspLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, wkspLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange, wkspLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, wkspLocation),
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(wkspLocation),
      handleInvalidEditorSessionId: () => invalidEditorSessionId(),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, wkspLocation),
      handleReplEval: () => evalRepl(wkspLocation),
      handleReplOutputClear: () => clearReplOutput(wkspLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, wkspLocation),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(wkspLocation, editorSessionId),
      handleSetWebsocketStatus: (websocketStatus: number) =>
        setWebsocketStatus(wkspLocation, websocketStatus),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, wkspLocation),
      handleToggleEditorAutorun: () => toggleEditorAutorun(wkspLocation),
      handleDebuggerPause: () => beginDebuggerPause(wkspLocation),
      handleDebuggerResume: () => debuggerResume(wkspLocation),
      handleDebuggerReset: () => debuggerReset(wkspLocation)
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Playground)
);
