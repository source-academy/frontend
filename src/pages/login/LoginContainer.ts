import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAuth, login } from '../../commons/application/actions/SessionActions';
import Login, { DispatchProps, OwnProps } from './Login';

const mapStateToProps: MapStateToProps<{}, OwnProps, {}> = (_, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAuth: fetchAuth,
      handleLogin: login
    },
    dispatch
  );

const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login);

export default LoginContainer;
