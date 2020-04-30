import {
  Alignment,
  // Button,
  Classes,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup
  // NavbarHeading
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../reducers/states';
// import { LINKS } from '../utils/constants';
import Dropdown from './dropdown';

export interface INavigationBarProps {
  handleLogOut: () => void;
  role?: Role;
  title: string;
  name?: string;
}

const NavigationBar: React.SFC<INavigationBarProps> = props => (
  <Navbar className={classNames('NavigationBar', 'primary-navbar', Classes.DARK)}>
    <NavbarGroup align={Alignment.LEFT}>
      {/* 
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading className="hidden-xs hidden-sm">Source Academy</NavbarHeading>
      </NavLink>
     */}

      {/*
      <a
        className="NavigationBar__link"
        href={LINKS.LUMINUS}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button minimal={true}>
          <Icon icon={IconNames.ENVELOPE} />
          <div className="navbar-button-text hidden-xs hidden-sm">News</div>
        </Button>
      </a>

      <a
        className="NavigationBar__link"
        href={LINKS.PIAZZA}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button minimal={true}>
          <Icon icon={IconNames.CHAT} />
          <div className="navbar-button-text hidden-xs hidden-sm">Forum</div>
        </Button>
      </a>
     */}

      {/*
      <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      to="/material"
      >
      <Icon icon={IconNames.BOOK} />
      <div className="navbar-button-text hidden-xs hidden-sm">Material</div>
      </NavLink>

      <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      to="/sourcecast"
      >
      <Icon icon={IconNames.MUSIC} />
      <div className="navbar-button-text hidden-xs hidden-sm">Sourcecast</div>
      </NavLink>
     */}

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text hidden-xs hidden-sm">Source Academy Playground</div>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      {/* To be reintroduced in the future */}
      {/* <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/mission-control"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text hidden-xs hidden-sm">Mission-Control</div>
      </NavLink> */}

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/contributors"
      >
        <Icon icon={IconNames.HEART} />
        <div className="navbar-button-text hidden-xs hidden-sm">Contributors</div>
      </NavLink>

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>
      <div className="hidden-xs">
        <NavbarDivider className="default-divider" />
      </div>

      <Dropdown handleLogOut={props.handleLogOut} name={props.name} />
    </NavbarGroup>
  </Navbar>
);

export default NavigationBar;
