import { Classes, Drawer, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Role } from '../../application/ApplicationTypes';
import { AssessmentCategories } from '../../assessment/AssessmentTypes';
import NotificationBadgeContainer from '../../notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';
import Constants from '../../utils/Constants';
import { assessmentCategoryLink } from '../../utils/ParamParseHelper';

type NavigationBarMobileSideMenuProps = DrawerProps & OwnProps;

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type OwnProps = {
  role?: Role;
};

const NavigationBarMobileSideMenu: React.FC<NavigationBarMobileSideMenuProps> = props => (
  <Drawer
    isOpen={props.isOpen}
    position="left"
    onClose={props.onClose}
    title=""
    className={Classes.DARK}
  >
    {props.role && (
      <>
        <NavLink
          to={`/academy/${assessmentCategoryLink(AssessmentCategories.Mission)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.FLAME} />
          <div>Missions</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType(AssessmentCategories.Mission)}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={`/academy/${assessmentCategoryLink(AssessmentCategories.Sidequest)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.LIGHTBULB} />
          <div>Quests</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType(AssessmentCategories.Sidequest)}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
          <div>Paths</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType(AssessmentCategories.Path)}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={`/academy/${assessmentCategoryLink(AssessmentCategories.Contest)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.COMPARISON} />
          <div>Contests</div>
          <NotificationBadgeContainer
            notificationFilter={filterNotificationsByType(AssessmentCategories.Contest)}
            disableHover={true}
          />
        </NavLink>

        <NavLink
          to={`/academy/${assessmentCategoryLink(AssessmentCategories.Practical)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.MANUAL} />
          <div>Others</div>
        </NavLink>
      </>
    )}

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
      to="/githubassessments"
      onClick={props.onClose}
    >
      <Icon icon={IconNames.BRIEFCASE} />
      <div className="navbar-button-text">Classroom</div>
    </NavLink>

    <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames(
        'NavigationBar__link_mobile',
        Classes.BUTTON,
        Classes.MINIMAL,
        Classes.LARGE
      )}
      to="/sicpjs/index"
      onClick={props.onClose}
    >
      <Icon icon={IconNames.BOOK} />
      <div className="navbar-button-text">SICP JS</div>
    </NavLink>

    {props.role && Constants.enableAchievements && (
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
