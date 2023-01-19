import { Card, Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import {
  fetchNotifications,
  updateLatestViewedCourse
} from '../../commons/application/actions/SessionActions';
import Assessment from '../../commons/assessment/Assessment';
import { assessmentTypeLink } from '../../commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp } from '../../features/academy/AcademyTypes';
import Achievement from '../../pages/achievement/Achievement';
import Sourcecast from '../../pages/sourcecast/SourcecastContainer';
import NotFound from '../notFound/NotFound';
import AdminPanel from './adminPanel/AdminPanel';
import Dashboard from './dashboard/Dashboard';
import Game from './game/Game';
import Grading from './grading/GradingContainer';
import GroundControl from './groundControl/GroundControlContainer';
import Sourcereel from './sourcereel/SourcereelContainer';
import StorySimulator from './storySimulator/StorySimulator';
import XpCalculation from './xpCalculation/XpCalculation';

const Academy: React.FC<{}> = () => {
  const { path, url } = useRouteMatch();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const assessmentConfigurations = useTypedSelector(
    state => state.session.assessmentConfigurations
  );
  const enableGame = useTypedSelector(state => state.session.enableGame);
  const role = useTypedSelector(state => state.session.role);

  const staffRoutes =
    role !== 'student'
      ? [
          <Route path={`${path}/groundcontrol`} component={GroundControl} key={0} />,
          <Route path={`${path}/grading/${gradingRegExp}`} component={Grading} key={1} />,
          <Route path={`${path}/xpcalculation`} component={XpCalculation} key={2} />,
          <Route path={`${path}/sourcereel`} component={Sourcereel} key={3} />,
          <Route path={`${path}/storysimulator`} component={StorySimulator} key={4} />,
          <Route path={`${path}/dashboard`} component={Dashboard} key={5} />
        ]
      : null;
  return (
    <div className="Academy">
      <Switch>
        {assessmentConfigurations?.map(assessmentConfiguration => (
          <Route
            path={`${path}/${assessmentTypeLink(assessmentConfiguration.type)}/${assessmentRegExp}`}
            key={assessmentConfiguration.type}
          >
            <Assessment assessmentConfiguration={assessmentConfiguration} />
          </Route>
        ))}
        {enableGame && <Route path={`${path}/game`} component={Game} />}
        <Route path={`${path}/sourcecast/:sourcecastId?`} component={Sourcecast} />
        <Route path={`${path}/achievements`} component={Achievement} />
        <Route exact={true} path={path}>
          <Redirect
            push={false}
            to={
              enableGame
                ? `${url}/game`
                : assessmentConfigurations && assessmentConfigurations.length > 0
                ? `${url}/${assessmentTypeLink(assessmentConfigurations[0].type)}`
                : role === 'admin'
                ? `${url}/adminpanel`
                : '/404'
            }
          />
        </Route>
        {staffRoutes}
        {role === 'admin' && <Route path={`${path}/adminpanel`} component={AdminPanel} />}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

const CourseSelectingAcademy: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const courseId = useTypedSelector(state => state.session.courseId);
  const { courseId: routeCourseIdStr } = useParams<{ courseId?: string }>();
  const routeCourseId = routeCourseIdStr != null ? parseInt(routeCourseIdStr, 10) : undefined;

  React.useEffect(() => {
    if (routeCourseId !== undefined && courseId !== routeCourseId) {
      dispatch(updateLatestViewedCourse(routeCourseId));
    }
  }, [courseId, dispatch, routeCourseId]);

  return routeCourseId === courseId ? (
    <Academy />
  ) : (
    <div className={classNames('Academy-switching-courses', Classes.DARK)}>
      <Card className={Classes.ELEVATION_4}>
        <NonIdealState
          description="Switching courses..."
          icon={<Spinner size={SpinnerSize.LARGE} />}
        />
      </Card>
    </div>
  );
};

export default CourseSelectingAcademy;
