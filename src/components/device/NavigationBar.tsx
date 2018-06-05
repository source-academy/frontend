import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/device/missions"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FLAME} />
        Missions
      </NavLink>
      <NavLink
        to="/device/sidequests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.LIGHTBULB} />
        Sidequests
      </NavLink>
      <NavLink
        to="/device/paths"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        Paths
      </NavLink>
      <NavLink
        to="/device/contests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.COMPARISON} />
        Contests
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to="/device/announcements"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FEED} />
        Announcements
      </NavLink>
      <NavLink
        to="/device/materials"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        Materials
      </NavLink>
      <NavLink
        to="/device/status"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.USER} />
        Profile
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
