import { Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
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
import {
  setEditorSessionId,
  setSharedbConnected
} from '../../commons/collabEditing/CollabEditingActions';
import { Position } from '../../commons/editor/EditorTypes';
import {
  addHtmlConsoleError,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  changeSideContentHeight,
  changeStepLimit,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
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
  ..._.pick(
    state.workspaces.playground,
    'editorSessionId',
    'execTime',
    'stepLimit',
    'isEditorAutorun',
    'breakpoints',
    'highlightedLines',
    'isRunning',
    'isDebugging',
    'enableDebugging',
    'newCursorPosition',
    'output',
    'replValue',
    'sideContentHeight',
    'sharedbConnected',
    'usingSubst'
  ),
  editorValue: state.workspaces.playground.editorValue!,
  queryString: state.playground.queryString,
  shortURL: state.playground.shortURL,
  playgroundSourceChapter: state.workspaces.playground.context.chapter,
  playgroundSourceVariant: state.workspaces.playground.context.variant,
  courseSourceChapter: state.session.sourceChapter,
  courseSourceVariant: state.session.sourceVariant,
  persistenceUser: state.session.googleUser,
  persistenceFile: state.playground.persistenceFile,
  githubOctokitObject: state.session.githubOctokitObject,
  githubSaveInfo: state.playground.githubSaveInfo
});

const workspaceLocation: WorkspaceLocation = 'playground';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAddHtmlConsoleError: (errorMsg: string) =>
        addHtmlConsoleError(errorMsg, workspaceLocation),
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeExecTime: (execTime: number) => changeExecTime(execTime, workspaceLocation),
      handleChangeStepLimit: (stepLimit: number) => changeStepLimit(stepLimit, workspaceLocation),
      handleChapterSelect: (chapter: Chapter, variant: Variant) =>
        chapterSelect(chapter, variant, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleGenerateLz: generateLzString,
      handleShortenURL: shortenURL,
      handleUpdateShortURL: updateShortURL,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
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
