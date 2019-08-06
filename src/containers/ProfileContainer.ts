import { connect, MapStateToProps } from 'react-redux';

import Profile, { StateProps } from '../components/dropdown/Profile';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  assessmentOverviews: state.session.assessmentOverviews,
  name: state.session.name,
  role: state.session.role
});

export default connect(
  mapStateToProps
)(Profile);
