import * as Sentry from '@sentry/react';
import { redirect, replace, type RouteObject, Routes } from 'react-router';
import Constants from 'src/commons/utils/Constants';

import { GuardedRoute } from './routeGuard';

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
// const conditionalLoader = (condition: boolean, redirectTo: string, returnValue?: any) => () => {
//   if (condition) {
//     return redirect(redirectTo);
//   }
//   return returnValue ?? null;
// };

const Application = () => import('../commons/application/Application');
const Login = () => import('../pages/login/Login');
const LoginPage = () => import('../pages/login/LoginPage');
const LoginCallback = () => import('../pages/login/LoginCallback');
const LoginVscodeCallback = () => import('../pages/login/LoginVscodeCallback');
const NusLogin = () => import('../pages/login/NusLogin');
const Contributors = () => import('../pages/contributors/Contributors');
const GitHubCallback = () => import('../pages/githubCallback/GitHubCallback');
const Sicp = () => import('../pages/sicp/Sicp');
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
const Features = () => import('../pages/featureFlags/FeatureFlags');

const commonChildrenRoutes: RouteObject[] = [
  { path: 'contributors', lazy: Contributors },
  { path: 'callback/github', lazy: GitHubCallback },
  { path: 'sicpjs/:section?', lazy: Sicp },
  { path: 'features', lazy: Features }
];

export const playgroundOnlyRouterConfig: RouteObject[] = [
  {
    path: '*',
    lazy: Application,
    children: [
      { path: '', loader: () => replace('/playground') },
      { path: 'playground', lazy: Playground },
      ...commonChildrenRoutes,
      { path: '*', lazy: NotFound }
    ]
  }
];

export const getFullAcademyRouterConfig = ({
  name,
  isLoggedIn,
  courseId,
  academyRoutes = []
}: {
  name?: string;
  isLoggedIn: boolean;
  courseId?: number | null;
  academyRoutes?: RouteObject[];
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

  const ensureUserAndRole = (r: RouteObject) => {
    return new GuardedRoute(r)
      .check(s => s.session.name !== undefined, '/login')
      .check(s => s.session.role !== undefined, '/welcome')
      .build();
  };

  const homePageRedirect = () => {
    if (!isLoggedIn) {
      return redirect('/login');
    }
    if (courseId === null) {
      return redirect('/welcome');
    }
    return null;
  };

  return [
    {
      path: 'nus_login',
      lazy: Login,
      loader: () => (Constants.hasNusAuthProviders ? null : redirect('/login')),
      children: [{ path: '', lazy: NusLogin }]
    },
    {
      path: '*',
      lazy: Application,
      children: [
        {
          path: '',
          loader: () => homePageRedirect() || replace(`/courses/${courseId}`)
        },
        {
          path: 'login',
          lazy: Login,
          loader: () => (Constants.hasOtherAuthProviders ? null : redirect('/nus_login')),
          children: [{ path: '', lazy: LoginPage }]
        },
        {
          path: 'login',
          lazy: Login,
          children: [{ path: 'callback', lazy: LoginCallback }]
        },
        {
          path: 'login',
          children: [{ path: 'vscode_callback', lazy: LoginVscodeCallback }]
        },
        { path: 'welcome', lazy: Welcome, loader: welcomeLoader },
        { path: 'courses', loader: () => redirect('/') },
        ensureUserAndRole({ path: 'courses/:courseId/*', lazy: Academy, children: academyRoutes }),
        ensureUserAndRole({ path: 'playground/:playgroundCode?', lazy: Playground }),
        { path: 'mission-control/:assessmentId?/:questionId?', lazy: MissionControl },
        ensureUserAndRole({ path: 'courses/:courseId/stories/new', lazy: EditStory }),
        ensureUserAndRole({ path: 'courses/:courseId/stories/view/:id', lazy: ViewStory }),
        ensureUserAndRole({ path: 'courses/:courseId/stories/edit/:id', lazy: EditStory }),
        ensureUserAndRole({ path: 'courses/:courseId/stories', lazy: Stories }),
        ...commonChildrenRoutes,
        { path: '*', lazy: NotFound }
      ]
    }
  ];
};

export const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);
