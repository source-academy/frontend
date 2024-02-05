import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Elevation,
  H4,
  Icon,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { AuthProviderType } from 'src/commons/utils/AuthHelper';
import { useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Login.module.scss';

import { fetchAuth, login } from '../../commons/application/actions/SessionActions';
import Constants from '../../commons/utils/Constants';
import { parseQuery } from '../../commons/utils/QueryHelper';

const providers = [...Constants.authProviders.entries()].map(([id, { name }]) => ({
  id,
  name
}));

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn, courseId } = useSession();
  const navigate = useNavigate();
  const { code, ticket, provider: providerId } = parseQuery(location.search);

  // `code` parameter from OAuth2 redirect, `ticket` from CAS redirect
  const authCode = code || ticket;

  const handleLogin = useCallback((providerId: string) => dispatch(login(providerId)), [dispatch]);

  const isSaml = Constants.authProviders.get(providerId)?.type === AuthProviderType.SAML_SSO;

  useEffect(() => {
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
    // SAML does not require code, as relay is handled in backend
    if ((authCode || isSaml) && !isLoggedIn) {
      dispatch(fetchAuth(authCode, providerId));
    }
  }, [authCode, isSaml, providerId, dispatch, courseId, navigate, isLoggedIn]);

  if (authCode || isSaml) {
    return (
      <div className={classNames(classes['Login'], Classes.DARK)}>
        <Card elevation={Elevation.FOUR}>
          <div>
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
    <div className={classNames(classes['Login'], Classes.DARK)}>
      <Card elevation={Elevation.FOUR}>
        <div className={classes['login-header']}>
          <H4>
            <Icon className={classes['login-icon']} icon={IconNames.LOCK} />
            LOGIN
          </H4>
        </div>
        <div>
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
      onClick={useCallback(() => handleClick(id), [handleClick, id])}
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
