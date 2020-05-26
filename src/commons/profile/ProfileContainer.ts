import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews } from 'src/commons/application/actions/SessionActions';
import { IState } from 'src/commons/types/ApplicationTypes';
import Profile, { DispatchProps, StateProps } from './ProfileComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  name: state.session.name,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
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
