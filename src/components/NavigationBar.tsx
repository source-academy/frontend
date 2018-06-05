import { Icon, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

export interface INavigationBarProps {
  title: string
}

const NavigationBar: React.SFC<INavigationBarProps> = ({ title }) => (
  <Navbar className="NavigationBar pt-dark">
    <NavbarGroup className="pt-align-left">
      <NavbarHeading>{title}</NavbarHeading>
      <NavbarDivider />
      <NavLink
        to="/game"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.STAR_EMPTY} />
        Game
      </NavLink>
      <NavLink
        to="/device"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.DASHBOARD} />
        Device
      </NavLink>
      <NavLink
        to="/admin"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="eye-open" />
        Admin
      </NavLink>
    </NavbarGroup>

    <NavbarGroup className="pt-align-right">
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.CODE} />
        Playground
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
