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
  finishInvite,
  generateLzString,
  initInvite,
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
  sharedbAceIsInviting: state.workspaces.playground.sharedbAceIsInviting,
  sharedbAceInitValue: state.workspaces.playground.sharedbAceInitValue,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  sourceChapter: state.workspaces.playground.context.chapter,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.playgroundExternal
});

const workspaceLocation: WorkspaceLocation = WorkspaceLocations.playground;

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, workspaceLocation),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, workspaceLocation),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange, workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleFinishInvite: () => finishInvite(workspaceLocation),
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleInvalidEditorSessionId: () => invalidEditorSessionId(),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, workspaceLocation),
      handleInitInvite: (editorValue: string) => initInvite(editorValue, workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(workspaceLocation, editorSessionId),
      handleSetWebsocketStatus: (websocketStatus: number) =>
        setWebsocketStatus(workspaceLocation, websocketStatus),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleToggleEditorAutorun: () => toggleEditorAutorun(workspaceLocation),
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation)
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Playground)
);
