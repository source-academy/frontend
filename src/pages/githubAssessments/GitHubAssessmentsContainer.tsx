import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import {
  generateLzString,
  shortenURL,
  toggleUsingSubst,
  updateShortURL
} from 'src/features/playground/PlaygroundActions';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../../commons/application/actions/InterpreterActions';
import { loginGitHub, logoutGitHub } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  setEditorSessionId,
  setSharedbConnected
} from '../../commons/collabEditing/CollabEditingActions';
import { Position } from '../../commons/editor/EditorTypes';
import { SideContentType } from '../../commons/sideContent/SideContentTypes';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeExecTime,
  changeSideContentHeight,
  changeStepLimit,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  externalLibrarySelect,
  fetchSublanguage,
  navigateToDeclaration,
  promptAutocomplete,
  sendReplInputToOutput,
  setEditorBreakpoint,
  toggleEditorAutorun,
  updateActiveTab,
  updateEditorValue,
  updateReplValue
} from '../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import MissionEditor, { DispatchProps, StateProps } from './GitHubAssessments';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  editorSessionId: state.workspaces.githubAssessments.editorSessionId,
  editorWidth: state.workspaces.githubAssessments.editorWidth,
  editorValue: state.workspaces.githubAssessments.editorValue!,
  execTime: state.workspaces.githubAssessments.execTime,
  stepLimit: state.workspaces.githubAssessments.stepLimit,
  isEditorAutorun: state.workspaces.githubAssessments.isEditorAutorun,
  breakpoints: state.workspaces.githubAssessments.breakpoints,
  highlightedLines: state.workspaces.githubAssessments.highlightedLines,
  isRunning: state.workspaces.githubAssessments.isRunning,
  isDebugging: state.workspaces.githubAssessments.isDebugging,
  enableDebugging: state.workspaces.githubAssessments.enableDebugging,
  newCursorPosition: state.workspaces.githubAssessments.newCursorPosition,
  output: state.workspaces.githubAssessments.output,
  replValue: state.workspaces.githubAssessments.replValue,
  sideContentHeight: state.workspaces.githubAssessments.sideContentHeight,
  sourceChapter: state.workspaces.githubAssessments.context.chapter,
  sourceVariant: state.workspaces.githubAssessments.context.variant,
  sharedbConnected: state.workspaces.githubAssessments.sharedbConnected,
  externalLibraryName: state.workspaces.githubAssessments.externalLibrary,
  usingSubst: state.playground.usingSubst
});

const location: WorkspaceLocation = 'githubAssessments';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleActiveTabChange: (activeTab: SideContentType) => updateActiveTab(activeTab, location),
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChangeExecTime: (execTime: number) => changeExecTime(execTime.toString(), location),
      handleChangeStepLimit: (stepLimit: number) => changeStepLimit(stepLimit, location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, 'default', location),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(location, cursorPosition),
      handleFetchSublanguage: fetchSublanguage,
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, location),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), location),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, location),
      handleGenerateLz: generateLzString,
      handleShortenURL: (s: string) => shortenURL(s),
      handleUpdateShortURL: (s: string) => updateShortURL(s),
      handleInterruptEval: () => beginInterruptExecution(location),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName, initialise?: boolean) =>
        externalLibrarySelect(externalLibraryName, location, initialise),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(location, editorSessionId),
      handleSendReplInputToOutput: (code: string) => sendReplInputToOutput(code, location),
      handleSetSharedbConnected: (connected: boolean) => setSharedbConnected(location, connected),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleToggleEditorAutorun: () => toggleEditorAutorun(location),
      handleUsingSubst: (usingSubst: boolean) => toggleUsingSubst(usingSubst),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location),
      handleFetchChapter: fetchSublanguage,
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(location, row, col, callback),
      handleGitHubLogIn: loginGitHub,
      handleGitHubLogOut: logoutGitHub
    },
    dispatch
  );

const GitHubAssessmentsContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MissionEditor)
);

export default GitHubAssessmentsContainer;
