import { Card, Classes, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router';

import {
  fetchNotifications,
  updateLatestViewedCourse
} from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import AssessmentContainer from '../../commons/assessment/AssessmentContainer';
import { assessmentTypeLink } from '../../commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp } from '../../features/academy/AcademyTypes';
import Achievement from '../../pages/achievement/AchievementContainer';
import Sourcecast from '../../pages/sourcecast/SourcecastContainer';
import NotFound from '../notFound/NotFound';
import AdminPanel from './adminPanel/AdminPanelContainer';
import DashboardContainer from './dashboard/DashboardContainer';
import Game from './game/Game';
import Grading from './grading/GradingContainer';
import GroundControl from './groundControl/GroundControlContainer';
import Sourcereel from './sourcereel/SourcereelContainer';
import StorySimulator from './storySimulator/StorySimulator';

const Academy: React.FC<{}> = () => {
  const { path, url } = useRouteMatch();
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const { assessmentConfigurations, enableGame, role } = useSelector(
    (state: OverallState) => ({
      assessmentConfigurations: state.session.assessmentConfigurations,
      enableGame: state.session.enableGame,
      role: state.session.role
    }),
    shallowEqual
  );

  const staffRoutes =
    role !== 'student'
      ? [
          <Route path={`${path}/groundcontrol`} component={GroundControl} key={0} />,
          <Route path={`${path}/grading/${gradingRegExp}`} component={Grading} key={1} />,
          <Route path={`${path}/sourcereel`} component={Sourcereel} key={2} />,
          <Route path={`${path}/storysimulator`} component={StorySimulator} key={3} />,
          <Route path={`${path}/dashboard`} component={DashboardContainer} key={4} />
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
            <AssessmentContainer assessmentConfiguration={assessmentConfiguration} />
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
  const courseId = useSelector<OverallState>(state => state.session.courseId);
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
