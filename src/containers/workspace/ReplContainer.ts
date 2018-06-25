import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalRepl, updateReplValue } from '../../actions/workspace'
import Repl, { IReplProps } from '../../components/workspace/Repl'
import { IState } from '../../reducers/states'

type StateProps = Pick<IReplProps, 'output'> & Pick<IReplProps, 'replValue'>
type DispatchProps = Pick<IReplProps, 'handleReplValueChange'> & Pick<IReplProps, 'handleReplEval'>

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
      handleReplValueChange: updateReplValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Repl)
