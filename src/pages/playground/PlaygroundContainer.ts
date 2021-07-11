import { Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../../commons/application/actions/InterpreterActions';
import {
  loginGitHub,
  logoutGitHub,
  logoutGoogle
} from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  setEditorSessionId,
  setSharedbConnected
} from '../../commons/collabEditing/CollabEditingActions';
import { Position } from '../../commons/editor/EditorTypes';
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
  navigateToDeclaration,
  promptAutocomplete,
  sendReplInputToOutput,
  setEditorBreakpoint,
  toggleEditorAutorun,
  toggleUsingSubst,
  updateEditorValue,
  updateReplValue
} from '../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import {
  githubOpenFile,
  githubSaveFile,
  githubSaveFileAs
} from '../../features/github/GitHubActions';
import {
  persistenceInitialise,
  persistenceOpenPicker,
  persistenceSaveFile,
  persistenceSaveFileAs
} from '../../features/persistence/PersistenceActions';
import {
  generateLzString,
  shortenURL,
  updateShortURL
} from '../../features/playground/PlaygroundActions';
import Playground, { DispatchProps, StateProps } from './Playground';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  editorSessionId: state.workspaces.playground.editorSessionId,
  editorWidth: state.workspaces.playground.editorWidth,
  editorValue: state.workspaces.playground.editorValue!,
  execTime: state.workspaces.playground.execTime,
  stepLimit: state.workspaces.playground.stepLimit,
  isEditorAutorun: state.workspaces.playground.isEditorAutorun,
  breakpoints: state.workspaces.playground.breakpoints,
  highlightedLines: state.workspaces.playground.highlightedLines,
  isRunning: state.workspaces.playground.isRunning,
  isDebugging: state.workspaces.playground.isDebugging,
  enableDebugging: state.workspaces.playground.enableDebugging,
  newCursorPosition: state.workspaces.playground.newCursorPosition,
  output: state.workspaces.playground.output,
  queryString: state.playground.queryString,
  shortURL: state.playground.shortURL,
  replValue: state.workspaces.playground.replValue,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant,
  sharedbConnected: state.workspaces.playground.sharedbConnected,
  externalLibraryName: state.workspaces.playground.externalLibrary,
  usingSubst: state.workspaces.playground.usingSubst,
  persistenceUser: state.session.googleUser,
  persistenceFile: state.playground.persistenceFile,
  githubOctokitObject: state.session.githubOctokitObject,
  githubSaveInfo: state.playground.githubSaveInfo
});

const workspaceLocation: WorkspaceLocation = 'playground';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeExecTime: (execTime: number) =>
        changeExecTime(execTime.toString(), workspaceLocation),
      handleChangeStepLimit: (stepLimit: number) => changeStepLimit(stepLimit, workspaceLocation),
      handleChapterSelect: (chapter: number, variant: Variant) =>
        chapterSelect(chapter, variant, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleGenerateLz: generateLzString,
      handleShortenURL: (s: string) => shortenURL(s),
      handleUpdateShortURL: (s: string) => updateShortURL(s),
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName, initialise?: boolean) =>
        externalLibrarySelect(externalLibraryName, workspaceLocation, initialise),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleSetEditorSessionId: (editorSessionId: string) =>
        setEditorSessionId(workspaceLocation, editorSessionId),
      handleSendReplInputToOutput: (code: string) => sendReplInputToOutput(code, workspaceLocation),
      handleSetSharedbConnected: (connected: boolean) =>
        setSharedbConnected(workspaceLocation, connected),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleToggleEditorAutorun: () => toggleEditorAutorun(workspaceLocation),
      handleUsingSubst: (usingSubst: boolean) => toggleUsingSubst(usingSubst, workspaceLocation),
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback),
      handlePersistenceOpenPicker: persistenceOpenPicker,
      handlePersistenceSaveFile: persistenceSaveFileAs,
      handlePersistenceUpdateFile: persistenceSaveFile,
      handlePersistenceInitialise: persistenceInitialise,
      handlePersistenceLogOut: logoutGoogle,
      handleGitHubOpenFile: githubOpenFile,
      handleGitHubSaveFileAs: githubSaveFileAs,
      handleGitHubSaveFile: githubSaveFile,
      handleGitHubLogIn: loginGitHub,
      handleGitHubLogOut: logoutGitHub
    },
    dispatch
  );

const PlaygroundContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground));

export default PlaygroundContainer;
