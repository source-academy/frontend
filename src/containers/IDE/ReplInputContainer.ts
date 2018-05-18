import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import ReplInput, { IReplInputProps } from '../../components/IDE/ReplInput'
import { IState } from '../../reducers/states'

type StateProps = Pick<IReplInputProps, 'replValue'>
type DispatchProps = Pick<IReplInputProps, 'handleEvalReplInput'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    replValue: state.playground.replValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalReplInput: (newCode: string) => {} // TODO: fill in
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ReplInput)
