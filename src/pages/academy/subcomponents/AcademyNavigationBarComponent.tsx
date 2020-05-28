import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../../../commons/application/ApplicationTypes';
import { AssessmentCategories } from '../../../commons/assessment/AssessmentTypes';
import NotificationBadgeContainer from '../../../commons/notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByType } from '../../../commons/notificationBadge/NotificationBadgeHelper';
import { assessmentCategoryLink } from '../../../utils/paramParseHelpers';
import DefaultChapterContainer from './AcademyDefaultChapterContainer';

type OwnProps = {
  role: Role;
};

const AcademyNavigationBar: React.SFC<OwnProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Mission)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs">Missions</div>
        <NotificationBadgeContainer
          notificationFilter={filterNotificationsByType(AssessmentCategories.Mission)}
          disableHover={true}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Sidequest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.LIGHTBULB} />
        <div className="navbar-button-text hidden-xs">Quests</div>
        <NotificationBadgeContainer
          notificationFilter={filterNotificationsByType(AssessmentCategories.Sidequest)}
          disableHover={true}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        <div className="navbar-button-text hidden-xs">Paths</div>
        <NotificationBadgeContainer
          notificationFilter={filterNotificationsByType(AssessmentCategories.Path)}
          disableHover={true}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Contest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.COMPARISON} />
        <div className="navbar-button-text hidden-xs">Contests</div>
        <NotificationBadgeContainer
          notificationFilter={filterNotificationsByType(AssessmentCategories.Contest)}
          disableHover={true}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Practical)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.MANUAL} />
        <div className="navbar-button-text hidden-xs">Practical</div>
      </NavLink>
    </NavbarGroup>
    {props.role === Role.Admin || props.role === Role.Staff ? (
      <NavbarGroup align={Alignment.RIGHT}>
        <DefaultChapterContainer />

        <NavLink
          to={'/academy/groundcontrol'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon="satellite" />
          <div className="navbar-button-text hidden-xs">Ground Control</div>
        </NavLink>

        <NavLink
          to={'/academy/dashboard'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon="globe" />
          <div className="navbar-button-text hidden-xs">Dashboard</div>
        </NavLink>

        <NavLink
          to={'/academy/sourcereel'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.MOBILE_VIDEO} />
          <div className="navbar-button-text hidden-xs">Sourcereel</div>
        </NavLink>

        <NavLink
          to={'/academy/material'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.CLOUD_UPLOAD} />
          <div className="navbar-button-text hidden-xs">Upload</div>
        </NavLink>

        <NavLink
          to={'/academy/grading'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs">Grading</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType('Grading')}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={'/academy/gamedev'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.CROWN} />
          <div className="navbar-button-text hidden-xs">Game Dev</div>
        </NavLink>
      </NavbarGroup>
    ) : null}
  </Navbar>
);

export default AcademyNavigationBar;
