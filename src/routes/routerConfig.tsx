import { Navigate, redirect, RouteObject } from 'react-router';

import Application from '../commons/application/Application';
import { Role } from '../commons/application/ApplicationTypes';
import Constants from '../commons/utils/Constants';

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
const conditionalLoader = (condition: boolean, redirectTo: string, returnValue?: any) => () => {
  if (condition) {
    return redirect(redirectTo);
  }
  return returnValue ?? null;
};

export const getDisabledRouterConfig: (reason: string | boolean) => RouteObject[] = reason => {
  const disabledReason = typeof reason === 'string' ? reason : undefined;
  return [
    {
      path: '/*',
      element: <Application />,
      children: [
        {
          path: 'login',
          lazy: () => import('../pages/login/Login'),
          loader: conditionalLoader(Constants.playgroundOnly, '/')
        },
        {
          path: '',
          lazy: () => import('../pages/disabled/Disabled'),
          loader: conditionalLoader(!Constants.playgroundOnly, 'login', disabledReason)
        },
        {
          path: 'courses/*',
          element: <Navigate to="/login" />
        },
        {
          path: '*',
          lazy: () => import('../pages/disabled/Disabled'),
          loader: () => disabledReason
        }
      ]
    }
  ];
};

const commonChildrenRoutes: RouteObject[] = [
  {
    path: 'contributors',
    lazy: () => import('../pages/contributors/Contributors')
  },
  {
    path: 'callback/github',
    lazy: () => import('../pages/githubCallback/GitHubCallback')
  },
  {
    path: 'sicpjs/:section?',
    lazy: () => import('../pages/sicp/Sicp')
  },
  {
    path: 'githubassessments/*',
    lazy: () => import('../pages/githubAssessments/GitHubClassroom'),
    loader: conditionalLoader(!Constants.enableGitHubAssessments, '/')
  }
];

export const playgroundOnlyRouterConfig: RouteObject[] = [
  {
    path: '/*',
    element: <Application />,
    children: [
      {
        path: '',
        element: <Navigate to="/playground" replace />
      },
      {
        path: 'playground',
        lazy: () => import('../pages/playground/Playground')
      },
      ...commonChildrenRoutes,
      {
        path: '*',
        lazy: () => import('../pages/notFound/NotFound')
      }
    ]
  }
];

export const getFullAcademyRouterConfig = ({
  name,
  role,
  isLoggedIn,
  courseId
}: {
  name?: string;
  role?: Role;
  isLoggedIn: boolean;
  courseId?: number | null;
}): RouteObject[] => {
  const welcomeLoader = () => {
    if (name === undefined) {
      return redirect('/login');
    }
    if (courseId !== null && courseId !== undefined) {
      return redirect(`/courses/${courseId}`);
    }
    return null;
  };

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
          lazy: () => import('../pages/login/Login')
        },
        {
          path: 'welcome',
          lazy: () => import('../pages/welcome/Welcome'),
          loader: welcomeLoader
        },
        {
          path: 'courses',
          element: <Navigate to="/" />
        },
        {
          path: 'courses/:courseId/*',
          lazy: () => import('../pages/academy/Academy'),
          loader: ensureUserAndRole
        },
        {
          path: 'playground',
          lazy: () => import('../pages/playground/Playground'),
          loader: ensureUserAndRole
        },
        {
          path: 'mission-control/:assessmentId?/:questionId?',
          lazy: () => import('../pages/missionControl/MissionControl')
        },
        ...commonChildrenRoutes,
        {
          path: '*',
          lazy: () => import('../pages/notFound/NotFound')
        }
      ]
    }
  ];
};
