/* tslint:disable: jsx-no-lambda */
import * as qs from 'query-string'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import Grading from '../../containers/academy/grading'
import AssessmentContainer from '../../containers/assessment'
import Game from '../../containers/GameContainer'
import { isAcademyRe } from '../../reducers/session'
import { HistoryHelper } from '../../utils/history'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import { AssessmentCategories, AssessmentCategory } from '../assessment/assessmentShape'
import AcademyNavigationBar from './NavigationBar'

interface IAcademyProps extends IDispatchProps, IOwnProps, IStateProps, RouteComponentProps<{}> {}

export interface IDispatchProps {
  handleFetchTokens: (ivleToken: string) => void
  handleFetchUsername: () => void
}

export interface IOwnProps {
  accessToken?: string
}

export interface IStateProps {
  historyHelper: HistoryHelper
}

const assessmentRenderFactory = (cat: AssessmentCategory) => (
  routerProps: RouteComponentProps<any>
) => <AssessmentContainer assessmentCategory={cat} />

const assessmentRegExp = ':assessmentId(\\d+)?/:questionId(\\d+)?'

export const Academy: React.SFC<IAcademyProps> = props => (
  <div className="Academy">
    <AcademyNavigationBar />
    <Switch>
      {checkLoggedIn(props)}
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
        path={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Path)}
      />
      <Route
        path={`/academy/${assessmentCategoryLink(
          AssessmentCategories.Sidequest
        )}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Sidequest)}
      />
      <Route path="/academy/grading" component={Grading} />
      <Route exact={true} path="/academy" component={dynamicRedirect(props)} />
      <Route component={redirectTo404} />
    </Switch>
  </div>
)

const checkLoggedIn = (props: IAcademyProps) => {
  const ivleToken = qs.parse(props.location.search).token
  if (ivleToken !== undefined) {
    props.handleFetchTokens(ivleToken) // just received a callback from IVLE
    props.handleFetchUsername()
    return
  } else if (props.accessToken === undefined) {
    return <Route component={redirectToLogin} />
  } else {
    return
  }
}

/**
 * 1. If user is in /academy.*, redirect to game
 * 2. If not, redirect to the last /acdaemy.* route the user was in
 * See src/utils/history.ts for more details
 */
const dynamicRedirect = (props: IStateProps) => {
  const clickedFrom = props.historyHelper.lastGeneralLocations[0]
  const lastAcademy = props.historyHelper.lastAcademyLocations[0]
  if (clickedFrom != null && isAcademyRe.exec(clickedFrom!) == null && lastAcademy != null) {
    return () => <Redirect to={lastAcademy!} />
  } else {
    return redirectToGame
  }
}

const redirectTo404 = () => <Redirect to="/404" />

const redirectToLogin = () => <Redirect to="/login" />

const redirectToGame = () => <Redirect to="/academy/game" />

export default Academy
