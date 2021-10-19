import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchAssessmentOverviews,
  submitAssessment
} from '../application/actions/SessionActions';
import { OverallState, Role } from '../application/ApplicationTypes';
import Assessment, { DispatchProps, OwnProps, StateProps } from './Assessment';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => ({
  assessmentOverviews: state.session.assessmentOverviews,
  isStudent: state.session.role ? state.session.role === Role.Student : true,
  courseId: state.session.courseId
});
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

const AssessmentContainer = connect(mapStateToProps, mapDispatchToProps)(Assessment);

export default AssessmentContainer;
