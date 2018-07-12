import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessmentOverviews } from '../../actions/session'
import Assessment, { IDispatchProps, IOwnProps, IStateProps } from '../../components/assessment'
import { IAssessmentOverview } from '../../components/assessment/assessmentShape'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, IOwnProps, IState> = (state, props) => {
  const categoryFilter = (overview: IAssessmentOverview) =>
    overview.category === props.assessmentCategory
  const stateProps: IStateProps = {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined
  }
  return stateProps
}

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Assessment))
