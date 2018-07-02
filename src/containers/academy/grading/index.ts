import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchGradingOverviews } from '../../../actions/session'
import Grading, { DispatchProps, StateProps } from '../../../components/academy/grading'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Grading)
