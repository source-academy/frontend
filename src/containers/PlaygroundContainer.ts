import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import {
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
  generateLzString,
  playgroundExternalSelect,
  updateEditorValue,
  updateReplValue,
  WorkspaceLocation
} from '../actions'
import { ExternalLibraryName } from '../components/assessment/assessmentShape'
import Playground, { IDispatchProps, IStateProps } from '../components/Playground'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  activeTab: state.workspaces.playground.sideContentActiveTab,
  editorWidth: state.workspaces.playground.editorWidth,
  editorValue: state.workspaces.playground.editorValue!,
  isRunning: state.workspaces.playground.isRunning,
  isDebugging: state.workspaces.playground.isDebugging,
  enableDebugging: state.workspaces.playground.enableDebugging,
  output: state.workspaces.playground.output,
  queryString: state.playground.queryString,
  replValue: state.workspaces.playground.replValue,
  sideContentHeight: state.workspaces.playground.sideContentHeight,
  sourceChapter: state.workspaces.playground.context.chapter,
  externalLibraryName: state.workspaces.playground.playgroundExternal
})

const location: WorkspaceLocation = 'playground'

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(location),
      handleBrowseHistoryUp: () => browseReplHistoryUp(location),
      handleChangeActiveTab: (activeTab: number) => changeActiveTab(activeTab, location),
      handleChapterSelect: (chapter: number) => chapterSelect(chapter, location),
      handleEditorEval: () => evalEditor(location),
      handleEditorValueChange: (val: string) => updateEditorValue(val, location),
      handleEditorWidthChange: (widthChange: number) => changeEditorWidth(widthChange, location),
      handleGenerateLz: generateLzString,
      handleInterruptEval: () => beginInterruptExecution(location),
      handleExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, location),
      handleReplEval: () => evalRepl(location),
      handleReplOutputClear: () => clearReplOutput(location),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, location),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, location),
      handleDebuggerPause: () => beginDebuggerPause(location),
      handleDebuggerResume: () => debuggerResume(location),
      handleDebuggerReset: () => debuggerReset(location)
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Playground))
