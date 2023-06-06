import { Classes, Drawer, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import NotificationBadge from 'src/commons/notificationBadge/NotificationBadge';
import { filterNotificationsByType } from 'src/commons/notificationBadge/NotificationBadgeHelper';
import Constants from 'src/commons/utils/Constants';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { icons } from './AcademyNavigationBar';

type NavigationBarMobileSideMenuProps = DrawerProps & OwnProps;

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type OwnProps = {
  assessmentTypes?: AssessmentType[];
};

const NavigationBarMobileSideMenu: React.FC<NavigationBarMobileSideMenuProps> = props => {
  const { name, role, courseId, enableAchievements, enableSourcecast } = useTypedSelector(
    state => state.session
  );

  return (
    <Drawer
      isOpen={props.isOpen}
      position="left"
      onClose={props.onClose}
      title=""
      className={Classes.DARK}
    >
      {role ? (
        props.assessmentTypes?.map((assessmentType, idx) => (
          <NavLink
            to={`/courses/${courseId}/${assessmentTypeLink(assessmentType)}`}
            className={({ isActive }) =>
              classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE,
                { [Classes.ACTIVE]: isActive }
              )
            }
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

      {role && enableSourcecast && (
        <NavLink
          className={({ isActive }) =>
            classNames(
              'NavigationBar__link__mobile',
              Classes.BUTTON,
              Classes.MINIMAL,
              Classes.LARGE,
              { [Classes.ACTIVE]: isActive }
            )
          }
          to={`/courses/${courseId}/sourcecast`}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.MUSIC} />
          <div>Sourcecast</div>
        </NavLink>
      )}

      {role && (
        <NavLink
          className={({ isActive }) =>
            classNames(
              'NavigationBar__link__mobile',
              Classes.BUTTON,
              Classes.MINIMAL,
              Classes.LARGE,
              { [Classes.ACTIVE]: isActive }
            )
          }
          to="/playground"
          onClick={props.onClose}
        >
          <Icon icon={IconNames.CODE} />
          <div>Playground</div>
        </NavLink>
      )}

      {Constants.enableGitHubAssessments && (
        <NavLink
          className={({ isActive }) =>
            classNames(
              'NavigationBar__link_mobile',
              Classes.BUTTON,
              Classes.MINIMAL,
              Classes.LARGE,
              { [Classes.ACTIVE]: isActive }
            )
          }
          to="/githubassessments"
          onClick={props.onClose}
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div className="navbar-button-text">Classroom</div>
        </NavLink>
      )}
      {name && (
        <NavLink
          className={({ isActive }) =>
            classNames(
              'NavigationBar__link_mobile',
              Classes.BUTTON,
              Classes.MINIMAL,
              Classes.LARGE,
              { [Classes.ACTIVE]: isActive }
            )
          }
          to={`/sicpjs/`}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.BOOK} />
          <div className="navbar-button-text">SICP JS</div>
        </NavLink>
      )}
      {role && enableAchievements && (
        <NavLink
          className={({ isActive }) =>
            classNames(
              'NavigationBar__link__mobile',
              Classes.BUTTON,
              Classes.MINIMAL,
              Classes.LARGE,
              { [Classes.ACTIVE]: isActive }
            )
          }
          to={`/courses/${courseId}/achievements`}
          onClick={props.onClose}
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div>Achievements</div>
        </NavLink>
      )}
    </Drawer>
  );
};

export default NavigationBarMobileSideMenu;
