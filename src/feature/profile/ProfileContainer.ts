import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { fetchAssessmentOverviews } from '../../actions/session';
import Profile, { IProfileDispatchProps, IProfileStateProps } from './ProfileComponent';
import { IState } from '../../reducers/states'; 

const mapStateToProps: MapStateToProps<IProfileStateProps, {}, IState> = state => ({
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
