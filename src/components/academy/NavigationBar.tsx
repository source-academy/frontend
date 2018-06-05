import { Alignment, Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

const NavigationBar: React.SFC<{}> = () => (
  <Navbar className="NavigationBar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/academy/game"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.STAR_EMPTY} />
        Game
      </NavLink>
      <NavLink
        to="/academy/missions"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FLAME} />
        Missions
      </NavLink>
      <NavLink
        to="/academy/sidequests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.LIGHTBULB} />
        Sidequests
      </NavLink>
      <NavLink
        to="/academy/paths"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        Paths
      </NavLink>
      <NavLink
        to="/academy/contests"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.COMPARISON} />
        Contests
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
