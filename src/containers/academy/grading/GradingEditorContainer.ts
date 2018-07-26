import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { saveGradingInput, updateGradingCommentsValue, updateGradingXP } from '../../../actions'
import GradingEditor, {
  DispatchProps,
  StateProps
} from '../../../components/academy/grading/GradingEditor'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    comments: state.workspaces.grading.gradingCommentsValue,
    adjustment: state.workspaces.grading.gradingXP
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleCommentsChange: updateGradingCommentsValue,
      handleGradeAdjustmentChange: updateGradingXP,
      handleGradingInputSave: saveGradingInput
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingEditor)
