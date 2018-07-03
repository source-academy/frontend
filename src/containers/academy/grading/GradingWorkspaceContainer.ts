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
  // TODO fetchSubmission,
  handleInterruptExecution,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../../../actions'
import GradingWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../../components/grading/'
import { IState } from '../../reducers/states'

/**
 * Grading will use the assessment slice of IWorkspaceManagerState, as there is no reason to be
 * grading and doing an assessment at the same time. This also saves the creation of one Context,
 * that is the most bulky part of the IWorkspaceState.
 */
const location: WorkspaceLocation = 'assessment'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    // TODO add to state for fetching.  submission: state.session.submissions.get(props.submissionId),
    editorValue: state.workspaces.assessment.editorValue,
    isRunning: state.workspaces.assessment.isRunning,
    activeTab: state.workspaces.assessment.sideContentActiveTab,
    editorWidth: state.workspaces.assessment.editorWidth,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      // TODO handleSubmissionFetch: fetchSubmission,
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

export default connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace)
