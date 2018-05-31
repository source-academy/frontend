import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { handleInterruptExecution } from '../../actions/interpreter'
import { chapterSelect, clearReplOutput, evalEditor, evalRepl } from '../../actions/playground'
import ControlBar, { DispatchProps, StateProps } from '../../components/workspace/ControlBar'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  isRunning: state.playground.isRunning,
  sourceChapter: state.playground.sourceChapter
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChapterSelect: chapterSelect,
      handleEditorEval: evalEditor,
      handleInterruptEval: handleInterruptExecution,
      handleReplEval: evalRepl,
      handleReplOutputClear: clearReplOutput
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ControlBar)
