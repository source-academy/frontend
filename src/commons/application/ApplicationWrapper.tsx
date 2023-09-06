import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import { getFullAcademyRouterConfig, playgroundOnlyRouterConfig } from '../../routes/routerConfig';
import Constants from '../utils/Constants';
import { useSession } from '../utils/Hooks';
import { updateReactRouter } from './actions/CommonsActions';

/**
 * Application wrapper component which figures out which deployment and set of routes to render.
 *
 * There are 3 main types of deployments as follows:
 * 1. Playground-only (stripped-down backendless version of SA - e.g. https://sourceacademy.org)
 * 2. Full Academy (full SA to be deployed and configured with the backend - e.g. https://sourceacademy.nus.edu.sg)
 * 3. Disabled (disabled SA which only allows `staff` and `admin` accounts to log in - e.g. during examinations)
 */
const ApplicationWrapper: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, role, name, courseId } = useSession();

  const router = useMemo(() => {
    const routerConfig = Constants.playgroundOnly
      ? playgroundOnlyRouterConfig
      : getFullAcademyRouterConfig({
          name,
          role,
          isLoggedIn,
          courseId
        });

    const r = createBrowserRouter(routerConfig);
    dispatch(updateReactRouter(r));

    return r;
  }, [isLoggedIn, role, name, courseId, dispatch]);

  return <RouterProvider router={router} />;
};

export default ApplicationWrapper;
