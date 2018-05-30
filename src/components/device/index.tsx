import { Card, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { NavLink } from 'react-router-dom'

import JournalContainer from '../../containers/device/JournalContainer'
import LoginContainer from '../../containers/LoginContainer'

const redirectToJournal = () => <Redirect to="/device/announcements" />

const Device: React.SFC<{}> = () => {
  const redirectTo404 = () => <Redirect to="/404" />

  return (
    <div className="Device">
      <LoginContainer />
      <Navbar className="NavigationBar pt-dark row">
        <NavbarGroup className="pt-align-left">
          <NavLink
            to="/device/announcements"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="inbox" />
            Announcements
          </NavLink>
          <NavLink
            to="/device/quests"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="book" />
            Quests
          </NavLink>
          <NavLink
            to="/device/materials"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="folder-open" />
            Materials
          </NavLink>
          <NavLink
            to="/device/status"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="user" />
            Status
          </NavLink>
        </NavbarGroup>
      </Navbar>
      <div className="row center-xs">
        <div className="col-xs-10 device-content-parent">
          <Card className="device-content" elevation={1}>
            <Switch>
              <Route path="/device/announcements" component={JournalContainer} />
              <Route path="/device/quests" component={JournalContainer} />
              <Route path="/device/materials" component={JournalContainer} />
              <Route path="/device/status" component={JournalContainer} />
              <Route exact={true} path="/device" component={redirectToJournal} />
              <Route component={redirectTo404} />
            </Switch>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Device
