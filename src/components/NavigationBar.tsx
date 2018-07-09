import { Alignment, Icon, Navbar, NavbarGroup, NavbarHeading } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

import { Role } from '../reducers/states'
import Status from './academy/Status'

export interface INavigationBarProps {
  title: string
  username?: string
  role?: Role
}

const NavigationBar: React.SFC<INavigationBarProps> = props => (
  <Navbar className="NavigationBar primary-navbar pt-dark">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/academy"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading className="hidden-xs">Source Academy</NavbarHeading>
      </NavLink>

      <NavLink
        to="/news"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FEED} />
        <div className="navbar-button-text hidden-xs">News</div>
      </NavLink>

      <NavLink
        to="/material"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        <div className="navbar-button-text hidden-xs">Material</div>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text hidden-xs">Playground</div>
      </NavLink>

      {props.username !== undefined && props.role !== undefined ? (
        <Status username={props.username} role={props.role} />
      ) : (
        undefined
      )}
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
