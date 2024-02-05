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

const Login = () => import('../pages/login/Login');
const Contributors = () => import('../pages/contributors/Contributors');
const GitHubCallback = () => import('../pages/githubCallback/GitHubCallback');
const Sicp = () => import('../pages/sicp/Sicp');
const GitHubClassroom = () => import('../pages/githubAssessments/GitHubClassroom');
const Playground = () => import('../pages/playground/Playground');
const NotFound = () => import('../pages/notFound/NotFound');
const Welcome = () => import('../pages/welcome/Welcome');
const Academy = () => import('../pages/academy/Academy');
const MissionControl = () => import('../pages/missionControl/MissionControl');
const EditStory = async () => {
  const { EditStoryComponent } = await import('../pages/stories/Story');
  return { Component: EditStoryComponent };
};
const ViewStory = async () => {
  const { ViewStoryComponent } = await import('../pages/stories/Story');
  return { Component: ViewStoryComponent };
};
const Stories = () => import('../pages/stories/Stories');

const commonChildrenRoutes: RouteObject[] = [
  {
    path: 'contributors',
    lazy: Contributors
  },
  {
    path: 'callback/github',
    lazy: GitHubCallback
  },
  {
    path: 'sicpjs/:section?',
    lazy: Sicp
  },
  {
    path: 'githubassessments/*',
    lazy: GitHubClassroom,
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
        lazy: Playground
      },
      ...commonChildrenRoutes,
      {
        path: '*',
        lazy: NotFound
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
          lazy: Login
        },
        {
          path: 'welcome',
          lazy: Welcome,
          loader: welcomeLoader
        },
        {
          path: 'courses',
          element: <Navigate to="/" />
        },
        {
          path: 'courses/:courseId/*',
          lazy: Academy,
          loader: ensureUserAndRole
        },
        {
          path: 'playground',
          lazy: Playground,
          loader: ensureUserAndRole
        },
        {
          path: 'mission-control/:assessmentId?/:questionId?',
          lazy: MissionControl
        },
        {
          path: 'courses/:courseId/stories/new',
          lazy: EditStory,
          loader: ensureUserAndRole
        },
        {
          path: 'courses/:courseId/stories/view/:id',
          lazy: ViewStory,
          loader: ensureUserAndRole
        },
        {
          path: 'courses/:courseId/stories/edit/:id',
          lazy: EditStory,
          loader: ensureUserAndRole
        },
        {
          path: 'courses/:courseId/stories',
          lazy: Stories,
          loader: ensureUserAndRole
        },
        ...commonChildrenRoutes,
        {
          path: '*',
          lazy: NotFound
        }
      ]
    }
  ];
};
