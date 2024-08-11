import { Button, ButtonGroup, Card, Classes, Elevation, H4, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback } from 'react';
import { Translation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import classes from 'src/styles/Login.module.scss';

import Constants from '../../commons/utils/Constants';

const providers = [...Constants.authProviders.entries()]
  .map(([id, { name }]) => ({
    id,
    name
  }))
  .filter(e => !e.name.includes('NUS'));
const hasNusProvider = [...Constants.authProviders.values()].some(({ name }) =>
  name.includes('NUS')
);

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const handleLogin = useCallback(
    (providerId: string) => dispatch(SessionActions.login(providerId)),
    [dispatch]
  );
  const navigate = useNavigate();

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
            {hasNusProvider && (
              <LoginButton
                handleClick={() => navigate('/login/nus')}
                rawname="Log in for NUS users"
                id="nus"
                key="nus"
              />
            )}
          </ButtonGroup>
        </div>
      </Card>
    </div>
  );
};

const LoginButton = ({
  handleClick,
  id,
  name,
  rawname
}: {
  handleClick: (id: string) => void;
  id: string;
  name?: string;
  rawname?: string;
}) => {
  return (
    <Button
      className={Classes.LARGE}
      rightIcon={IconNames.LOG_IN}
      onClick={useCallback(() => handleClick(id), [handleClick, id])}
    >
      {rawname ?? <Translation ns="login">{t => t('Log in with', { name: name })}</Translation>}
    </Button>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginPage;
Component.displayName = 'LoginPage';

export default LoginPage;
