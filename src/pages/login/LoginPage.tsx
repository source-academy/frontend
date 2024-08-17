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

const providers = [...Constants.otherAuthProviders.entries()].map(([id, { name }]) => ({
  id,
  name
}));

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
            {Constants.hasNusAuthProviders && (
              <LoginButton
                handleClick={() => navigate('/nus_login')}
                name="NUS"
                id="nus"
                key="nus"
              />
            )}
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
      <Translation ns="login">{t => t('Log in with', { name: name })}</Translation>
    </Button>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginPage;
Component.displayName = 'LoginPage';

export default LoginPage;
