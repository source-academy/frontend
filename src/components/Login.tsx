import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  H4,
  Icon,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

type LoginProps = DispatchProps & OwnProps;

export type DispatchProps = {
  handleFetchAuth: (luminusCode: string) => void;
  handleLogin: () => void;
};

export type OwnProps = {
  luminusCode?: string;
};

const Login: React.SFC<LoginProps> = props => {
  if (props.luminusCode) {
    startFetchAuth(props.luminusCode, props.handleFetchAuth);
    return (
      <div className={classNames('Login', Classes.DARK)}>
        <Card className={classNames('login-card', Classes.ELEVATION_4)}>
          <div className="login-body">
            <NonIdealState
              description="Logging In..."
              icon={<Spinner size={Spinner.SIZE_LARGE} />}
            />
          </div>
        </Card>
      </div>
    );
  } else {
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
              {loginButton(props.handleLogin)}
              {playgroundButton}
            </ButtonGroup>
          </div>
        </Card>
      </div>
    );
  }
};

const startFetchAuth = (luminusCode: string, handleFetchAuth: DispatchProps['handleFetchAuth']) =>
  handleFetchAuth(luminusCode);

const loginButton = (handleClick: () => void) => (
  <Button className={Classes.LARGE} rightIcon={IconNames.LOG_IN} onClick={handleClick}>
    Log in with LumiNUS
  </Button>
);

const playgroundButton = (
  <NavLink to="/playground">
    <Button className={Classes.LARGE} rightIcon={IconNames.CODE}>
      Try out the playground
    </Button>
  </NavLink>
);

export default Login;
