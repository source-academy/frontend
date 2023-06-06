import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import {
  getDisabledRouterConfig,
  getFullAcademyRouterConfig,
  playgroundOnlyRouterConfig
} from '../../routes/routerConfig';
import Constants from '../utils/Constants';
import { useTypedSelector } from '../utils/Hooks';
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
  const session = useTypedSelector(state => state.session);
  const { role, name, courseId } = session;

  // Used in determining the disabled state of any type of Source Academy deployment (e.g. during exams)
  const intervalId = useRef<number | undefined>(undefined);
  const [isDisabled, setIsDisabled] = useState(computeDisabledState());

  useEffect(() => {
    if (Constants.disablePeriods.length > 0) {
      intervalId.current = window.setInterval(() => {
        const disabled = computeDisabledState();
        if (isDisabled !== disabled) {
          setIsDisabled(disabled);
        }
      }, 5000);
    }

    return () => {
      if (intervalId.current) {
        window.clearInterval(intervalId.current);
      }
    };
  }, [isDisabled]);

  const router = useMemo(() => {
    const isLoggedIn = typeof name === 'string';
    const isDisabledEffective = !['staff', 'admin'].includes(role!) && isDisabled;

    const routerConfig = isDisabledEffective
      ? getDisabledRouterConfig(isDisabled)
      : Constants.playgroundOnly
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
  }, [isDisabled, role, name, courseId, dispatch]);

  return <RouterProvider router={router} />;
};

function computeDisabledState() {
  const now = moment();
  for (const { start, end, reason } of Constants.disablePeriods) {
    if (start.isBefore(now) && end.isAfter(now)) {
      return reason || true;
    }
  }
  return false;
}

export default ApplicationWrapper;
