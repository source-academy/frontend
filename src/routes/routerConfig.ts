import { type MiddlewareFunction, redirect, replace, type RouteObject } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import { store } from 'src/pages/createStore';

import { createRoutes } from './routeUtils';

const RootLayout = () => import('../new_routes/_layout');
const Login = () => import('../pages/login/Login');
const Playground = () => import('../pages/playground/Playground');
const MissionControl = () => import('../new_routes/mission-control/[assessmentId]/[questionId]');

/**
 * Route middleware that keeps the selected language in sync with the textbook route being viewed
 * (issue #4091). It runs on navigation to the textbook routes — including direct/cold loads — so
 * the language selector reflects the textbook without the button needing to own any routing logic.
 */
export const selectTextbookLanguageMiddleware =
  (languageId: string): MiddlewareFunction =>
  () => {
    store.dispatch(LanguageDirectoryActions.setSelectedLanguage(languageId));
    return null;
  };

const commonRoutes: RouteObject = {
  lazy: RootLayout,
  children: [
    ...createRoutes({
      contributors: () => import('../new_routes/contributors'),
      'callback/github': () => import('../new_routes/callback/github'),
      features: () => import('../new_routes/features'),
      '*': () => import('../new_routes/not-found'),
    }),
    {
      path: 'sicpjs',
      lazy: () => import('../new_routes/sicpjs/_layout'),
      middleware: [selectTextbookLanguageMiddleware('source1')],
      children: [{ path: ':section', lazy: () => import('../new_routes/sicpjs/[section]') }],
    },
    {
      path: 'sicpy',
      lazy: () => import('../new_routes/sicpy/_layout'),
      middleware: [selectTextbookLanguageMiddleware('python1')],
      children: [{ path: ':section', lazy: () => import('../new_routes/sicpy/[section]') }],
    },
  ],
};

export const playgroundOnlyRouterConfig: RouteObject[] = [
  commonRoutes,
  {
    lazy: RootLayout,
    children: [
      { index: true, loader: () => replace('/playground') },
      { path: 'playground', lazy: Playground },
    ],
  },
];

const loginRoutes: RouteObject[] = [
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
    children: [{ index: true, lazy: () => import('../new_routes/nus_login') }],
  },
  {
    lazy: RootLayout,
    children: [
      { path: 'login/vscode_callback', lazy: () => import('../new_routes/login/vscode_callback') },
      {
        path: 'login',
        lazy: Login,
        children: [
          {
            index: true,
            middleware: [
              () => {
                if (Constants.hasDefaultAuthProviders) {
                  return null;
                }
                throw redirect('/nus_login');
              },
            ],
            lazy: () => import('../new_routes/login'),
          },
          { path: 'callback', lazy: () => import('../new_routes/login/callback') },
        ],
      },
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
    commonRoutes,
    ...loginRoutes,
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
          path: 'welcome',
          middleware: [welcomeMiddleware],
          lazy: () => import('../new_routes/welcome'),
        },
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
            {
              path: 'courses/:courseId',
              lazy: () => import('../new_routes/courses/[courseId]/_layout'),
              children: academyRoutes,
            },
            { path: 'playground/:playgroundCode?', lazy: Playground },
          ],
        },
        { path: 'mission-control/:assessmentId?/:questionId?', lazy: MissionControl },
      ],
    },
  ];
};
