import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import { getAcademyRoutes } from 'src/pages/academy/academyRoutes';

import { getFullAcademyRouterConfig, playgroundOnlyRouterConfig } from '../../routes/routerConfig';
import { getHealth } from '../sagas/RequestsSaga';
import Constants from '../utils/Constants';
import { useSession } from '../utils/Hooks';
import { updateReactRouter } from './actions/CommonsActions';

/**
 * Application wrapper component which figures out which deployment and set of routes to render.
 *
 * There are 2 main types of deployments as follows:
 * 1. Playground-only (stripped-down backendless version of SA - e.g. https://sourceacademy.org)
 * 2. Full Academy (full SA to be deployed and configured with the backend - e.g. https://sourceacademy.nus.edu.sg)
 */
const ApplicationWrapper: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, name, courseId } = useSession();
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  useEffect(() => {
    if (Constants.useBackend) {
      getHealth().then(res => setIsApiHealthy(!!res));
    }
  }, []);

  const academyRoutes = useMemo(() => getAcademyRoutes(), []);

  const router = useMemo(() => {
    const routerConfig = Constants.playgroundOnly
      ? playgroundOnlyRouterConfig
      : getFullAcademyRouterConfig({ name, isLoggedIn, courseId, academyRoutes });

    const r = createBrowserRouter(routerConfig, {
      future: { v7_relativeSplatPath: true }
    });
    dispatch(updateReactRouter(r));

    return r;
  }, [name, isLoggedIn, courseId, academyRoutes, dispatch]);

  if (!isApiHealthy) {
    return (
      <div className={classNames('NoPage', Classes.DARK)}>
        <NonIdealState
          icon={IconNames.WRENCH}
          title="Under maintenance"
          description="The Source Academy is currently undergoing maintenance. Please try again later."
        />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

export default ApplicationWrapper;
