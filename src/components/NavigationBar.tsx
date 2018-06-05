import {
  Alignment,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

export interface INavigationBarProps {
  title: string
  username?: string
}

const NavigationBar: React.SFC<INavigationBarProps> = props => (
  <Navbar className="NavigationBar pt-dark">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/academy"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading>Source Academy</NavbarHeading>
      </NavLink>
      <NavLink
        to="/announcements"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FEED} />
        News
      </NavLink>
      <NavLink
        to="/material"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        Material
      </NavLink>
      <NavLink
        to="/admin"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.EYE_OPEN} />
        Admin
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.CODE} />
        Playground
      </NavLink>
      <NavbarDivider />
      <NavLink
        to="/status"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.USER} />
        {props.username === undefined ? 'Not Logged In' : props.username}
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
