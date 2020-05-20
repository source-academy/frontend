import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Refactor
import { fetchAuth, login } from '../../actions/session';
import Login, { DispatchProps, OwnProps } from './LoginComponent';

const mapStateToProps: MapStateToProps<{}, OwnProps, {}> = (_, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
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
