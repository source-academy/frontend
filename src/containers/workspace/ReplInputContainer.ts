import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { evalRepl, updateReplValue } from '../../actions/playground'
import ReplInput, { IReplInputProps } from '../../components/workspace/ReplInput'
import { IState } from '../../reducers/states'

type StateProps = Pick<IReplInputProps, 'replValue'>
type DispatchProps = Pick<IReplInputProps, 'handleReplEval'> &
  Pick<IReplInputProps, 'handleReplChange'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    replValue: state.playground.replValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleReplChange: updateReplValue,
      handleReplEval: evalRepl
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ReplInput)
