import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import Profile, { DispatchProps, StateProps } from './Profile';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  name: state.session.user.name,
  role: state.session.courseRegistration.role,
  assessmentTypes: state.session.courseConfiguration.assessmentTypes
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews
    },
    dispatch
  );

const ProfileContainer = connect(mapStateToProps, mapDispatchToProps)(Profile);

export default ProfileContainer;
