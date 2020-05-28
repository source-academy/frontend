import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import { Role } from '../../commons/application/ApplicationTypes';
import { isAcademyRe } from '../../commons/application/reducers/SessionsReducer';
import AssessmentContainer from '../../commons/assessment/AssessmentContainer';
import { AssessmentCategories, AssessmentCategory } from '../../commons/assessment/AssessmentTypes';
import { assessmentRegExp, gradingRegExp } from '../../features/academy/AcademyTypes';
import { HistoryHelper } from '../../utils/history';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import DashboardContainer from './dashboard/DashboardContainer';
import Grading from './grading/GradingContainer';
import Sourcereel from './sourcereel/SourcereelContainer';
import AcademyNavigationBar from './subcomponents/AcademyNavigationBarComponent';

import StoryUpload from '../../containers/game-dev/StoryUploadContainer'; // TODO: Fix
import Game from '../../containers/GameContainer'; // TODO: Fix
import GroundControl from '../../containers/groundControl/GroundControlContainer'; // TODO: Fix
import MaterialUploadContainer from '../../containers/material/MaterialUploadContainer'; // TODO: Remove

type AcademyProps = DispatchProps & StateProps & OwnProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleFetchNotifications: () => void;
};

export type StateProps = {
  historyHelper: HistoryHelper;
};

export type OwnProps = {
  accessToken?: string;
  role: Role;
};

class Academy extends React.Component<AcademyProps> {
  public componentDidMount() {
    /* TODO: REPLACE WITH LONG POLLING METHOD */
    this.props.handleFetchNotifications();
  }

  public render() {
    return (
      <div className="Academy">
        <AcademyNavigationBar role={this.props.role} />
        <Switch>
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Contest
            )}/${assessmentRegExp}`}
            render={this.assessmentRenderFactory(AssessmentCategories.Contest)}
          />
          <Route path="/academy/game" component={Game} />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Mission
            )}/${assessmentRegExp}`}
            render={this.assessmentRenderFactory(AssessmentCategories.Mission)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Path
            )}/${assessmentRegExp}`}
            render={this.assessmentRenderFactory(AssessmentCategories.Path)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Sidequest
            )}/${assessmentRegExp}`}
            render={this.assessmentRenderFactory(AssessmentCategories.Sidequest)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Practical
            )}/${assessmentRegExp}`}
            render={this.assessmentRenderFactory(AssessmentCategories.Practical)}
          />
          <Route path="/academy/groundcontrol" component={GroundControl} />
          <Route path="/academy/dashboard" component={DashboardContainer} />
          <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} />
          <Route path={'/academy/material'} component={MaterialUploadContainer} />
          <Route path="/academy/sourcereel" component={Sourcereel} />
          <Route path={'/academy/gamedev'} component={StoryUpload} />
          <Route exact={true} path="/academy" component={this.dynamicRedirect(this.props)} />
          <Route component={this.redirectTo404} />
        </Switch>
      </div>
    );
  }

  private assessmentRenderFactory = (cat: AssessmentCategory) => (
    routerProps: RouteComponentProps<any>
  ) => <AssessmentContainer assessmentCategory={cat} />;
  
  /**
   * 1. If user is in /academy.*, redirect to game
   * 2. If not, redirect to the last /acdaemy.* route the user was in
   * See ../../utils/history.ts for more details
   */
  private dynamicRedirect = (props: StateProps) => {
    const clickedFrom = props.historyHelper.lastGeneralLocations[0];
    const lastAcademy = props.historyHelper.lastAcademyLocations[0];
    if (clickedFrom != null && isAcademyRe.exec(clickedFrom!) == null && lastAcademy != null) {
      return () => <Redirect to={lastAcademy!} />;
    } else {
      return this.redirectToGame;
    }
  };
  
  private redirectTo404 = () => <Redirect to="/404" />;
  
  private redirectToGame = () => <Redirect to="/academy/game" />;
}


export default Academy;
