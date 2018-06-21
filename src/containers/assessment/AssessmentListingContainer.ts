import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessmentOverviews } from '../../actions/session'
import AssessmentListing, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/assessment/AssessmentListing'
import { IAssessmentOverview } from '../../components/assessment/assessmentShape'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  const categoryFilter = (overview: IAssessmentOverview) =>
    overview.category === props.assessmentCategory
  return {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AssessmentListing))
