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
        <div className="navbar-button hidden-xs">News</div>
      </NavLink>

      <NavLink
        to="/material"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        <div className="navbar-button hidden-xs">Material</div>
      </NavLink>

      <NavLink
        to="/admin"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.EYE_OPEN} />
        <div className="navbar-button hidden-xs">Admin</div>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button hidden-xs">Playground</div>
      </NavLink>

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>

      {props.username === undefined ? (
        undefined
      ) : (
        <>
          <div className="hidden-xs">
            <NavbarDivider className="default-divider" />
          </div>
          <NavLink
            to="/status"
            activeClassName="pt-active"
            className="NavigationBar__link pt-button pt-minimal"
          >
            <Icon icon={IconNames.USER} />
            {props.username}
          </NavLink>
        </>
      )}
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
