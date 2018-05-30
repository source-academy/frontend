import { Card, Icon, Navbar, NavbarDivider, NavbarGroup } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { NavLink } from 'react-router-dom'

import AnnouncementsContainer from '../../containers/device/AnnouncementsContainer'
import LoginContainer from '../../containers/LoginContainer'

const redirectToAnnouncements = () => <Redirect to="/device/announcements" />

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
            <Icon icon="feed" />
            Announcements
          </NavLink>
          <NavbarDivider />
          <NavLink
            to="/device/missions"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="flame" />
            Missions
          </NavLink>
          <NavLink
            to="/device/sidequests"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="lightbulb" />
            Sidequests
          </NavLink>
          <NavLink
            to="/device/paths"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="predictive-analysis" />
            Paths
          </NavLink>
          <NavLink
            to="/device/contests"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="comparison" />
            Contests
          </NavLink>
          <NavbarDivider />
          <NavLink
            to="/device/materials"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon="folder-open" />
            Materials
          </NavLink>
          <NavbarDivider />
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
