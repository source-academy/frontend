import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import MissionsContainer from '../../containers/academy/MissionsContainer'
import LoginContainer from '../../containers/LoginContainer'
import AcademyNavigationBar from './NavigationBar'

const redirectToMissions = () => <Redirect to="/academy/missions" />

const Academy: React.SFC<{}> = () => {
  const redirectTo404 = () => <Redirect to="/404" />

  return (
    <div className="Academy">
      <LoginContainer />
      <AcademyNavigationBar />
      <Switch>
        <Route path="/academy/missions" component={MissionsContainer} />
        <Route path="/academy/sidequests" component={MissionsContainer} />
        <Route path="/academy/paths" component={MissionsContainer} />
        <Route path="/academy/contests" component={MissionsContainer} />
        <Route exact={true} path="/academy" component={redirectToMissions} />
        <Route component={redirectTo404} />
      </Switch>
    </div>
  )
}

export default Academy
