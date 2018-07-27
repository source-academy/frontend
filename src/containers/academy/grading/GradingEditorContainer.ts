import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { submitGrading } from '../../../actions'
import GradingEditor, {
  DispatchProps
} from '../../../components/academy/grading/GradingEditor'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingSave: submitGrading
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(GradingEditor)
