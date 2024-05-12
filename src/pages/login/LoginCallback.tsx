import { Card, Classes, Elevation, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Login.module.scss';

import { parseQuery } from '../../commons/utils/QueryHelper';

const LoginCallback: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn } = useSession();
  const { code, ticket, provider: providerId } = parseQuery(location.search);
  const { t } = useTranslation('login');

  // `code` parameter from OAuth2 redirect, `ticket` from CAS redirect
  const authCode = code || ticket;

  useEffect(() => {
    // Fetch JWT tokens and user info from backend when auth provider code is present
    // SAML does not require code, as relay is handled in backend
    if (authCode && !isLoggedIn) {
      dispatch(SessionActions.fetchAuth(authCode, providerId));
    }
  }, [authCode, isLoggedIn, dispatch]);

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

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginCallback;
Component.displayName = 'LoginCallback';

export default LoginCallback;
