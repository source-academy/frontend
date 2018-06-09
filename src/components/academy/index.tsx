import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import Game from '../../containers/GameContainer'
import AcademyNavigationBar from './NavigationBar'

type AcademyProps = StateProps

export type StateProps = {
  token?: string
}

// export class Academy extends React.Component<AcademyProps, {}> {
export const Academy: React.SFC<AcademyProps> = props => (
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

const checkLoggedIn = (props: AcademyProps) =>
  props.token === undefined ? <Route component={redirectToLogin} /> : undefined

const redirectTo404 = () => <Redirect to="/404" />

const redirectToLogin = () => <Redirect to="/login" />

const redirectToGame = () => <Redirect to="/academy/game" />

export default Academy
