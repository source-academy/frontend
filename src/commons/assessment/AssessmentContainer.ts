import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchAssessmentOverviews,
  submitAssessment
} from '../application/actions/SessionActions';
import { OverallState, Role } from '../application/ApplicationTypes';
import Assessment, { DispatchProps, OwnProps, StateProps } from './Assessment';
import { AssessmentOverview } from './AssessmentTypes';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  const categoryFilter = (overview: AssessmentOverview) =>
    overview.type === props.assessmentConfiguration.type;
  const stateProps: StateProps = {
    assessmentOverviews: state.session.assessmentOverviews
      ? state.session.assessmentOverviews.filter(categoryFilter)
      : undefined,
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

const AssessmentContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Assessment));

export default AssessmentContainer;
