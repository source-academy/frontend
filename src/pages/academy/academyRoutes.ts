import { memoize } from 'lodash';
import { type MiddlewareFunction, redirect, replace, type RouteObject } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';
import { assessmentRegExp } from 'src/features/academy/AcademyTypes';

import { store } from '../createStore';
import {
  contestLeaderboardLoader,
  leaderboardLoader,
} from '../leaderboard/subcomponents/leaderboardUtils';

const notFoundPath = 'not-found';

const Assessment = () => import('../../commons/assessment/Assessment');
const Game = () => import('../../new_routes/courses/[courseId]/game');
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

const checkAssessmentTypeMiddleware = (({ params }) => {
  const { assessmentConfigurations } = store.getState().session;
  const assessmentRoutes = buildAssessmentRoutes(assessmentConfigurations);

  const requestedType = params['assessmentConfigType'];
  for (const type of Object.keys(assessmentRoutes)) {
    if (requestedType == type) {
      return assessmentRoutes[type];
    }
  }
  throw redirect(notFoundPath);
}) satisfies MiddlewareFunction;

const homePageRedirect = (() => {
  const { role, enableGame, assessmentConfigurations } = store.getState().session;
  if (enableGame) {
    throw redirect('game');
  }
  if (assessmentConfigurations && assessmentConfigurations.length > 0) {
    throw redirect(`${assessmentTypeLink(assessmentConfigurations[0].type)}`);
  }
  if (role === Role.Admin) {
    throw redirect('adminpanel');
  }
  return null;
}) satisfies MiddlewareFunction;

const getCommonAcademyRoutes = (): RouteObject[] => {
  return [
    {
      index: true,
      middleware: [
        homePageRedirect,
        () => {
          throw replace(notFoundPath);
        },
      ],
    },
    {
      path: 'game',
      middleware: [
        () => {
          const state = store.getState();
          if (!state.session.enableGame) {
            throw redirect(notFoundPath);
          }
          return null;
        },
      ],
      lazy: Game,
    },
    {
      path: `:assessmentConfigType/${assessmentRegExp}`,
      middleware: [checkAssessmentTypeMiddleware],
      lazy: Assessment,
    },
    {
      path: 'achievements',
      children: [
        { index: true, lazy: () => import('../achievement/subcomponents/AchievementDashboard') },
        {
          path: 'control',
          lazy: () => import('../achievement/control/AchievementControl'),
          middleware: [ensureRoleOneOf(Role.Staff, Role.Admin)],
        },
      ],
    },
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
