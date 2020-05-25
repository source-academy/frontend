import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitAnswer } from 'src/commons/actions/SessionActions';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from 'src/commons/actions/InterpreterActions';

import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  resetWorkspace,
  setEditorBreakpoint,
  updateCurrentAssessmentId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateWorkspace,
  WorkspaceLocation
} from 'src/commons/workspace/WorkspaceActions';

import { Library } from 'src/commons/assessment/AssessmentTypes';
import { IPosition } from 'src/commons/editor/EditorComponent';
import { IState, IWorkspaceState } from 'src/reducers/states'; // TODO: Import from commons

import EditingWorkspace, {
  EditingWorkspaceDispatchProps,
  EditingWorkspaceOwnProps,
  EditingWorkspaceStateProps
} from './EditingWorkspaceComponent';

const mapStateToProps: MapStateToProps<
  EditingWorkspaceStateProps,
  EditingWorkspaceOwnProps,
  IState
> = (state, props) => {
  return {
    editorValue: state.workspaces.assessment.editorValue,
    editorHeight: state.workspaces.assessment.editorHeight,
    editorWidth: state.workspaces.assessment.editorWidth,
    breakpoints: state.workspaces.assessment.breakpoints,
    highlightedLines: state.workspaces.assessment.highlightedLines,
    hasUnsavedChanges: state.workspaces.assessment.hasUnsavedChanges,
    isRunning: state.workspaces.assessment.isRunning,
    isDebugging: state.workspaces.assessment.isDebugging,
    enableDebugging: state.workspaces.assessment.enableDebugging,
    newCursorPosition: state.workspaces.assessment.newCursorPosition,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    storedAssessmentId: state.workspaces.assessment.currentAssessment,
    storedQuestionId: state.workspaces.assessment.currentQuestion
  };
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<EditingWorkspaceDispatchProps, {}> = (
  dispatch: Dispatch
) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, 'default', workspaceLocation),
      handleClearContext: (library: Library) => beginClearContext(library, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: IPosition) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleResetWorkspace: (options: Partial<IWorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleUpdateWorkspace: (options: Partial<IWorkspaceState>) =>
        updateWorkspace(workspaceLocation, options),
      handleSave: submitAnswer,
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges),
      handleUpdateCurrentAssessmentId: updateCurrentAssessmentId,
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditingWorkspace);
