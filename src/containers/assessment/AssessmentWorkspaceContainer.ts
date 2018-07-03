import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  changeActiveTab,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  fetchAssessment,
  handleInterruptExecution,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../actions'
import AssessmentWorkspace, { DispatchProps, OwnProps, StateProps } from '../../components/assessment/AssessmentWorkspace'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    assessment: state.session.assessments.get(props.assessmentId),
    editorValue: state.workspaces.assessment.editorValue,
    isRunning: state.workspaces.assessment.isRunning,
    activeTab: state.workspaces.assessment.sideContentActiveTab,
    editorWidth: state.workspaces.assessment.editorWidth,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue
  }
}

const location: WorkspaceLocation = 'assessment'

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment,
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, changeEvent, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleInterruptEval: () => handleInterruptExecution(location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location)
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AssessmentWorkspace)
