import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../../application/ApplicationTypes';
import NotificationBadgeContainer from '../../notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';

type OwnProps = {
  role: Role;
  assessmentTypes?: string[];
};

const AcademyNavigationBar: React.FunctionComponent<OwnProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      {props.assessmentTypes?.map((assessmentType, idx) => (
        <NavLink
          to={`/academy/${assessmentType}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={icons[idx]} />
          <div className="navbar-button-text hidden-xs hidden-sm">{assessmentType}</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType(assessmentType)}
            disableHover={true}
          />
        </NavLink>
      ))}
    </NavbarGroup>
    {props.role === Role.Admin || props.role === Role.Staff ? (
      <NavbarGroup align={Alignment.RIGHT}>
        <NavLink
          to={'/academy/groundcontrol'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.SATELLITE} />
          <div className="navbar-button-text hidden-xs hidden-sm">Ground Control</div>
        </NavLink>

        <NavLink
          to={'/academy/dashboard'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.GLOBE} />
          <div className="navbar-button-text hidden-xs hidden-sm">Dashboard</div>
        </NavLink>

        <NavLink
          to={'/academy/sourcereel'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.MOBILE_VIDEO} />
          <div className="navbar-button-text hidden-xs hidden-sm">Sourcereel</div>
        </NavLink>

        <NavLink
          to={'/academy/grading'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs hidden-sm">Grading</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType('Grading')}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={'/academy/storysimulator'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.CROWN} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Story Simulator</div>
        </NavLink>
      </NavbarGroup>
    ) : null}
  </Navbar>
);

export const icons: IconName[] = [
  IconNames.FLAME,
  IconNames.LIGHTBULB,
  IconNames.PREDICTIVE_ANALYSIS,
  IconNames.COMPARISON,
  IconNames.MANUAL
];

export default AcademyNavigationBar;
