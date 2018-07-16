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
    gradingCommentsValue: state.workspaces.grading.gradingCommentsValue,
    gradingXP: state.workspaces.grading.gradingXP
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingCommentsChange: updateGradingCommentsValue,
      handleGradingXPChange: updateGradingXP,
      handleGradingInputSave: saveGradingInput
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingEditor)
