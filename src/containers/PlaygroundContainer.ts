import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { changeActiveTab, changeEditorWidth, changeSideContentHeight, chapterSelect, clearReplOutput, evalEditor, evalRepl, handleInterruptExecution, updateEditorValue, updateReplValue, WorkspaceLocation } from '../actions';
import Playground, { IDispatchProps, IStateProps } from '../components/Playground'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  editorValue: state.workspaces.playground.editorValue,
  isRunning: state.workspaces.playground.isRunning,
  activeTab: state.workspaces.playground.sideContentActiveTab,
  editorWidth: state.workspaces.playground.editorWidth,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  output: state.workspaces.playground.output,
  replValue: state.workspaces.playground.replValue,
})

const location: WorkspaceLocation = 'playground'

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: any, changeEvent: any) => chapterSelect(chapter, changeEvent, location),
      handleEditorEval: () => evalEditor(location), 
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleInterruptEval: () => handleInterruptExecution(location), 
      handleReplEval: () => evalRepl(location), 
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSideContentHeightChange: (heightChange: number) => changeSideContentHeight(heightChange, location)
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground))
