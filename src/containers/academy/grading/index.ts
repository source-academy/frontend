import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchGradingOverviews, fetchGradingOverviewsForGroup } from '../../../actions/session'
import Grading, { IDispatchProps, IStateProps } from '../../../components/academy/grading'
import { IState } from '../../../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews
})

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleFetchGradingOverviewsForGroup: fetchGradingOverviewsForGroup
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Grading)
