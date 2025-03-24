import { Card, Classes, Elevation, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import classes from 'src/styles/Login.module.scss';

const LoginVscodeCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { t } = useTranslation('login');

  const { access_token: accessToken, refresh_token: refreshToken } = parseQuery(location.search);

  useEffect(() => {
    if (accessToken && refreshToken) {
      dispatch(
        SessionActions.setTokens({
          accessToken: accessToken,
          refreshToken: refreshToken
        })
      );
      dispatch(SessionActions.fetchUserAndCourse());
      navigate(`/welcome`);
    }
  }, []);

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
export const Component = LoginVscodeCallback;
Component.displayName = 'Login';

export default LoginVscodeCallback;
