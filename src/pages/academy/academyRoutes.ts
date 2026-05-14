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
import { createRoutes } from 'src/routes/routeUtils';

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

const checkAssessmentTypeLoader = (({ params }) => {
  const { assessmentConfigurations } = store.getState().session;
  const assessmentRoutes = buildAssessmentRoutes(assessmentConfigurations);

  const requestedType = params['assessmentConfigType'];
  for (const type of Object.keys(assessmentRoutes)) {
    if (requestedType == type) {
      return assessmentRoutes[type];
    }
  }
  // Note: Middleware resolves relative paths from the root,
  // while Loader resolves relative paths from the parent route,
  // so here, it's fine to just redirect to `not-found` without prefixing
  return redirect(notFoundPath);
}) satisfies LoaderFunction;

const homePageRedirect = (({ params: { courseId } }) => {
  const { role, enableGame, assessmentConfigurations } = store.getState().session;
  if (enableGame) {
    throw redirect(`/courses/${courseId}/game`);
  }
  if (assessmentConfigurations && assessmentConfigurations.length > 0) {
    throw redirect(`/courses/${courseId}/${assessmentTypeLink(assessmentConfigurations[0].type)}`);
  }
  if (role === Role.Admin) {
    throw redirect(`/courses/${courseId}/adminpanel`);
  }
  return null;
}) satisfies MiddlewareFunction;

const commonAcademyRoutes: RouteObject[] = [
  {
    index: true,
    middleware: [
      homePageRedirect,
      ({ params: { courseId } }) => {
        throw replace(`/courses/${courseId}/${notFoundPath}`);
      },
    ],
  },
  {
    path: 'game',
    middleware: [
      ({ params: { courseId } }) => {
        const state = store.getState();
        if (!state.session.enableGame) {
          throw redirect(`/courses/${courseId}/${notFoundPath}`);
        }
        return null;
      },
    ],
    lazy: Game,
  },
  {
    path: `:assessmentConfigType/${assessmentRegExp}`,
    loader: checkAssessmentTypeLoader,
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

function ensureRoleOneOf(...roles: Role[]) {
  return (({ params: { courseId } }) => {
    const state = store.getState();
    const role = state.session.role;
    if (role == undefined || !roles.includes(role)) {
      throw redirect(`/courses/${courseId}/${notFoundPath}`);
    }
    return null;
  }) satisfies MiddlewareFunction;
}

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

export const academyRoutes: RouteObject[] = [...commonAcademyRoutes, staffRoutes, adminRoutes];
