import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { Variant } from 'js-slang/dist/types';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeExecTime,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  debuggerReset,
  debuggerResume,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  finishInvite,
  generateLzString,
  initInvite,
  invalidEditorSessionId,
  navigateToDeclaration,
  promptAutocomplete,
  setEditorBreakpoint,
  setEditorSessionId,
  setWebsocketStatus,
  toggleEditorAutorun,
  toggleUsingSubst,
  updateActiveTab,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation,
  WorkspaceLocations
} from '../actions';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import Playground, { IDispatchProps, IStateProps } from '../components/Playground';
import { IPosition } from '../components/workspace/Editor';
import { IState, SideContentType } from '../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  editorSessionId: state.workspaces.playground.editorSessionId,
  editorWidth: state.workspaces.playground.editorWidth,
  editorValue: state.workspaces.playground.editorValue!,
  execTime: state.workspaces.playground.execTime,
  isEditorAutorun: state.workspaces.playground.isEditorAutorun,
  breakpoints: state.workspaces.playground.breakpoints,
  highlightedLines: state.workspaces.playground.highlightedLines,
  isRunning: state.workspaces.playground.isRunning,
  isDebugging: state.workspaces.playground.isDebugging,
  enableDebugging: state.workspaces.playground.enableDebugging,
  newCursorPosition: state.workspaces.playground.newCursorPosition,
  output: state.workspaces.playground.output,
  queryString: state.playground.queryString,
  replValue: state.workspaces.playground.replValue,
  sharedbAceIsInviting: state.workspaces.playground.sharedbAceIsInviting,
  sharedbAceInitValue: state.workspaces.playground.sharedbAceInitValue,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant,
  websocketStatus: state.workspaces.playground.websocketStatus,
  externalLibraryName: state.workspaces.playground.externalLibrary,
  usingSubst: state.playground.usingSubst
});

const workspaceLocation: WorkspaceLocation = WorkspaceLocations.playground;

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleActiveTabChange: (activeTab: SideContentType) =>
        updateActiveTab(activeTab, workspaceLocation),
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeExecTime: (execTime: number) =>
        changeExecTime(execTime.toString(), workspaceLocation),
      handleChapterSelect: (chapter: number, variant: Variant) =>
        chapterSelect(chapter, variant, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: IPosition) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleFinishInvite: () => finishInvite(workspaceLocation),
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleInvalidEditorSessionId: () => invalidEditorSessionId(),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        externalLibrarySelect(externalLibraryName, workspaceLocation),
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
      handleUsingSubst: (usingSubst: boolean) => toggleUsingSubst(usingSubst),
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback)
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Playground)
);
