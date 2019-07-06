import {
  Alignment,
  Button,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../reducers/states';
import { LINKS } from '../utils/constants';
import Dropdown from './dropdown';

export interface INavigationBarProps {
  handleLogOut: () => void;
  role?: Role;
  title: string;
  name?: string;
}

const NavigationBar: React.SFC<INavigationBarProps> = props => (
  <Navbar className="NavigationBar primary-navbar bp3-dark">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName="bp3-active"
        className="NavigationBar__link bp3-button bp3-minimal"
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading className="hidden-xs">Source Academy</NavbarHeading>
      </NavLink>

      <a
        className="NavigationBar__link"
        href={LINKS.LUMINUS}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button minimal={true}>
          <Icon icon={IconNames.BOOK} />
          <div className="navbar-button-text hidden-xs">News &amp; Material</div>
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
          <div className="navbar-button-text hidden-xs">Forum</div>
        </Button>
      </a>

      <NavLink
        activeClassName="bp3-active"
        className="NavigationBar__link bp3-button bp3-minimal"
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text hidden-xs">Playground</div>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      {/* To be reintroduced in the future */}
      {/* <NavLink
        activeClassName="bp3-active"
        className="NavigationBar__link bp3-button bp3-minimal"
        to="/mission-control"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text hidden-xs">Mission-Control</div>
      </NavLink> */}

      <NavLink
        activeClassName="bp3-active"
        className="NavigationBar__link bp3-button bp3-minimal"
        to="/contributors"
      >
        <Icon icon={IconNames.HEART} />
        <div className="navbar-button-text hidden-xs">Contributors</div>
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
