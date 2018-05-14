import * as React from 'react'

import { Icon, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import { NavLink } from 'react-router-dom'

export interface INavigationBarProps {
  title: string
}

const NavigationBar: React.SFC<INavigationBarProps> = ({ title }) => (
  <Navbar className="NavigationBar pt-dark">
    <NavbarGroup>
      <NavbarHeading>{title}</NavbarHeading>
      <NavbarDivider />
      <NavLink
        to="/dashboard"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="dashboard" />
        Dashboard
      </NavLink>
    </NavbarGroup>

    <NavbarGroup className="pt-align-right">
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon="dashboard" />
        Playground
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
