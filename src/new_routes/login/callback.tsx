import { Card, Classes, Elevation, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { useAppDispatch, useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Login.module.scss';

import { parseQuery } from '../../commons/utils/QueryHelper';

function LoginCallback() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();
  const { code, provider: providerId } = parseQuery(location.search);

  // `code` parameter from OAuth2 redirect
  const authCode = code;

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    if (authCode) {
      // Fetch JWT tokens and user info from backend when auth provider code is present
      dispatch(SessionActions.fetchAuth(authCode, providerId));
      return;
    }

    // No authCode (OAuth)
    navigate('/login');
  }, [authCode, isLoggedIn, dispatch, navigate, providerId]);

  return (
    <div className={classNames(classes['Login'], Classes.DARK)}>
      <Card elevation={Elevation.FOUR}>
        <div>
          <NonIdealState
            description={'Logging In...'}
            icon={<Spinner size={SpinnerSize.LARGE} />}
          />
        </div>
      </Card>
    </div>
  );
}

export const Component = LoginCallback;
