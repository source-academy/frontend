import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { Role } from '../../application/ApplicationTypes';
import NotificationBadgeContainer from '../../notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';

type OwnProps = {
  role: Role;
  assessmentTypes?: AssessmentType[];
};

const AcademyNavigationBar: React.FunctionComponent<OwnProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      {props.assessmentTypes?.map((assessmentType, idx) => (
        <NavLink
          to={`/academy/${assessmentTypeLink(assessmentType)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          key={assessmentType}
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
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Sourcereel</div>
        </NavLink>

        <NavLink
          to={'/academy/grading'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Grading</div>
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

        {props.role === Role.Admin && (
          <NavLink
            to={'/academy/adminpanel'}
            activeClassName={Classes.ACTIVE}
            className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          >
            <Icon icon={IconNames.SETTINGS} />
            <div className="navbar-button-text hidden-xs hidden-sm hidden-md hidden-lg">
              Admin Panel
            </div>
          </NavLink>
        )}
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
