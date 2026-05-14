import * as Sentry from '@sentry/react';
import { type MiddlewareFunction, redirect, replace, type RouteObject, Routes } from 'react-router';
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
const LoginPage = () => import('../new_routes/login');
const LoginCallback = () => import('../new_routes/login/callback');
const LoginVscodeCallback = () => import('../new_routes/login/vscode_callback');
const NusLogin = () => import('../new_routes/nus_login');
const Contributors = () => import('../new_routes/contributors');
const GitHubCallback = () => import('../new_routes/callback/github');
const Sicp = () => import('../new_routes/sicpjs/[section]');
const Playground = () => import('../pages/playground/Playground');
const NotFound = () => import('../new_routes/not-found');
const Welcome = () => import('../new_routes/welcome');
const Academy = () => import('../new_routes/courses/[courseId]/_layout');
const MissionControl = () => import('../new_routes/mission-control/[assessmentId]/[questionId]');
const Features = () => import('../new_routes/features');

const commonChildrenRoutes: RouteObject[] = [
  { path: 'contributors', lazy: Contributors },
  { path: 'callback/github', lazy: GitHubCallback },
  { path: 'sicpjs/:section?', lazy: Sicp },
  { path: 'features', lazy: Features },
];

export const playgroundOnlyRouterConfig: RouteObject[] = [
  {
    path: '*',
    lazy: Application,
    children: [
      { index: true, loader: () => replace('/playground') },
      { path: 'playground', lazy: Playground },
      ...commonChildrenRoutes,
      { path: '*', lazy: NotFound },
    ],
  },
];

export const getFullAcademyRouterConfig = ({
  name,
  isLoggedIn,
  courseId,
  academyRoutes = [],
}: {
  name?: string;
  isLoggedIn: boolean;
  courseId?: number | null;
  academyRoutes?: RouteObject[];
}): RouteObject[] => {
  const welcomeMiddleware = (() => {
    if (name === undefined) {
      throw redirect('/login');
    }
    if (courseId !== null && courseId !== undefined) {
      throw redirect(`/courses/${courseId}`);
    }
    return null;
  }) satisfies MiddlewareFunction;

  const ensureUserAndRole = (r: RouteObject) => {
    return new GuardedRoute(r)
      .check(s => s.session.name !== undefined, '/login')
      .check(s => s.session.role !== undefined, '/welcome')
      .build();
  };

  const homePageRedirect = (() => {
    if (!isLoggedIn) {
      throw redirect('/login');
    }
    if (courseId == null) {
      throw redirect('/welcome');
    }
    return null;
  }) satisfies MiddlewareFunction;

  return [
    {
      path: 'nus_login',
      lazy: Login,
      middleware: [
        () => {
          if (Constants.hasNusAuthProviders) {
            return null;
          }
          throw redirect('/login');
        },
      ],
      children: [{ path: '', lazy: NusLogin }],
    },
    {
      path: '*',
      lazy: Application,
      children: [
        {
          index: true,
          middleware: [
            homePageRedirect,
            () => {
              throw replace(`/courses/${courseId}`);
            },
          ],
        },
        {
          path: 'login',
          lazy: Login,
          middleware: [
            () => {
              if (Constants.hasOtherAuthProviders) {
                return null;
              }
              throw redirect('/nus_login');
            },
          ],
          children: [{ path: '', lazy: LoginPage }],
        },
        {
          path: 'login',
          lazy: Login,
          children: [{ path: 'callback', lazy: LoginCallback }],
        },
        {
          path: 'login',
          children: [{ path: 'vscode_callback', lazy: LoginVscodeCallback }],
        },
        { path: 'welcome', lazy: Welcome, middleware: [welcomeMiddleware] },
        {
          path: 'courses',
          middleware: [
            () => {
              throw redirect('/');
            },
          ],
        },
        ensureUserAndRole({ path: 'courses/:courseId/*', lazy: Academy, children: academyRoutes }),
        ensureUserAndRole({ path: 'playground/:playgroundCode?', lazy: Playground }),
        { path: 'mission-control/:assessmentId?/:questionId?', lazy: MissionControl },
        ...commonChildrenRoutes,
        { path: '*', lazy: NotFound },
      ],
    },
  ];
};

export const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);
