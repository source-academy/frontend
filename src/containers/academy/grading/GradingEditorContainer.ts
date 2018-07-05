import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
  updateGradingCommentsValue,
} from '../../../actions'
import GradingEditor, {
  DispatchProps,
  StateProps
} from '../../../components/academy/grading/GradingEditor'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = (state) => {
  return {
    gradingCommentsValue: state.session.gradingCommentsValue
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingCommentsChange: updateGradingCommentsValue
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingEditor)
