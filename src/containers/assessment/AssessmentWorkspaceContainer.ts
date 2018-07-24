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
  submitAnswer,
  updateEditorValue,
  updateReplValue
} from '../../actions'
import {
  resetWorkspace,
  updateCurrentAssessmentId,
  WorkspaceLocation
} from '../../actions/workspaces'
import { ExternalLibraryName } from '../../components/assessment/assessmentShape'
import AssessmentWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/assessment/AssessmentWorkspace'
import { IState, IWorkspaceState } from '../../reducers/states'

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
      handleClearContext: (
        chapter: number,
        externals: string[],
        externalLibraryName: ExternalLibraryName
      ) => clearContext(chapter, externals, externalLibraryName, workspaceLocation),
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
      handleUpdateCurrentAssessmentId: updateCurrentAssessmentId
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(AssessmentWorkspace)
