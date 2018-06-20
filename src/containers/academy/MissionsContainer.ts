import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchAssessmentOverviews } from '../../actions/session'
import AssessmentListing, { DispatchProps, StateProps } from '../../components/assessment/AssessmentListing'
import {
  AssessmentCategories,
  IAssessmentOverview
} from '../../components/assessment/assessmentShape'
import { IState } from '../../reducers/states'

const isMission = (x: IAssessmentOverview) => x.category === AssessmentCategories.MISSION

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(isMission)
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
