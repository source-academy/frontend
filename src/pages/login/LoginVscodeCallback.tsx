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
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { useSession } from 'src/commons/utils/Hooks';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import classes from 'src/styles/Login.module.scss';

const LoginVscodeCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation('login');
  const { isLoggedIn } = useSession();
  const { code, ticket, provider: providerId } = parseQuery(location.search);
  const isVscode = useTypedSelector(state => state.vscode.isVscode);
  const { access_token: accessToken, refresh_token: refreshToken } = parseQuery(location.search);

  // `code` parameter from OAuth2 redirect, `ticket` from CAS redirect (CAS untested for VS Code)
  const authCode = code || ticket;

  const launchVscode = () => {
    window.location.href = `vscode://source-academy.source-academy/sso?code=${authCode}&provider=${providerId}`;
  };

  useEffect(() => {
    if (authCode) {
      if (!isVscode) {
        launchVscode();
      } else {
        if (isLoggedIn) {
          return;
        }
        // Fetch JWT tokens and user info from backend when auth provider code is present
        dispatch(SessionActions.fetchAuth(authCode, providerId));
      }
    }

    if (accessToken && refreshToken) {
      dispatch(
        SessionActions.setTokens({
          accessToken: accessToken,
          refreshToken: refreshToken
        })
      );
      dispatch(SessionActions.fetchUserAndCourse());
      navigate('/welcome');
    }
  }, [isVscode]);

  return isVscode ? (
    <div className={classNames(classes['Login'], Classes.DARK)}>
      <Card elevation={Elevation.FOUR}>
        <div>
          <NonIdealState
            description={t('Logging In')}
            icon={<Spinner size={SpinnerSize.LARGE} />}
          />
        </div>
      </Card>
    </div>
  ) : (
    <div className={classNames(classes['Login'], Classes.DARK)}>
      <Card elevation={Elevation.FOUR}>
        <div>
          <div className={classes['login-header']}>
            <H4>
              <Icon className={classes['login-icon']} icon={IconNames.LOG_IN} />
              Sign in with SSO
            </H4>
          </div>
          <p>
            Click <b>Open link</b> on the dialog shown by your browser.
          </p>
          <p>If you don't see a dialog, click the button below.</p>
          <div>
            <ButtonGroup fill={true}>
              <Button onClick={launchVscode} className={Classes.LARGE}>
                Launch VS Code extension
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginVscodeCallback;
Component.displayName = 'LoginVscodeCallback';

export default LoginVscodeCallback;
