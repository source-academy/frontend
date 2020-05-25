import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Refactor
import { fetchAuth, login } from 'src/commons/actions/SessionActions';
import Login, { DispatchProps, OwnProps } from './LoginComponent';

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
