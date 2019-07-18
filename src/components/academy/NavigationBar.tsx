import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../../reducers/states';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategories } from '../assessment/assessmentShape';

import NotificationBadge from '../../components/notification/NotificationBadge';
import { filterNotificationsByType } from '../notification/NotificationHelpers';
import { Notification } from '../notification/notificationShape';

type NavigationBarProps = OwnProps & StateProps;

type OwnProps = {
  role: Role;
};

export type StateProps = {
  notifications: Notification[];
};

const NavigationBar: React.SFC<NavigationBarProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Mission)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs">Missions</div>
        <NotificationBadge
          number={
            filterNotificationsByType(props.notifications, AssessmentCategories.Mission).length
          }
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Sidequest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.LIGHTBULB} />
        <div className="navbar-button-text hidden-xs">Quests</div>
        <NotificationBadge
          number={
            filterNotificationsByType(props.notifications, AssessmentCategories.Sidequest).length
          }
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        <div className="navbar-button-text hidden-xs">Paths</div>
        <NotificationBadge
          number={filterNotificationsByType(props.notifications, AssessmentCategories.Path).length}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Contest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.COMPARISON} />
        <div className="navbar-button-text hidden-xs">Contests</div>
        <NotificationBadge
          number={
            filterNotificationsByType(props.notifications, AssessmentCategories.Contest).length
          }
        />
      </NavLink>
    </NavbarGroup>
    {props.role === Role.Admin || props.role === Role.Staff ? (
      <NavbarGroup align={Alignment.RIGHT}>
        <NavLink
          to={'/academy/grading'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs">Grading</div>
          <NotificationBadge
            number={filterNotificationsByType(props.notifications, 'Grading').length}
          />
        </NavLink>
      </NavbarGroup>
    ) : null}
  </Navbar>
);

export default NavigationBar;
