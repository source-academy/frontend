import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { Role } from '../../application/ApplicationTypes';
import NotificationBadge from '../../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';

type OwnProps = {
  courseId: number;
  role: Role;
  assessmentTypes?: AssessmentType[];
};

const AcademyNavigationBar: React.FunctionComponent<OwnProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      {props.assessmentTypes?.map((assessmentType, idx) => (
        <NavLink
          to={`/courses/${props.courseId}/${assessmentTypeLink(assessmentType)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          key={idx}
        >
          <Icon icon={icons[idx]} />
          <div className="navbar-button-text hidden-xs hidden-sm">{assessmentType}</div>
          <NotificationBadge
            notificationFilter={filterNotificationsByType(assessmentType)}
            disableHover={true}
          />
        </NavLink>
      ))}
    </NavbarGroup>
    {props.role === Role.Admin || props.role === Role.Staff ? (
      <NavbarGroup align={Alignment.RIGHT}>
        <NavLink
          to={`/courses/${props.courseId}/groundcontrol`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.SATELLITE} />
          <div className="navbar-button-text hidden-xs hidden-sm">Ground Control</div>
        </NavLink>

        <NavLink
          to={`/courses/${props.courseId}/dashboard`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.GLOBE} />
          <div className="navbar-button-text hidden-xs hidden-sm">Dashboard</div>
        </NavLink>

        <NavLink
          to={`/courses/${props.courseId}/sourcereel`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.MOBILE_VIDEO} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Sourcereel</div>
        </NavLink>

        {props.role === Role.Admin && (
          <NavLink
            to={`/courses/${props.courseId}/xpcalculation`}
            activeClassName={Classes.ACTIVE}
            className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          >
            <Icon icon={IconNames.CALCULATOR} />
            <div className="navbar-button-text hidden-xs hidden-sm">XP Calculation</div>
          </NavLink>
        )}

        <NavLink
          to={`/courses/${props.courseId}/grading`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Grading</div>
          <NotificationBadge
            notificationFilter={filterNotificationsByType('Grading')}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={`/courses/${props.courseId}/storysimulator`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.CROWN} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Story Simulator</div>
        </NavLink>

        {props.role === Role.Admin && (
          <NavLink
            to={`/courses/${props.courseId}/adminpanel`}
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
  IconNames.MANUAL,
  IconNames.GRAPH,
  IconNames.LAB_TEST,
  IconNames.CALCULATOR
];

export default AcademyNavigationBar;
