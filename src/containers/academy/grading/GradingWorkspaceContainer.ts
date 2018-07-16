import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  beginInterruptExecution,
  changeActiveTab,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  fetchGrading,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../../actions'
import { clearContext, resetAssessmentWorkspace, updateCurrentSubmissionId } from '../../../actions/workspaces'
import GradingWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../../components/academy/grading/GradingWorkspace'
import { IState } from '../../../reducers/states'

/**
 * Grading will use the assessment slice of IWorkspaceManagerState, as there is no reason to be
 * grading and doing an assessment at the same time. This also saves the creation of one Context,
 * that is the most bulky part of the IWorkspaceState.
 */
const location: WorkspaceLocation = 'assessment'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    grading: state.session.gradings.get(props.submissionId),
    editorValue: state.workspaces.assessment.editorValue,
    isRunning: state.workspaces.assessment.context.runtime.isRunning,
    activeTab: state.workspaces.assessment.sideContentActiveTab,
    editorWidth: state.workspaces.assessment.editorWidth,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    storedSubmissionId: state.workspaces.currentSubmission,
    storedQuestionId: state.workspaces.currentQuestion
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingFetch: fetchGrading,
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, changeEvent, location),
      handleClearContext: (chapter: number, externals: string[]) => clearContext(chapter, externals, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleInterruptEval: () => beginInterruptExecution(location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleUpdateCurrentSubmissionId: updateCurrentSubmissionId,
      handleResetAssessmentWorkspace: resetAssessmentWorkspace
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace)
