import { Button, ButtonGroup, Card, Divider, Elevation, H1, H3 } from '@blueprintjs/core';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import Constants from 'src/commons/utils/Constants';
import { useAppDispatch } from 'src/commons/utils/Hooks';

import sourceAcademyLogo from '../assets/SA.jpg';
import classes from './nus_login.module.css';

const nusProviders = [...Constants.nusAuthProviders.entries()].map(([id, { name }]) => ({
  id,
  name,
}));

const NUS_LOGO = '/nus_logo.png';
const BLUE_BG = '/nus_login_background.svg';

function NusLogin() {
  const dispatch = useAppDispatch();
  const handleLogin = useCallback(
    (providerId: string) => dispatch(SessionActions.login(providerId)),
    [dispatch],
  );
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh">
      <div className="col-lg-8 hidden-xs p-0!">
        <img className="inline-block h-full" src={BLUE_BG} alt="nusInfoBackgroundImg" />
      </div>
      <div className="col-xs-12 col-lg-4 p-0!">
        <div className="row m-0!">
          <Card
            className="pt-12 rounded-none shadow-none max-h-30 flex gap-3 w-full justify-center items-center"
            elevation={Elevation.ZERO}
          >
            <a
              className="inline-block h-full"
              href="https://www.nus.edu.sg"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <img className="inline-block h-full" src={NUS_LOGO} alt="NUS" />
            </a>
            <Divider style={{ height: '100%' }} />
            <img className="inline-block h-full" src={sourceAcademyLogo} alt="Source Academy" />
            <H3 style={{ marginBottom: 0 }}>{Constants.sourceAcademyDeploymentName}</H3>
          </Card>
        </div>
        <div className="row m-0!" style={{ height: '100%' }}>
          <Card
            className="text-center rounded-none shadow-none size-full space-y-4"
            elevation={Elevation.ZERO}
          >
            <H1>Login</H1>
            <ButtonGroup size="large" vertical className={classes['buttons-wrapper']}>
              {nusProviders.map(({ id, name }) => (
                <Button intent="primary" key={id} onClick={() => handleLogin(id)}>
                  {name}
                </Button>
              ))}
              {Constants.hasDefaultAuthProviders && (
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
