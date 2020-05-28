import { Alignment, Classes, Icon, Navbar, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../application/ApplicationTypes';
import Dropdown from '../dropdown/DropdownComponent';

type NavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
};

type StateProps = {
  role?: Role;
  title: string;
  name?: string;
};

const NavigationBar: React.SFC<NavigationBarProps> = props => (
  <Navbar className={classNames('NavigationBar', 'primary-navbar', Classes.DARK)}>
    <NavbarGroup align={Alignment.LEFT}>
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
