import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  H4,
  Icon,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useSession } from 'src/commons/utils/Hooks';

import { fetchAuth, login } from '../../commons/application/actions/SessionActions';
import Constants from '../../commons/utils/Constants';
import { parseQuery } from '../../commons/utils/QueryHelper';

const providers = [...Constants.authProviders.entries()].map(([id, { name }]) => ({
  id,
  name
}));

const Login: React.FunctionComponent<{}> = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn, courseId } = useSession();
  const navigate = useNavigate();
  const { code, ticket, provider: providerId } = parseQuery(location.search);

  // `code` parameter from OAuth2 redirect, `ticket` from CAS redirect
  const authCode = code || ticket;

  const handleLogin = React.useCallback(
    (providerId: string) => dispatch(login(providerId)),
    [dispatch]
  );

  React.useEffect(() => {
    // If already logged in, navigate to relevant course page
    if (isLoggedIn) {
      if (courseId !== undefined) {
        navigate(`/courses/${courseId}`);
      } else {
        navigate('/welcome');
      }
      return;
    }

    // Else fetch JWT tokens and user info from backend when auth provider code is present
    if (authCode && !isLoggedIn) {
      dispatch(fetchAuth(authCode, providerId));
    }
  }, [authCode, providerId, dispatch, courseId, navigate, isLoggedIn]);

  if (authCode) {
    return (
      <div className={classNames('Login', Classes.DARK)}>
        <Card className={classNames('login-card', Classes.ELEVATION_4)}>
          <div className="login-body">
            <NonIdealState
              description="Logging In..."
              icon={<Spinner size={SpinnerSize.LARGE} />}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={classNames('Login', Classes.DARK)}>
      <Card className={classNames('login-card', Classes.ELEVATION_4)}>
        <div className="login-header">
          <H4>
            <Icon icon={IconNames.LOCK} />
            LOGIN
          </H4>
        </div>
        <div className="login-body">
          <ButtonGroup fill={true} vertical={true}>
            {providers.map(({ id, name }) => (
              <LoginButton handleClick={handleLogin} name={name} id={id} key={id} />
            ))}
          </ButtonGroup>
        </div>
      </Card>
    </div>
  );
};

const LoginButton = ({
  handleClick,
  id,
  name
}: {
  handleClick: (id: string) => void;
  id: string;
  name: string;
}) => {
  return (
    <Button
      className={Classes.LARGE}
      rightIcon={IconNames.LOG_IN}
      onClick={React.useCallback(() => handleClick(id), [handleClick, id])}
    >
      {`Log in with ${name}`}
    </Button>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Login;
Component.displayName = 'Login';

export default Login;
