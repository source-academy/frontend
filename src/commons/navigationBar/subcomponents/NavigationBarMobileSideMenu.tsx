import { Classes, Drawer, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { AssessmentType } from '../../assessment/AssessmentTypes';
import NotificationBadgeContainer from '../../notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';
import { icons } from './AcademyNavigationBar';

type NavigationBarMobileSideMenuProps = DrawerProps & OwnProps;

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type OwnProps = {
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes: AssessmentType[];
};

const NavigationBarMobileSideMenu: React.FC<NavigationBarMobileSideMenuProps> = props => (
  <Drawer
    isOpen={props.isOpen}
    position="left"
    onClose={props.onClose}
    title=""
    className={Classes.DARK}
  >
    {props.assessmentTypes?.map((assessmentType, idx) => (
      <NavLink
        to={`/academy/${assessmentType.toLowerCase()}`}
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link__mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        onClick={props.onClose}
      >
        <Icon icon={icons[idx]} />
        <div>{assessmentType}</div>
        <NotificationBadgeContainer
          notificationFilter={filterNotificationsByType(assessmentType)}
          disableHover={true}
        />
      </NavLink>
    ))}

    {props.enableSourcecast && (
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link__mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        to="/sourcecast"
        onClick={props.onClose}
      >
        <Icon icon={IconNames.MUSIC} />
        <div>Sourcecast</div>
      </NavLink>
    )}

    <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames(
        'NavigationBar__link__mobile',
        Classes.BUTTON,
        Classes.MINIMAL,
        Classes.LARGE
      )}
      to="/playground"
      onClick={props.onClose}
    >
      <Icon icon={IconNames.CODE} />
      <div>Playground</div>
    </NavLink>

    <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames(
        'NavigationBar__link_mobile',
        Classes.BUTTON,
        Classes.MINIMAL,
        Classes.LARGE
      )}
      to="/githubassessments/missions"
      onClick={props.onClose}
    >
      <Icon icon={IconNames.BRIEFCASE} />
      <div className="navbar-button-text">GitHub Assessments</div>
    </NavLink>

    {props.enableAchievements && (
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link__mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        to="/achievement"
        onClick={props.onClose}
      >
        <Icon icon={IconNames.MOUNTAIN} />
        <div>Achievement</div>
      </NavLink>
    )}
  </Drawer>
);

export default NavigationBarMobileSideMenu;
