import { LoaderFunction, Navigate, redirect, RouteObject } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import Assessment from 'src/commons/assessment/Assessment';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp, teamRegExp } from 'src/features/academy/AcademyTypes';
import { GuardedRoute } from 'src/routes/routeGuard';

import Achievement from '../achievement/Achievement';
import { store } from '../createStore';
import NotFound from '../notFound/NotFound';
import Sourcecast from '../sourcecast/Sourcecast';
import AdminPanel from './adminPanel/AdminPanel';
import Dashboard from './dashboard/Dashboard';
import Game from './game/Game';
import GameSimulator from './gameSimulator/GameSimulator';
import Grading from './grading/Grading';
import GroundControl from './groundControl/GroundControlContainer';
import NotiPreference from './notiPreference/NotiPreference';
import Sourcereel from './sourcereel/Sourcereel';
import TeamFormationForm from './teamFormation/subcomponents/TeamFormationForm';
import TeamFormationImport from './teamFormation/subcomponents/TeamFormationImport';
import TeamFormation from './teamFormation/TeamFormation';

const notFoundPath = 'not_found';

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

  const gameRoute = new GuardedRoute({ path: 'game', element: <Game /> })
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
    { path: 'notipreference', element: <NotiPreference /> },
    { path: 'sourcecast/:sourcecastId?', element: <Sourcecast /> },
    { path: 'achievements/*', element: <Achievement /> },
    { path: notFoundPath, element: <NotFound /> },
    { path: '*', loader: () => redirect(notFoundPath) }
  ];
};

const staffRoutes: RouteObject[] = [
  { path: 'groundcontrol', element: <GroundControl /> },
  { path: `grading/${gradingRegExp}`, element: <Grading /> },
  { path: 'sourcereel', element: <Sourcereel /> },
  { path: 'gamesimulator', element: <GameSimulator /> },
  { path: 'teamformation', element: <TeamFormation /> },
  { path: 'teamformation/create', element: <TeamFormationForm /> },
  { path: `teamformation/edit/${teamRegExp}`, element: <TeamFormationForm /> },
  { path: 'teamformation/import', element: <TeamFormationImport /> },
  { path: 'dashboard', element: <Dashboard /> }
].map(r => new GuardedRoute(r).check(s => s.session.role !== Role.Student, notFoundPath).build());

const adminRoutes: RouteObject[] = [{ path: 'adminpanel', element: <AdminPanel /> }].map(r =>
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
