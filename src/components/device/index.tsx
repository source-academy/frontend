import { Card } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'

import AnnouncementsContainer from '../../containers/device/AnnouncementsContainer'
import LoginContainer from '../../containers/LoginContainer'
import DeviceNavigationBar from './NavigationBar'

const redirectToAnnouncements = () => <Redirect to="/device/announcements" />

const Device: React.SFC<{}> = () => {
  const redirectTo404 = () => <Redirect to="/404" />

  return (
    <div className="Device">
      <LoginContainer />
      <DeviceNavigationBar />
      <div className="row center-xs">
        <div className="col-xs-10 device-content-parent">
          <Card className="device-content" elevation={1}>
            <Switch>
              <Route path="/device/announcements" component={AnnouncementsContainer} />
              <Route path="/device/missions" component={AnnouncementsContainer} />
              <Route path="/device/sidequests" component={AnnouncementsContainer} />
              <Route path="/device/paths" component={AnnouncementsContainer} />
              <Route path="/device/contests" component={AnnouncementsContainer} />
              <Route path="/device/materials" component={AnnouncementsContainer} />
              <Route path="/device/status" component={AnnouncementsContainer} />
              <Route exact={true} path="/device" component={redirectToAnnouncements} />
              <Route component={redirectTo404} />
            </Switch>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Device
