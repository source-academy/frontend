import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useSession } from 'src/commons/utils/Hooks';

const Login: React.FC = () => {
  const { isLoggedIn, courseId } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, navigate to relevant course page
    if (isLoggedIn) {
      if (courseId !== undefined) {
        navigate(`/courses/${courseId}`);
      } else {
        navigate('/welcome');
      }
    }
  }, [courseId, navigate, isLoggedIn]);

  return <Outlet />;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Login;
Component.displayName = 'Login';

export default Login;
