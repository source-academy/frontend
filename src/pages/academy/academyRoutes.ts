import { memoize } from 'lodash';
import {
  type LoaderFunction,
  type MiddlewareFunction,
  redirect,
  replace,
  type RouteObject,
} from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';
import { assessmentRegExp } from 'src/features/academy/AcademyTypes';
import { GuardedRoute } from 'src/routes/routeGuard';

import { store } from '../createStore';
import {
  contestLeaderboardLoader,
  leaderboardLoader,
} from '../leaderboard/subcomponents/leaderboardUtils';

const notFoundPath = 'not_found';

const Assessment = () => import('../../commons/assessment/Assessment');
const Game = () => import('../../new_routes/courses/[courseId]/game');
const Achievement = () => import('../achievement/Achievement');
const OverallLeaderboard = () => import('../leaderboard/subcomponents/OverallLeaderboard');
const ContestLeaderboardWrapper = () =>
  import('../leaderboard/subcomponents/ContestLeaderboardWrapper');
const NotFound = () => import('../../new_routes/not-found');

// Memoized for efficiency. Relies on immutability of Redux store to ensure
// that `assessmentConfigurations` is not mutated, thereby ensuring correct
// caching behavior.
const buildAssessmentRoutes = memoize(
  (assessmentConfigurations: AssessmentConfiguration[] = []) => {
    return assessmentConfigurations?.reduce(
      (acc: Record<string, AssessmentConfiguration>, config) => {
        acc[assessmentTypeLink(config.type)] = config;
        return acc;
      },
      {},
    );
  },
);

const getCommonAcademyRoutes = (): RouteObject[] => {
  const assessmentLoader = (({ params }) => {
    const { assessmentConfigurations } = store.getState().session;
    const assessmentRoutes = buildAssessmentRoutes(assessmentConfigurations);

    const requestedType = params['assessmentConfigType'];
    for (const type of Object.keys(assessmentRoutes)) {
      if (requestedType == type) {
        return assessmentRoutes[type];
      }
    }
    return redirect(notFoundPath);
  }) satisfies LoaderFunction;

  const homePageRedirect = () => {
    const { role, enableGame, assessmentConfigurations } = store.getState().session;
    if (enableGame) {
      return redirect('game');
    }
    if (assessmentConfigurations && assessmentConfigurations.length > 0) {
      return redirect(`${assessmentTypeLink(assessmentConfigurations[0].type)}`);
    }
    if (role === Role.Admin) {
      return redirect('adminpanel');
    }
    return null;
  };

  const gameRoute = new GuardedRoute({ path: 'game', lazy: Game })
    .check(s => !!s.session.enableGame, notFoundPath)
    .build();

  return [
    gameRoute,
    { path: '', loader: () => homePageRedirect() || replace(notFoundPath) },
    {
      path: `:assessmentConfigType/${assessmentRegExp}`,
      lazy: Assessment,
      loader: assessmentLoader,
    },
    { path: 'achievements/*', lazy: Achievement },
    {
      path: 'leaderboard',
      loader: leaderboardLoader,
      children: [
        { path: 'overall', lazy: OverallLeaderboard },
        {
          path: 'contests/:contestId?/:leaderboardType',
          loader: contestLeaderboardLoader,
          lazy: ContestLeaderboardWrapper,
        },
      ],
    },
    { path: '*', lazy: NotFound },
  ];
};

const createRoutes = (routeMap: Record<string, RouteObject['lazy']>): RouteObject[] => {
  return Object.entries(routeMap).map(([path, lazy]) => ({ path, lazy }));
};

const ensureRoleOneOf = (...roles: Role[]) =>
  (() => {
    const state = store.getState();
    const role = state.session.role;
    if (!role || !roles.includes(role)) {
      throw redirect(notFoundPath);
    }
    return null;
  }) satisfies MiddlewareFunction;

const staffRoutes: RouteObject = {
  middleware: [ensureRoleOneOf(Role.Staff, Role.Admin)],
  children: createRoutes({
    'grading/:submissionId?/:questionId?': () => import('./grading/Grading'),
    gamesimulator: () => import('./gameSimulator/GameSimulator'),
    teamformation: () => import('./teamFormation/TeamFormation'),
    'teamformation/create': () => import('./teamFormation/subcomponents/TeamFormationForm'),
    'teamformation/edit/:teamId?': () => import('./teamFormation/subcomponents/TeamFormationForm'),
    'teamformation/import': () => import('./teamFormation/subcomponents/TeamFormationImport'),
    dashboard: () => import('./dashboard/Dashboard'),
  }),
};

const adminRoutes: RouteObject = {
  middleware: [ensureRoleOneOf(Role.Admin)],
  children: createRoutes({
    groundcontrol: () => import('./groundControl/GroundControl'),
    adminpanel: () => import('./adminPanel/AdminPanel'),
  }),
};

export const getAcademyRoutes = (): RouteObject[] => {
  return [...getCommonAcademyRoutes(), staffRoutes, adminRoutes];
};
