import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import Game from '../../containers/GameContainer'
import AcademyNavigationBar from './NavigationBar'

interface IAcademyProps extends RouteComponentProps<{}>, StateProps {}

export type StateProps = {
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
  alert(props.location.search)
  return props.token === undefined ? <Route component={redirectToLogin} /> : undefined
}

const redirectTo404 = () => <Redirect to="/404" />

const redirectToLogin = () => <Redirect to="/login" />

const redirectToGame = () => <Redirect to="/academy/game" />

export default Academy
