import * as qs from 'query-string'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import Game from '../../containers/GameContainer'
import AcademyNavigationBar from './NavigationBar'

interface IAcademyProps extends IDispatchProps, RouteComponentProps<{}>, IStateProps {}

export interface IDispatchProps {
  changeToken: (token: string) => void
  startChangeUsername: () => void
}

export interface IStateProps {
  token?: string
}

export const Academy: React.SFC<IAcademyProps> = props => (
  <div className="Academy">
    <AcademyNavigationBar />
    <Switch>
      {checkLoggedIn(props)}
      <Route path="/academy/contests" component={MissionsContainer} />
      <Route path="/academy/game" component={Game} />
      <Route path="/academy/missions" component={MissionsContainer} />
      <Route path="/academy/paths" component={MissionsContainer} />
      <Route path="/academy/sidequests" component={MissionsContainer} />
      <Route exact={true} path="/academy" component={redirectToGame} />
      <Route component={redirectTo404} />
    </Switch>
  </div>
)

const checkLoggedIn = (props: IAcademyProps) => {
  const token = qs.parse(props.location.search).token
  if (token !== undefined) {
    props.changeToken(token) // just received a callback from IVLE
    props.startChangeUsername()
    return
  } else if (props.token === undefined) {
    return <Route component={redirectToLogin} />
  } else {
    return
  }
}

const redirectTo404 = () => <Redirect to="/404" />

const redirectToLogin = () => <Redirect to="/login" />

const redirectToGame = () => <Redirect to="/academy/game" />

export default Academy
