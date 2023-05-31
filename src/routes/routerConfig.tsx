import { Navigate, redirect, RouteObject } from 'react-router';

import Application from '../commons/application/Application';
import { Role } from '../commons/application/ApplicationTypes';
import Constants from '../commons/utils/Constants';
import Academy from '../pages/academy/Academy';
import Contributors from '../pages/contributors/Contributors';
import Disabled from '../pages/disabled/Disabled';
import GitHubClassroom from '../pages/githubAssessments/GitHubClassroom';
import GitHubCallback from '../pages/githubCallback/GitHubCallback';
import Login from '../pages/login/Login';
import MissionControl from '../pages/missionControl/MissionControl';
import NotFound from '../pages/notFound/NotFound';
import Playground from '../pages/playground/Playground';
import Sicp from '../pages/sicp/Sicp';
import Welcome from '../pages/welcome/Welcome';

/**
 * Partial migration to be compatible with react-router v6.4 data loader APIs.
 *
 * Note that to use data loader APIs, the routes utilizing loader functions must be defined before passing
 * them to createBrowserRouter. They cannot be defined in some child/nested <Routes /> component that can only be known
 * during render time.
 * https://stackoverflow.com/questions/73875903/react-router-route-loader-not-working-on-nested-components
 */

// Conditionally allow access to route via `loader` instead of conditionally defining these routes in react-router v6.4.
// See https://github.com/remix-run/react-router/discussions/10223#discussioncomment-5909050
const conditionalLoader = (condition: boolean, redirectTo: string) => () => {
  if (condition) {
    return redirect(redirectTo);
  }
  return null;
};

export const getDisabledRouterConfig: (reason: string | boolean) => RouteObject[] = reason => {
  const disabledElement = <Disabled reason={typeof reason === 'string' ? reason : undefined} />;

  return [
    {
      path: '/',
      element: <Application />,
      children: [
        {
          path: 'login',
          element: <Login />,
          loader: conditionalLoader(Constants.playgroundOnly, '/')
        },
        {
          path: '',
          element: disabledElement,
          loader: conditionalLoader(!Constants.playgroundOnly, 'login')
        },
        {
          path: 'courses/*',
          element: <Navigate to="/login" />
        },
        {
          path: '*',
          element: disabledElement
        }
      ]
    }
  ];
};

const commonChildrenRoutes = [
  {
    path: 'contributors',
    element: <Contributors />
  },
  {
    path: 'callback/github',
    element: <GitHubCallback />
  },
  {
    path: 'sicpjs/:section?',
    element: <Sicp />
  },
  {
    path: 'githubassessments/*',
    element: <GitHubClassroom />,
    loader: conditionalLoader(!Constants.enableGitHubAssessments, '/')
  }
];

export const playgroundOnlyRouterConfig: RouteObject[] = [
  {
    path: '/',
    element: <Application />,
    children: [
      {
        path: '',
        element: <Navigate to="/playground" replace />
      },
      {
        path: 'playground',
        element: <Playground />
      },
      ...commonChildrenRoutes,
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

export const getFullAcademyRouterConfig = ({
  name,
  role,
  courseId,
  isLoggedIn
}: {
  name?: string;
  role?: Role;
  courseId?: number | null;
  isLoggedIn: boolean;
}): RouteObject[] => {
  const ensureUser = conditionalLoader(name === undefined, '/login');

  const ensureUserAndRole = () => {
    if (name === undefined) {
      return redirect('/login');
    }
    if (role === undefined) {
      return redirect('/welcome');
    }
    return null;
  };

  return [
    {
      path: '/*',
      element: <Application />,
      children: [
        {
          path: '',
          element: (
            <Navigate
              to={!isLoggedIn ? '/login' : courseId === null ? '/welcome' : `/courses/${courseId}`}
              replace
            />
          )
        },
        {
          path: 'login',
          element: <Login />
        },
        {
          path: 'welcome',
          element: <Welcome />,
          loader: ensureUser
        },
        {
          path: 'courses',
          element: <Navigate to="/" />
        },
        {
          path: 'courses/:courseId/*',
          element: <Academy />,
          loader: ensureUserAndRole
        },
        {
          path: 'playground',
          element: <Playground />,
          loader: ensureUserAndRole
        },
        {
          path: 'mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?',
          element: <MissionControl />
        },
        ...commonChildrenRoutes,
        {
          path: '*',
          element: <NotFound />
        }
      ]
    }
  ];
};
