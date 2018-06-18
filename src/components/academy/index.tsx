import * as qs from 'query-string'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import Game from '../../containers/GameContainer'
import { isAcademyRe } from '../../reducers/session'
import { HistoryHelper } from '../../utils/history'
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

export const Academy: React.SFC<IAcademyProps> = props => (
  <div className="Academy">
    <AcademyNavigationBar />
    <Switch>
      {checkLoggedIn(props)}
      {alreadyInAcademy(props)}
      <Route path="/academy/contests" component={MissionsContainer} />
      <Route path="/academy/game" component={Game} />
      <Route exact={true} path="/academy/missions" component={MissionsContainer} />
      <Route path="/academy/missions/:missionId" component={MissionsContainer} />
      <Route path="/academy/paths" component={MissionsContainer} />
      <Route path="/academy/sidequests" component={MissionsContainer} />
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
