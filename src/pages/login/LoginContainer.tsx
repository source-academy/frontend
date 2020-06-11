import * as React from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchAuth, login } from '../../commons/application/actions/SessionActions';
import Login, { OwnProps } from './Login';

const LoginContainer: React.FunctionComponent<OwnProps> = props => {
  const dispatch = useDispatch();
  const dispatchProps = React.useMemo(
    () =>
      bindActionCreators(
        {
          handleFetchAuth: fetchAuth,
          handleLogin: login
        },
        dispatch
      ),
    [dispatch]
  );

  return <Login {...dispatchProps} {...props} />;
};

export default LoginContainer;
