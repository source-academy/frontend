import { Card, Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import ResearchAgreementPrompt from 'src/commons/researchAgreementPrompt/ResearchAgreementPrompt';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import classes from 'src/styles/Academy.module.scss';

import {
  fetchNotifications,
  updateLatestViewedCourse
} from '../../commons/application/actions/SessionActions';
import Assessment from '../../commons/assessment/Assessment';
import { assessmentTypeLink } from '../../commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp, numberRegExp } from '../../features/academy/AcademyTypes';
import Achievement from '../achievement/Achievement';
import NotFound from '../notFound/NotFound';
import Sourcecast from '../sourcecast/Sourcecast';
import AdminPanel from './adminPanel/AdminPanel';
import Dashboard from './dashboard/Dashboard';
import Game from './game/Game';
import Grading from './grading/Grading';
import GroundControl from './groundControl/GroundControlContainer';
import NotiPreference from './notiPreference/NotiPreference';
import Sourcereel from './sourcereel/Sourcereel';
import StorySimulator from './storySimulator/StorySimulator';
import XpCalculation from './xpCalculation/XpCalculation';

const Academy: React.FC<{}> = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const { agreedToResearch, assessmentConfigurations, enableGame, role } = useSession();

  const staffRoutes =
    role !== Role.Student
      ? [
          <Route path="groundcontrol" element={<GroundControl />} key={0} />,
          <Route path={`grading/${gradingRegExp}`} element={<Grading />} key={1} />,
          <Route path="xpcalculation" element={<XpCalculation />} key={2} />,
          <Route path="sourcereel" element={<Sourcereel />} key={3} />,
          <Route path="storysimulator" element={<StorySimulator />} key={4} />,
          <Route path="dashboard" element={<Dashboard />} key={5} />
        ]
      : null;
  return (
    <div className={classes['Academy']}>
      {/* agreedToResearch has a default value of undefined in the store.
            It will take on null/true/false when the backend returns. */}
      {Constants.showResearchPrompt && agreedToResearch === null && <ResearchAgreementPrompt />}
      <Routes>
        {assessmentConfigurations?.map(assessmentConfiguration => (
          <Route
            path={`${assessmentTypeLink(assessmentConfiguration.type)}/${assessmentRegExp}`}
            key={assessmentConfiguration.type}
            element={<Assessment assessmentConfiguration={assessmentConfiguration} />}
          />
        ))}
        {enableGame && <Route path="game" element={<Game />} />}
        <Route path="/notipreference" element={<NotiPreference />} />
        <Route path="sourcecast/:sourcecastId?" element={<Sourcecast />} />
        <Route path="achievements/*" element={<Achievement />} />
        <Route
          path=""
          element={
            <Navigate
              replace
              to={
                enableGame
                  ? 'game'
                  : assessmentConfigurations && assessmentConfigurations.length > 0
                  ? `${assessmentTypeLink(assessmentConfigurations[0].type)}`
                  : role === Role.Admin
                  ? 'adminpanel'
                  : '/404'
              }
            />
          }
        />
        {staffRoutes}
        {role === Role.Admin && <Route path="adminpanel" element={<AdminPanel />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const CourseSelectingAcademy: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useSession();
  const { courseId: routeCourseIdStr } = useParams<{ courseId?: string }>();
  const routeCourseId = routeCourseIdStr != null ? parseInt(routeCourseIdStr, 10) : undefined;

  React.useEffect(() => {
    // Regex to handle case where routeCourseIdStr is not a number
    if (!routeCourseIdStr?.match(numberRegExp)) {
      return navigate('/');
    }

    if (routeCourseId !== undefined && !Number.isNaN(routeCourseId) && courseId !== routeCourseId) {
      dispatch(updateLatestViewedCourse(routeCourseId));
    }
  }, [courseId, dispatch, routeCourseId, navigate, routeCourseIdStr]);

  return Number.isNaN(routeCourseId) ? (
    <Navigate to="/" />
  ) : routeCourseId === courseId ? (
    <Academy />
  ) : (
    <div className={classNames(classes['Academy-switching-courses'], Classes.DARK)}>
      <Card className={Classes.ELEVATION_4}>
        <NonIdealState
          description="Switching courses..."
          icon={<Spinner size={SpinnerSize.LARGE} />}
        />
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = CourseSelectingAcademy;
Component.displayName = 'Academy';

export default CourseSelectingAcademy;
