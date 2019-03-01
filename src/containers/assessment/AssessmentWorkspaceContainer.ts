import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  beginClearContext,
  beginDebuggerPause,
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeActiveTab,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  debuggerReset,
  debuggerResume,
  evalEditor,
  evalRepl,
  fetchAssessment,
  submitAnswer,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue
} from '../../actions'
import {
  resetWorkspace,
  updateCurrentAssessmentId,
  WorkspaceLocation
} from '../../actions/workspaces'
import { Library } from '../../components/assessment/assessmentShape'
import AssessmentWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/assessment/AssessmentWorkspace'
import { IState, IWorkspaceState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    activeTab: state.workspaces.assessment.sideContentActiveTab,
    assessment: state.session.assessments.get(props.assessmentId),
    editorValue: state.workspaces.assessment.editorValue,
    editorWidth: state.workspaces.assessment.editorWidth,
    hasUnsavedChanges: state.workspaces.assessment.hasUnsavedChanges,
    isRunning: state.workspaces.assessment.isRunning,
    isDebugging: state.workspaces.assessment.isDebugging,
    enableDebugging: state.workspaces.assessment.enableDebugging,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    storedAssessmentId: state.workspaces.assessment.currentAssessment,
    storedQuestionId: state.workspaces.assessment.currentQuestion
  }
}

const workspaceLocation: WorkspaceLocation = 'assessment'

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment,
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, workspaceLocation),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, changeEvent, workspaceLocation),
      handleClearContext: (library: Library) => beginClearContext(library, workspaceLocation),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange, workspaceLocation),
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleResetWorkspace: (options: Partial<IWorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleSave: submitAnswer,
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges),
      handleUpdateCurrentAssessmentId: updateCurrentAssessmentId,
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation)
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AssessmentWorkspace)
