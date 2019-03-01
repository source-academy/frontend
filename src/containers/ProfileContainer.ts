import { connect, MapStateToProps } from 'react-redux';

import Profile, { StateProps } from '../components/dropdown/Profile';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  grade: state.session.grade,
  maxGrade: state.session.maxGrade,
  maxXp: state.session.maxXp,
  name: state.session.name,
  role: state.session.role,
  xp: state.session.xp
});

export default connect(mapStateToProps)(Profile);
