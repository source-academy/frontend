import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { clearReplOutput, evalRepl, updateReplValue } from '../../actions/playground'
import Repl, { IReplProps } from '../../components/workspace/Repl'
import { IState } from '../../reducers/states'

type StateProps = Pick<IReplProps, 'output'> & Pick<IReplProps, 'replValue'>

type DispatchProps = Pick<IReplProps, 'handleReplEval'> &
  Pick<IReplProps, 'handleReplOutputClear'> &
  Pick<IReplProps, 'handleReplValueChange'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    output: state.playground.output,
    replValue: state.playground.replValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleReplEval: evalRepl,
      handleReplOutputClear: clearReplOutput,
      handleReplValueChange: updateReplValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Repl)
