/* tslint:disable: jsx-no-lambda */

import * as qs from 'query-string'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import AssessmentListingContainer from '../../containers/assessment/AssessmentListingContainer'
import Game from '../../containers/GameContainer'
import { isAcademyRe } from '../../reducers/session'
import { HistoryHelper } from '../../utils/history'
import { AssessmentCategories, AssessmentCategory } from '../assessment/assessmentShape'
import AcademyNavigationBar from './NavigationBar'

interface IAcademyProps extends IDispatchProps, IOwnProps, IStateProps, RouteComponentProps<{}> {}

export interface IDispatchProps {
  changeToken: (token: string) => void
  fetchUsername: () => void
}

export interface IOwnProps {
  token?: string
}

export interface IStateProps {
  historyHelper: HistoryHelper
}

const assessmentListingRenderFactory = (cat: AssessmentCategory) => (
  routerProps: RouteComponentProps<any>
) => <AssessmentListingContainer assessmentCategory={cat} />

export const Academy: React.SFC<IAcademyProps> = props => (
  <div className="Academy">
    <AcademyNavigationBar />
    <Switch>
      {checkLoggedIn(props)}
      <Route
        path="/academy/contests"
        render={assessmentListingRenderFactory(AssessmentCategories.CONTEST)}
      />
      <Route path="/academy/game" component={Game} />
      <Route
        path="/academy/missions/:assessmentId?/:questionId?"
        render={assessmentListingRenderFactory(AssessmentCategories.MISSION)}
      />
      <Route
        path="/academy/paths"
        render={assessmentListingRenderFactory(AssessmentCategories.PATH)}
      />
      <Route
        path="/academy/sidequests"
        render={assessmentListingRenderFactory(AssessmentCategories.SIDEQUEST)}
      />
      <Route exact={true} path="/academy" component={dynamicRedirect(props)} />
      <Route component={redirectTo404} />
    </Switch>
  </div>
)

const checkLoggedIn = (props: IAcademyProps) => {
  const token = qs.parse(props.location.search).token
  if (token !== undefined) {
    props.changeToken(token) // just received a callback from IVLE
    props.fetchUsername()
    return
  } else if (props.token === undefined) {
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
