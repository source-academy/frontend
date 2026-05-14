import { type MiddlewareFunction, redirect, replace, type RouteObject } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { store } from 'src/pages/createStore';

const RootLayout = () => import('../new_routes/_layout');
const Login = () => import('../pages/login/Login');
const LoginPage = () => import('../new_routes/login');
const LoginCallback = () => import('../new_routes/login/callback');
const LoginVscodeCallback = () => import('../new_routes/login/vscode_callback');
const NusLogin = () => import('../new_routes/nus_login');
const Playground = () => import('../pages/playground/Playground');
const NotFound = () => import('../new_routes/not-found');
const Welcome = () => import('../new_routes/welcome');
const Academy = () => import('../new_routes/courses/[courseId]/_layout');
const MissionControl = () => import('../new_routes/mission-control/[assessmentId]/[questionId]');

const commonChildrenRoutes: RouteObject[] = [
  { path: 'contributors', lazy: () => import('../new_routes/contributors') },
  { path: 'callback/github', lazy: () => import('../new_routes/callback/github') },
  {
    path: 'sicpjs',
    lazy: () => import('../new_routes/sicpjs/_layout'),
    children: [{ path: ':section?', lazy: () => import('../new_routes/sicpjs/[section]') }],
  },
  { path: 'features', lazy: () => import('../new_routes/features') },
];

export const playgroundOnlyRouterConfig: RouteObject[] = [
  {
    lazy: RootLayout,
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
      lazy: RootLayout,
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
        {
          middleware: [
            () => {
              const state = store.getState();
              if (!state.session.name) {
                throw redirect('/login');
              }
              if (state.session.role == undefined) {
                throw redirect('/welcome');
              }
              return null;
            },
          ],
          children: [
            { path: 'courses/:courseId/*', lazy: Academy, children: academyRoutes },
            { path: 'playground/:playgroundCode?', lazy: Playground },
          ],
        },
        { path: 'mission-control/:assessmentId?/:questionId?', lazy: MissionControl },
        ...commonChildrenRoutes,
        { path: '*', lazy: NotFound },
      ],
    },
  ];
};
