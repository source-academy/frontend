import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Grading from '../../containers/academy/grading';
import AssessmentContainer from '../../containers/assessment';
import Game from '../../containers/GameContainer';
import MaterialUpload from '../../containers/material/MaterialUploadContainer';
import Sourcereel from '../../containers/sourcecast/SourcereelContainer';
import { isAcademyRe } from '../../reducers/session';
import { Role } from '../../reducers/states';
import { HistoryHelper } from '../../utils/history';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategories, AssessmentCategory } from '../assessment/assessmentShape';
import AcademyNavigationBar from './NavigationBar';

interface IAcademyProps extends IOwnProps, IStateProps, IDispatchProps, RouteComponentProps<{}> {}

export interface IOwnProps {
  accessToken?: string;
  role: Role;
}

export interface IStateProps {
  historyHelper: HistoryHelper;
}

export interface IDispatchProps {
  handleFetchNotifications: () => void;
}

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

          <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} />
          <Route path={'/academy/material'} component={MaterialUpload} />
          <Route path="/academy/sourcereel" component={Sourcereel} />
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
const dynamicRedirect = (props: IStateProps) => {
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
