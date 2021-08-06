import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';

import { fetchNotifications } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import AssessmentContainer from '../../commons/assessment/AssessmentContainer';
import { assessmentTypeLink } from '../../commons/utils/ParamParseHelper';
import { assessmentRegExp, gradingRegExp } from '../../features/academy/AcademyTypes';
import AdminPanel from './adminPanel/AdminPanelContainer';
import DashboardContainer from './dashboard/DashboardContainer';
import Game from './game/Game';
import Grading from './grading/GradingContainer';
import GroundControl from './groundControl/GroundControlContainer';
import Sourcereel from './sourcereel/SourcereelContainer';
import StorySimulator from './storySimulator/StorySimulator';

const Academy: React.FC<{}> = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const { assessmentConfigurations, enableGame, role } = useSelector((state: OverallState) => ({
    assessmentConfigurations: state.session.assessmentConfigurations,
    enableGame: state.session.enableGame,
    role: state.session.role
  }));

  const staffRoutes =
    role !== 'student'
      ? [
          <Route path="/academy/groundcontrol" component={GroundControl} key={0} />,
          <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} key={1} />,
          <Route path="/academy/sourcereel" component={Sourcereel} key={2} />,
          <Route path="/academy/storysimulator" component={StorySimulator} key={3} />,
          <Route path="/academy/dashboard" component={DashboardContainer} key={4} />
        ]
      : null;
  return (
    <div className="Academy">
      <Switch>
        {assessmentConfigurations?.map(assessmentConfiguration => (
          <Route
            path={`/academy/${assessmentTypeLink(
              assessmentConfiguration.type
            )}/${assessmentRegExp}`}
            key={assessmentConfiguration.type}
          >
            <AssessmentContainer assessmentConfiguration={assessmentConfiguration} />
          </Route>
        ))}
        {enableGame && <Route path="/academy/game" component={Game} />}
        <Route exact={true} path="/academy">
          <Redirect
            push={false}
            to={
              enableGame
                ? '/academy/game'
                : assessmentConfigurations
                ? `/academy/${assessmentTypeLink(assessmentConfigurations[0].type)}`
                : '/404'
            }
          />
        </Route>
        {staffRoutes}
        {role === 'admin' && <Route path="/academy/adminpanel" component={AdminPanel} />}
        <Route>
          <Redirect to="/404" />
        </Route>
      </Switch>
    </div>
  );
};

export default Academy;
