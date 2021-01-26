import {
  Alignment,
  Button,
  Classes,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import { NavLink } from 'react-router-dom';

import { Role } from '../application/ApplicationTypes';
import Dropdown from '../dropdown/Dropdown';
import Constants from '../utils/Constants';
import NavigationBarMobileSideMenu from './NavigationBarMobileSideMenu';

type NavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
};

type StateProps = {
  role?: Role;
  title: string;
  name?: string;
};

const NavigationBar: React.FC<NavigationBarProps> = props => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = React.useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const playgroundOnlyNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div>Source Academy Playground</div>
      </NavLink>
    </NavbarGroup>
  );

  const mobileNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <Button
        onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
        icon={IconNames.MENU}
        large={true}
        minimal={true}
      />

      <NavLink
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      <NavigationBarMobileSideMenu
        role={props.role}
        isOpen={mobileSideMenuOpen}
        onClose={() => setMobileSideMenuOpen(false)}
      />
    </NavbarGroup>
  );

  const desktopNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/sourcecast"
      >
        <Icon icon={IconNames.MUSIC} />
        <div className="navbar-button-text">Sourcecast</div>
      </NavLink>

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text">Playground</div>
      </NavLink>

      {props.role && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/achievement"
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div className="navbar-button-text">Achievement</div>
        </NavLink>
      )}
    </NavbarGroup>
  );

  const commonNavbarRight = (
    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/contributors"
      >
        <Icon icon={IconNames.HEART} />
        <div className="navbar-button-text hidden-sm hidden-xs">Contributors</div>
      </NavLink>

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>
      <div className="hidden-xs">
        <NavbarDivider className="default-divider" />
      </div>

      <Dropdown handleLogOut={props.handleLogOut} name={props.name} />
    </NavbarGroup>
  );

  return (
    <>
      <Navbar className={classNames('NavigationBar', 'primary-navbar', Classes.DARK)}>
        {Constants.playgroundOnly
          ? playgroundOnlyNavbarLeft
          : isMobile
          ? mobileNavbarLeft
          : desktopNavbarLeft}
        {commonNavbarRight}
      </Navbar>
    </>
  );
};

export default NavigationBar;
