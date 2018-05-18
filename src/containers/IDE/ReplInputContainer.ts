import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { default as ReplInput, IInputProps } from '../../components/IDE/ReplInput'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<{}, {}, IState> = state => {
  return {}
}

const mapDispatchToProps: MapDispatchToProps<IInputProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleEvalReplInput: (newCode: string) => {} // TODO: fill in
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(ReplInput)
