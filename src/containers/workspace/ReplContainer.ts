import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { chapterSelect, clearReplOutput, evalRepl, updateReplValue } from '../../actions/playground'
import Repl, { IReplProps } from '../../components/workspace/Repl'
import { IPlaygroundState } from '../../reducers/states'

type StateProps = Pick<IReplProps, 'output'> & Pick<IReplProps, 'replValue'>

type DispatchProps = Pick<IReplProps, 'handleChapterSelect'> &
  Pick<IReplProps, 'handleReplEval'> &
  Pick<IReplProps, 'handleReplOutputClear'> &
  Pick<IReplProps, 'handleReplValueChange'>

const mapStateToProps: MapStateToProps<StateProps, {}, IPlaygroundState> = state => {
  return {
    output: state.output,
    replValue: state.replValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChapterSelect: chapterSelect,
      handleReplEval: evalRepl,
      handleReplOutputClear: clearReplOutput,
      handleReplValueChange: updateReplValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Repl)
