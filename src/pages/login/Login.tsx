import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useSession } from 'src/commons/utils/Hooks';

function Login() {
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
}

export const Component = Login;

export default Login;
