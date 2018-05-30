import * as React from 'react'

import { Icon, Navbar, NavbarDivider, NavbarGroup } from '@blueprintjs/core'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar row">
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
)

export default NavigationBar
