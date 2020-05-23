import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAuth, login } from '../actions/session';
import Login, { DispatchProps, OwnProps } from '../components/Login';

const mapStateToProps: MapStateToProps<{}, OwnProps, {}> = (_, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAuth: fetchAuth,
      handleLogin: login
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
