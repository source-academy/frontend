import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeActiveTab,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearContext,
  clearReplOutput,
  evalEditor,
  evalRepl,
  fetchAssessment,
  updateEditorValue,
  updateReplValue
} from '../../actions'
import {
  resetAssessmentWorkspace,
  updateCurrentAssessmentId,
  WorkspaceLocation
} from '../../actions/workspaces'
import AssessmentWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/assessment/AssessmentWorkspace'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    assessment: state.session.assessments.get(props.assessmentId),
    editorValue: state.workspaces.assessment.editorValue,
    isRunning: state.workspaces.assessment.context.runtime.isRunning,
    activeTab: state.workspaces.assessment.sideContentActiveTab,
    editorWidth: state.workspaces.assessment.editorWidth,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    storedAssessmentId: state.workspaces.currentAssessment,
    storedQuestionId: state.workspaces.currentQuestion
  }
}

const location: WorkspaceLocation = 'assessment'

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment,
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, changeEvent, location),
      handleClearContext: (chapter: number, externals: string[]) =>
        clearContext(chapter, externals, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleInterruptEval: () => beginInterruptExecution(location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleResetAssessmentWorkspace: resetAssessmentWorkspace,
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleUpdateCurrentAssessmentId: updateCurrentAssessmentId
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AssessmentWorkspace)
