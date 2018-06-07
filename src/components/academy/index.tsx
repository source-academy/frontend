import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import Game from '../../containers/GameContainer'
import AcademyNavigationBar from './NavigationBar'

type AcademyProps = StateProps

export type StateProps = {
  token?: string
}

export class Academy extends React.Component<AcademyProps, {}> {
  public render() {
    return (
      <div className="Academy">
        <AcademyNavigationBar />
        <Switch>
          {this.checkLoggedIn()}
          <Route path="/academy/contests" component={MissionsContainer} />
          <Route path="/academy/game" component={Game} />
          <Route path="/academy/missions" component={MissionsContainer} />
          <Route path="/academy/paths" component={MissionsContainer} />
          <Route path="/academy/sidequests" component={MissionsContainer} />
          <Route exact={true} path="/academy" component={this.redirectToGame} />
          <Route component={this.redirectTo404} />
        </Switch>
      </div>
    )
  }

  private checkLoggedIn() {
    return this.props.token === undefined ? <Route component={this.redirectToLogin} /> : undefined
  }

  private redirectTo404 = () => <Redirect to="/404" />

  private redirectToLogin = () => <Redirect to="/login" />

  private redirectToGame = () => <Redirect to="/academy/game" />
}

export default Academy
