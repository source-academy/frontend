import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/academy/missions"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs">Missions</div>
      </NavLink>

      <NavLink
        to="/academy/sidequests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.LIGHTBULB} />
        <div className="navbar-button-text hidden-xs">Sidequests</div>
      </NavLink>

      <NavLink
        to="/academy/paths"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        <div className="navbar-button-text hidden-xs">Paths</div>
      </NavLink>

      <NavLink
        to="/academy/contests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.COMPARISON} />
        <div className="navbar-button-text hidden-xs">Contests</div>
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
