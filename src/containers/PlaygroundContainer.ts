import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { changeActiveTab, changeEditorWidth, changeSideContentHeight, chapterSelect, clearReplOutput, evalEditor, evalRepl, handleInterruptExecution, updateEditorValue, updateReplValue, WorkspaceLocations } from '../actions';
import Playground, { IDispatchProps, IStateProps } from '../components/Playground'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  editorValue: state.workspaces.playground.editorValue,
  isRunning: state.workspaces.playground.isRunning,
  activeTab: state.workspaces.playground.sideContentActiveTab,
  editorWidth: state.workspaces.playground.editorWidth,
  output: state.workspaces.playground.output,
  replValue: state.workspaces.playground.replValue,
})

const withLocation = (f: (...args: any[]) => void) => 
  (...args: any[]) => f(...args, WorkspaceLocations.PLAYGROUND)

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEditorValueChange: () => withLocation(updateEditorValue),
      handleChapterSelect: withLocation(chapterSelect),
      handleEditorEval: withLocation(evalEditor), 
      handleReplEval: withLocation(evalRepl), 
      handleReplOutputClear: withLocation(clearReplOutput),
      handleInterruptEval: withLocation(handleInterruptExecution), 
      handleEditorWidthChange: withLocation(changeEditorWidth), 
      handleSideContentHeightChange: withLocation(changeSideContentHeight),
      handleReplValueChange: withLocation(updateReplValue),
      handleChangeActiveTab: withLocation(changeActiveTab)
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground))
