import { Classes, Drawer, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Role } from 'src/commons/application/ApplicationTypes';
import Constants from 'src/commons/utils/Constants';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { AssessmentType } from '../../assessment/AssessmentTypes';
import NotificationBadge from '../../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';
import { icons } from './AcademyNavigationBar';

type NavigationBarMobileSideMenuProps = DrawerProps & OwnProps;

type DrawerProps = {
  name?: string;
  role?: Role;
  isOpen: boolean;
  onClose: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type OwnProps = {
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes?: AssessmentType[];
  courseId?: number;
};

const NavigationBarMobileSideMenu: React.FC<NavigationBarMobileSideMenuProps> = props => (
  <Drawer
    isOpen={props.isOpen}
    position="left"
    onClose={props.onClose}
    title=""
    className={Classes.DARK}
  >
    {props.role ? (
      props.assessmentTypes?.map((assessmentType, idx) => (
        <NavLink
          to={`/courses/${props.courseId}/${assessmentTypeLink(assessmentType)}`}
          activeClassName={Classes.ACTIVE}
          className={classNames(
            'NavigationBar__link__mobile',
            Classes.BUTTON,
            Classes.MINIMAL,
            Classes.LARGE
          )}
          onClick={props.onClose}
          key={idx}
        >
          <Icon icon={icons[idx]} />
          <div>{assessmentType}</div>
          <NotificationBadge
            notificationFilter={filterNotificationsByType(assessmentType)}
            disableHover={true}
          />
        </NavLink>
      ))
    ) : (
      <></>
    )}

    {props.role && props.enableSourcecast && (
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link__mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        to={`/courses/${props.courseId}/sourcecast`}
        onClick={props.onClose}
      >
        <Icon icon={IconNames.MUSIC} />
        <div>Sourcecast</div>
      </NavLink>
    )}

    {props.role && (
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
    )}

    {Constants.enableGitHubAssessments && (
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
    )}
    {props.name && (
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link_mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        to={`/sicpjs/`}
        onClick={props.onClose}
      >
        <Icon icon={IconNames.BOOK} />
        <div className="navbar-button-text">SICP JS</div>
      </NavLink>
    )}
    {props.role && props.enableAchievements && (
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames(
          'NavigationBar__link__mobile',
          Classes.BUTTON,
          Classes.MINIMAL,
          Classes.LARGE
        )}
        to={`/courses/${props.courseId}/achievements`}
        onClick={props.onClose}
      >
        <Icon icon={IconNames.MOUNTAIN} />
        <div>Achievements</div>
      </NavLink>
    )}
  </Drawer>
);

export default NavigationBarMobileSideMenu;
