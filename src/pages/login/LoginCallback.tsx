import { Card, Classes, Elevation, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Login.module.scss';

import { parseQuery } from '../../commons/utils/QueryHelper';

const LoginCallback: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();
  const { code, ticket, provider: providerId } = parseQuery(location.search);
  const { t } = useTranslation('login');

  // `code` parameter from OAuth2 redirect, `ticket` from CAS redirect
  const authCode = code || ticket;

  // From SAML redirect to frontend after ACS consumption
  const jwtCookie = Cookies.get(samlRedirectJwtCookieKey);

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    if (authCode) {
      // Fetch JWT tokens and user info from backend when auth provider code is present
      dispatch(SessionActions.fetchAuth(authCode, providerId));
      return;
    }

    if (jwtCookie) {
      Cookies.remove(samlRedirectJwtCookieKey, { domain: window.location.hostname });
      dispatch(SessionActions.handleSamlRedirect(jwtCookie));
      return;
    }

    // No authCode (OAuth, CAS) nor jwt cookie (SAML redirect)
    navigate('/login');
  }, [authCode, isLoggedIn, dispatch, jwtCookie, navigate, providerId]);

  return (
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
  );
};

const samlRedirectJwtCookieKey = 'jwts';

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginCallback;
Component.displayName = 'LoginCallback';

export default LoginCallback;
