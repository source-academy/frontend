import { Card } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import MissionsContainer from '../../containers/device/MissionsContainer'
import LoginContainer from '../../containers/LoginContainer'
import DeviceNavigationBar from './NavigationBar'

const redirectToMissions = () => <Redirect to="/academy/missions" />

const Academy: React.SFC<{}> = () => {
  const redirectTo404 = () => <Redirect to="/404" />

  return (
    <div className="Device">
      <LoginContainer />
      <DeviceNavigationBar />
      <div className="row center-xs">
        <div className="col-xs-10 device-content-parent">
          <Card className="device-content" elevation={1}>
            <Switch>
              <Route path="/academy/missions" component={MissionsContainer} />
              <Route path="/academy/sidequests" component={MissionsContainer} />
              <Route path="/academy/paths" component={MissionsContainer} />
              <Route path="/academy/contests" component={MissionsContainer} />
              <Route exact={true} path="/academy" component={redirectToMissions} />
              <Route component={redirectTo404} />
            </Switch>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Academy
