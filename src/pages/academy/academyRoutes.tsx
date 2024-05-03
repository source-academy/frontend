import { LoaderFunction, Navigate, redirect, RouteObject } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import Assessment from 'src/commons/assessment/Assessment';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp, teamRegExp } from 'src/features/academy/AcademyTypes';
import { GuardedRoute } from 'src/routes/routeGuard';

import { store } from '../createStore';

const notFoundPath = 'not_found';

const Game = () => import('./game/Game');
const NotiPreference = () => import('./notiPreference/NotiPreference');
const Sourcecast = () => import('../sourcecast/Sourcecast');
const Achievement = () => import('../achievement/Achievement');
const NotFound = () => import('../notFound/NotFound');

const getCommonAcademyRoutes = (
  assessmentConfigurations: AssessmentConfiguration[]
): RouteObject[] => {
  const assessmentRoutes =
    assessmentConfigurations?.reduce((acc: Record<string, AssessmentConfiguration>, config) => {
      acc[assessmentTypeLink(config.type)] = config;
      return acc;
    }, {}) ?? {};

  const assessmentLoader: LoaderFunction = ({ params }) => {
    const requestedType = params['assessmentConfigType'];
    for (const type of Object.keys(assessmentRoutes)) {
      if (requestedType == type) {
        return assessmentRoutes[type];
      }
    }
    return redirect(notFoundPath);
  };

  const homePageRedirect = () => {
    const { role, enableGame } = store.getState().session;
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
    { path: '', element: <Navigate replace to={notFoundPath} />, loader: homePageRedirect },
    {
      path: `:assessmentConfigType/${assessmentRegExp}`,
      element: <Assessment />,
      loader: assessmentLoader
    },
    { path: 'notipreference', lazy: NotiPreference },
    { path: 'sourcecast/:sourcecastId?', lazy: Sourcecast },
    { path: 'achievements/*', lazy: Achievement },
    { path: notFoundPath, lazy: NotFound },
    { path: '*', loader: () => redirect(notFoundPath) }
  ];
};

const GroundControl = () => import('./groundControl/GroundControlContainer');
const Grading = () => import('./grading/Grading');
const Sourcereel = () => import('./sourcereel/Sourcereel');
const GameSimulator = () => import('./gameSimulator/GameSimulator');
const TeamFormation = () => import('./teamFormation/TeamFormation');
const TeamFormationForm = () => import('./teamFormation/subcomponents/TeamFormationForm');
const TeamFormationImport = () => import('./teamFormation/subcomponents/TeamFormationImport');
const Dashboard = () => import('./dashboard/Dashboard');

const staffRoutes: RouteObject[] = [
  { path: 'groundcontrol', lazy: GroundControl },
  { path: `grading/${gradingRegExp}`, lazy: Grading },
  { path: 'sourcereel', lazy: Sourcereel },
  { path: 'gamesimulator', lazy: GameSimulator },
  { path: 'teamformation', lazy: TeamFormation },
  { path: 'teamformation/create', lazy: TeamFormationForm },
  { path: `teamformation/edit/${teamRegExp}`, lazy: TeamFormationForm },
  { path: 'teamformation/import', lazy: TeamFormationImport },
  { path: 'dashboard', lazy: Dashboard }
].map(r =>
  new GuardedRoute(r)
    .check(s => {
      const role = s.session.role;
      return role === Role.Staff || role === Role.Admin;
    }, notFoundPath)
    .build()
);

const AdminPanel = () => import('./adminPanel/AdminPanel');

const adminRoutes: RouteObject[] = [{ path: 'adminpanel', lazy: AdminPanel }].map(r =>
  new GuardedRoute(r).check(s => s.session.role === Role.Admin, notFoundPath).build()
);

export const getAcademyRoutes = (
  assessmentConfigurations?: AssessmentConfiguration[]
): RouteObject[] => {
  const routes: RouteObject[] = [
    ...getCommonAcademyRoutes(assessmentConfigurations ?? []),
    ...staffRoutes,
    ...adminRoutes
  ];
  return routes;
};
