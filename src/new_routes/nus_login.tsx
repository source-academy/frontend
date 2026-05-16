import { Button, ButtonGroup, Card, Divider, Elevation, H1, H3 } from '@blueprintjs/core';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import Constants from 'src/commons/utils/Constants';

import sourceAcademyLogo from '../assets/SA.jpg';
import classes from './nus_login.module.scss';

const nusProviders = [...Constants.nusAuthProviders.entries()].map(([id, { name }]) => ({
  id,
  name,
}));

const NUS_LOGO = '/nus_logo.png';
const BLUE_BG = '/nus_login_bg.svg';

function NusLogin() {
  const dispatch = useDispatch();
  const handleLogin = useCallback(
    (providerId: string) => dispatch(SessionActions.login(providerId)),
    [dispatch],
  );
  const navigate = useNavigate();

  return (
    <div className={classes['container']}>
      <div className={classNames('col-lg-8', 'hidden-xs', classes['unpadded'])}>
        <img className={classes['logo']} src={BLUE_BG} alt="nusInfoBackgroundImg" />
      </div>
      <div className={classNames('col-xs-12 col-lg-4', classes['unpadded'])}>
        <div className={classNames('row', classes['row'])}>
          <Card className={classes['header']} elevation={Elevation.ZERO}>
            <a
              className={classes['logo']}
              href="https://www.nus.edu.sg"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <img className={classes['logo']} src={NUS_LOGO} alt="NUS" />
            </a>
            <Divider style={{ height: '100%' }} />
            <img className={classes['logo']} src={sourceAcademyLogo} alt="Source Academy" />
            <H3 style={{ marginBottom: 0 }}>{Constants.sourceAcademyDeploymentName}</H3>
          </Card>
        </div>
        <div className={classNames('row', classes['row'])} style={{ height: '100%' }}>
          <Card
            className={classNames(classes['text-center'], classes['body'])}
            elevation={Elevation.ZERO}
          >
            <H1>Login</H1>
            <ButtonGroup size="large" vertical className={classes['buttons-wrapper']}>
              {nusProviders.map(({ id, name }) => (
                <Button intent="primary" key={id} onClick={() => handleLogin(id)}>
                  {name}
                </Button>
              ))}
              {Constants.hasOtherAuthProviders && (
                <Button
                  intent="primary"
                  variant="outlined"
                  className={classes['outlined']}
                  onClick={() => navigate('/login')}
                >
                  Non-NUS Users
                </Button>
              )}
            </ButtonGroup>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const Component = NusLogin;
