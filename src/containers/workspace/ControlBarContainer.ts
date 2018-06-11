import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { handleInterruptExecution } from '../../actions/interpreter'
import {
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  generateLzString
} from '../../actions/playground'
import ControlBar, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/workspace/ControlBar'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => ({
  ...props,
  isRunning: state.playground.isRunning,
  queryString: state.playground.queryString,
  sourceChapter: state.playground.sourceChapter
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChapterSelect: chapterSelect,
      handleEditorEval: evalEditor,
      handleGenerateLz: generateLzString,
      handleInterruptEval: handleInterruptExecution,
      handleReplEval: evalRepl,
      handleReplOutputClear: clearReplOutput
    },
    dispatch
  )

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(
  ControlBar
)
