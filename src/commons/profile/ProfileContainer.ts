import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews, fetchTotalXp } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import Profile, { DispatchProps, StateProps } from './Profile';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  name: state.session.name,
  role: state.session.role,
  xp: state.session.xp,
  assessmentConfigurations: state.session.assessmentConfigurations,
  courseId: state.session.courseId
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleTotalXpFetch: fetchTotalXp
    },
    dispatch
  );

const ProfileContainer = connect(mapStateToProps, mapDispatchToProps)(Profile);

export default ProfileContainer;
