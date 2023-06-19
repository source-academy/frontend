import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { AssessmentType } from 'src/commons/assessment/AssessmentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { assessmentTypeLink } from 'src/commons/utils/ParamParseHelper';

import { Role } from '../../application/ApplicationTypes';
import NotificationBadge from '../../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../../notificationBadge/NotificationBadgeHelper';

type OwnProps = {
  assessmentTypes?: AssessmentType[];
};

const AcademyNavigationBar: React.FunctionComponent<OwnProps> = props => {
  const { role, courseId } = useTypedSelector(state => state.session);

  return (
    <Navbar className="NavigationBar secondary-navbar">
      <NavbarGroup align={Alignment.LEFT}>
        {props.assessmentTypes?.map((assessmentType, idx) => (
          <NavLink
            to={`/courses/${courseId}/${assessmentTypeLink(assessmentType)}`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
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

      <NavbarGroup align={Alignment.RIGHT}>
        <NavLink
          to={`/courses/${courseId}/notipreference`}
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
        >
          <Icon icon={IconNames.NOTIFICATIONS} />
          <div className="navbar-button-text hidden-xs hidden-sm hidden-md hidden-lg">
            Notifications
          </div>
        </NavLink>
      </NavbarGroup>

      {role === Role.Admin || role === Role.Staff ? (
        <NavbarGroup align={Alignment.RIGHT}>
          <NavLink
            to={`/courses/${courseId}/groundcontrol`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
          >
            <Icon icon={IconNames.SATELLITE} />
            <div className="navbar-button-text hidden-xs hidden-sm">Ground Control</div>
          </NavLink>

          <NavLink
            to={`/courses/${courseId}/dashboard`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
          >
            <Icon icon={IconNames.GLOBE} />
            <div className="navbar-button-text hidden-xs hidden-sm">Dashboard</div>
          </NavLink>

          <NavLink
            to={`/courses/${courseId}/sourcereel`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
          >
            <Icon icon={IconNames.MOBILE_VIDEO} />
            <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Sourcereel</div>
          </NavLink>

          {role === Role.Admin && (
            <NavLink
              to={`/courses/${courseId}/xpcalculation`}
              className={({ isActive }) =>
                classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                  [Classes.ACTIVE]: isActive
                })
              }
            >
              <Icon icon={IconNames.CALCULATOR} />
              <div className="navbar-button-text hidden-xs hidden-sm">XP Calculation</div>
            </NavLink>
          )}

          <NavLink
            to={`/courses/${courseId}/grading`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
          >
            <Icon icon={IconNames.ENDORSED} />
            <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Grading</div>
            <NotificationBadge
              notificationFilter={filterNotificationsByType('Grading')}
              disableHover={true}
            />
          </NavLink>

          <NavLink
            to={`/courses/${courseId}/storysimulator`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
          >
            <Icon icon={IconNames.CROWN} />
            <div className="navbar-button-text hidden-xs hidden-sm hidden-md">Story Simulator</div>
          </NavLink>

          {role === Role.Admin && (
            <NavLink
              to={`/courses/${courseId}/adminpanel`}
              className={({ isActive }) =>
                classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                  [Classes.ACTIVE]: isActive
                })
              }
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
};

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
