import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { parseQuery } from 'src/commons/utils/QueryHelper';

const LoginVscodeCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

  return <> </>;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = LoginVscodeCallback;
Component.displayName = 'Login';

export default LoginVscodeCallback;
