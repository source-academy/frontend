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
import { useLocation } from 'react-router';

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
  const { code, provider: providerId } = parseQuery(location.search);

  const handleLogin = React.useCallback(providerId => dispatch(login(providerId)), [dispatch]);

  React.useEffect(() => {
    if (code) {
      dispatch(fetchAuth(code, providerId));
    }
  }, [code, providerId, dispatch]);

  if (code) {
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

export default Login;
