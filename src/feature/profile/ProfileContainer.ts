import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews } from './ProfileAction';
import Profile, { IProfileDispatchProps, IProfileStateProps } from './ProfileComponent';
import { IProfileState } from './ProfileReducer';

const mapStateToProps: MapStateToProps<IProfileStateProps, {}, IProfileState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  name: state.session.name,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<IProfileDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
