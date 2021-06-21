import { connect, MapStateToProps } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import Welcome, { StateProps } from './Welcome';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  name: state.session.name
});

const WelcomeContainer = connect(mapStateToProps, null)(Welcome);

export default WelcomeContainer;
