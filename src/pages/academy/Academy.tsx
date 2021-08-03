import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { Role } from '../../commons/application/ApplicationTypes';
import { isAcademyRe } from '../../commons/application/reducers/SessionsReducer';
import AssessmentContainer from '../../commons/assessment/AssessmentContainer';
import { HistoryHelper } from '../../commons/utils/HistoryHelper';
import { assessmentRegExp, gradingRegExp } from '../../features/academy/AcademyTypes';
import AdminPanel from './adminPanel/AdminPanelContainer';
import DashboardContainer from './dashboard/DashboardContainer';
import Game from './game/Game';
import Grading from './grading/GradingContainer';
import GroundControl from './groundControl/GroundControlContainer';
import Sourcereel from './sourcereel/SourcereelContainer';
import StorySimulator from './storySimulator/StorySimulator';

type AcademyProps = DispatchProps & StateProps & OwnProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleFetchNotifications: () => void;
};

export type StateProps = {
  historyHelper: HistoryHelper;
  enableGame?: boolean;
  assessmentConfigurations?: AssessmentConfiguration[];
};

export type OwnProps = {
  role: Role;
};

class Academy extends React.Component<AcademyProps> {
  public componentDidMount() {
    /* TODO: REPLACE WITH LONG POLLING METHOD */
    this.props.handleFetchNotifications();
  }

  public render() {
    const staffRoutes =
      this.props.role !== 'student'
        ? [
            <Route path="/academy/groundcontrol" component={GroundControl} key={0} />,
            <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} key={1} />,
            <Route path="/academy/sourcereel" component={Sourcereel} key={2} />,
            <Route path={'/academy/storysimulator'} component={StorySimulator} key={3} />,
            <Route path="/academy/dashboard" component={DashboardContainer} key={4} />
          ]
        : null;
    return (
      <div className="Academy">
        <Switch>
          {this.props.assessmentConfigurations?.map(assessmentConfiguration => (
            <Route
              path={`/academy/${assessmentTypeLink(
                assessmentConfiguration.type
              )}/${assessmentRegExp}`}
              render={this.assessmentRenderFactory(assessmentConfiguration)}
              key={assessmentConfiguration.type}
            />
          ))}
          {this.props.enableGame && <Route path="/academy/game" component={Game} />}
          <Route exact={true} path="/academy" component={this.dynamicRedirect(this.props)} />
          {staffRoutes}
          {this.props.role === 'admin' && (
            <Route path="/academy/adminpanel" component={AdminPanel} />
          )}
          <Route component={this.redirectTo404} />
        </Switch>
      </div>
    );
  }

  private assessmentRenderFactory =
    (assessmentConfiguration: AssessmentConfiguration) => (routerProps: RouteComponentProps<any>) =>
      <AssessmentContainer assessmentConfiguration={assessmentConfiguration} />;

  /**
   * 1. If user is in /academy.*, redirect to game
   * 2. If not, redirect to the last /academy.* route the user was in
   * See ../../commons/utils/HistoryHelper.ts for more details
   */
  private dynamicRedirect = (props: StateProps) => {
    const clickedFrom = props.historyHelper.lastGeneralLocations[0];
    const lastAcademy = props.historyHelper.lastAcademyLocations[0];
    if (clickedFrom != null && isAcademyRe.exec(clickedFrom!) == null && lastAcademy != null) {
      return () => <Redirect to={lastAcademy!} />;
    } else {
      return this.props.enableGame ? this.redirectToGame : this.redirectToAssessments;
    }
  };

  private redirectTo404 = () => <Redirect to="/404" />;

  private redirectToGame = () => <Redirect to="/academy/game" />;

  private redirectToAssessments = () => {
    return this.props.assessmentConfigurations ? (
      <Redirect
        to={`/academy/${assessmentTypeLink(this.props.assessmentConfigurations[0].type)}`}
      />
    ) : (
      this.redirectTo404()
    );
  };
}

export default Academy;
