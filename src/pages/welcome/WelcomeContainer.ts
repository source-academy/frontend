import { connect, MapDispatchToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import Welcome, { DispatchProps } from './Welcome';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {

    }, dispatch
  );

const WelcomeContainer = withRouter(connect(null, mapDispatchToProps)(Welcome));

export default WelcomeContainer;
