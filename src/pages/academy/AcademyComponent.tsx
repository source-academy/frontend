import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import AssessmentContainer from 'src/commons/assessment/AssessmentContainer';
import { AssessmentCategories, AssessmentCategory } from 'src/commons/assessment/AssessmentTypes';
import StoryUpload from 'src/containers/game-dev/StoryUploadContainer'; // TODO: Fix
import Game from 'src/containers/GameContainer'; // TODO: Fix
import GroundControl from 'src/containers/groundControl/GroundControlContainer'; // TODO: Fix
import MaterialUploadContainer from 'src/containers/material/MaterialUploadContainer'; // TODO: Remove
import DashboardContainer from 'src/pages/academy/dashboard/DashboardContainer';
import Grading from 'src/pages/academy/grading/GradingContainer';
import Sourcereel from 'src/pages/academy/sourcereel/SourcereelContainer';
import { isAcademyRe } from 'src/reducers/session'; // TODO: Import from commons
import { Role } from 'src/reducers/states'; // TODO: Import from commons
import { HistoryHelper } from 'src/utils/history';
import { assessmentCategoryLink } from 'src/utils/paramParseHelpers';

import AcademyNavigationBar from './subcomponents/AcademyNavigationBarComponent';

type IAcademyProps = DispatchProps & StateProps & OwnProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleFetchNotifications: () => void;
};

export type StateProps = {
  historyHelper: HistoryHelper;
}

export type OwnProps = {
  accessToken?: string;
  role: Role;
};

const assessmentRenderFactory = (cat: AssessmentCategory) => (
  routerProps: RouteComponentProps<any>
) => <AssessmentContainer assessmentCategory={cat} />;

const assessmentRegExp = ':assessmentId(\\d+)?/:questionId(\\d+)?';
const gradingRegExp = ':submissionId(\\d+)?/:questionId(\\d+)?';

class Academy extends React.Component<IAcademyProps> {
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
            render={assessmentRenderFactory(AssessmentCategories.Contest)}
          />
          <Route path="/academy/game" component={Game} />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Mission
            )}/${assessmentRegExp}`}
            render={assessmentRenderFactory(AssessmentCategories.Mission)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Path
            )}/${assessmentRegExp}`}
            render={assessmentRenderFactory(AssessmentCategories.Path)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Sidequest
            )}/${assessmentRegExp}`}
            render={assessmentRenderFactory(AssessmentCategories.Sidequest)}
          />
          <Route
            path={`/academy/${assessmentCategoryLink(
              AssessmentCategories.Practical
            )}/${assessmentRegExp}`}
            render={assessmentRenderFactory(AssessmentCategories.Practical)}
          />
          <Route path="/academy/groundcontrol" component={GroundControl} />
          <Route path="/academy/dashboard" component={DashboardContainer} />
          <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} />
          <Route path={'/academy/material'} component={MaterialUploadContainer} />
          <Route path="/academy/sourcereel" component={Sourcereel} />
          <Route path={'/academy/gamedev'} component={StoryUpload} />
          <Route exact={true} path="/academy" component={dynamicRedirect(this.props)} />
          <Route component={redirectTo404} />
        </Switch>
      </div>
    );
  }
}

/**
 * 1. If user is in /academy.*, redirect to game
 * 2. If not, redirect to the last /acdaemy.* route the user was in
 * See src/utils/history.ts for more details
 */
const dynamicRedirect = (props: StateProps) => {
  const clickedFrom = props.historyHelper.lastGeneralLocations[0];
  const lastAcademy = props.historyHelper.lastAcademyLocations[0];
  if (clickedFrom != null && isAcademyRe.exec(clickedFrom!) == null && lastAcademy != null) {
    return () => <Redirect to={lastAcademy!} />;
  } else {
    return redirectToGame;
  }
};

const redirectTo404 = () => <Redirect to="/404" />;

const redirectToGame = () => <Redirect to="/academy/game" />;

export default Academy;
