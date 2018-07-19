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
  clearReplOutput,
  evalEditor,
  evalRepl,
  fetchGrading,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../../actions'
import {
  clearContext,
  resetWorkspace,
  updateCurrentSubmissionId
} from '../../../actions/workspaces'
import GradingWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../../components/academy/grading/GradingWorkspace'
import { ExternalLibraryName } from '../../../reducers/externalLibraries'
import { IState } from '../../../reducers/states'

const workspaceLocation: WorkspaceLocation = 'grading'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    grading: state.session.gradings.get(props.submissionId),
    editorValue: state.workspaces.grading.editorValue,
    isRunning: state.workspaces.grading.context.runtime.isRunning,
    activeTab: state.workspaces.grading.sideContentActiveTab,
    editorWidth: state.workspaces.grading.editorWidth,
    sideContentHeight: state.workspaces.grading.sideContentHeight,
    output: state.workspaces.grading.output,
    replValue: state.workspaces.grading.replValue,
    storedSubmissionId: state.workspaces.grading.currentSubmission,
    storedQuestionId: state.workspaces.grading.currentQuestion
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, workspaceLocation),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, changeEvent, workspaceLocation),
      handleClearContext: (chapter: number, externals: string[], externalLibraryName: ExternalLibraryName) =>
        clearContext(chapter, externals, externalLibraryName, workspaceLocation),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange, workspaceLocation),
      handleGradingFetch: fetchGrading,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleResetWorkspace: () => resetWorkspace(workspaceLocation),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleUpdateCurrentSubmissionId: updateCurrentSubmissionId
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace)
