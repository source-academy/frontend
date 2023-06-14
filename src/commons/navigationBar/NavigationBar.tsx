import {
  Alignment,
  Button,
  Classes,
  Drawer,
  FocusStyleManager,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Position
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import { Location } from 'history';
import * as React from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';

import Dropdown from '../dropdown/Dropdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { useResponsive, useTypedSelector } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import AcademyNavigationBar, { icons } from './subcomponents/AcademyNavigationBar';
import NavigationBarLangSelectButton from './subcomponents/NavigationBarLangSelectButton';
import NavigationBarMobileSideMenu from './subcomponents/NavigationBarMobileSideMenu';
import SicpNavigationBar from './subcomponents/SicpNavigationBar';

const playgroundOnlyNavbarLeftInfo_GitHubEnabled = [
  {
    to: '/playground',
    icon: IconNames.CODE,
    text: 'Playground'
  },
  {
    to: '/githubassessments',
    icon: IconNames.BRIEFCASE,
    text: 'Classroom'
  },
  {
    to: '/sicpjs/',
    icon: IconNames.BOOK,
    text: 'SICP JS'
  }
];

const playgroundOnlyNavbarLeftInfo_GitHubDisabled =
  playgroundOnlyNavbarLeftInfo_GitHubEnabled.filter(
    e => e.text !== 'Classroom' || e.to !== '/githubassessments' || e.icon !== IconNames.BRIEFCASE
  );

const NavigationBar: React.FC = () => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = React.useState(false);
  const { isMobileBreakpoint } = useResponsive();
  const location = useLocation();
  const {
    role,
    name,
    courseId,
    courseShortName,
    enableAchievements,
    enableSourcecast,
    assessmentConfigurations
  } = useTypedSelector(state => state.session);
  const assessmentTypes = React.useMemo(
    () => assessmentConfigurations?.map(c => c.type),
    [assessmentConfigurations]
  );

  FocusStyleManager.onlyShowFocusOnTabs();

  // Handles both the desktop and mobile versions of the playground-only left navbar group
  const playgroundOnlyNavbarLeft = Constants.enableGitHubAssessments ? (
    isMobileBreakpoint ? (
      <NavbarGroup align={Alignment.LEFT}>
        <Button
          onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
          icon={IconNames.MENU}
          large={true}
          minimal={true}
        />
        <NavLink
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/"
        >
          <Icon icon={IconNames.SYMBOL_DIAMOND} />
          <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
        </NavLink>
        <Drawer
          isOpen={mobileSideMenuOpen}
          position="left"
          onClose={() => setMobileSideMenuOpen(false)}
          title=""
          className={Classes.DARK}
        >
          {playgroundOnlyNavbarLeftInfo_GitHubEnabled.map((e, idx) => (
            <NavLink
              to={e.to}
              className={({ isActive }) =>
                classNames(
                  'NavigationBar__link__mobile',
                  Classes.BUTTON,
                  Classes.MINIMAL,
                  Classes.LARGE,
                  { [Classes.ACTIVE]: isActive }
                )
              }
              onClick={() => setMobileSideMenuOpen(false)}
              key={idx}
            >
              <Icon icon={e.icon} />
              <div>{e.text}</div>
            </NavLink>
          ))}
        </Drawer>
      </NavbarGroup>
    ) : (
      <NavbarGroup align={Alignment.LEFT}>
        {playgroundOnlyNavbarLeftInfo_GitHubEnabled.map((e, idx) => (
          <NavLink
            to={e.to}
            className={({ isActive }) =>
              classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
            key={idx}
          >
            <Icon icon={e.icon} />
            <div>{e.text}</div>
          </NavLink>
        ))}
      </NavbarGroup>
    )
  ) : (
    <NavbarGroup align={Alignment.LEFT}>
      {playgroundOnlyNavbarLeftInfo_GitHubDisabled.map((e, idx) => (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to={e.to}
          key={idx}
        >
          <Icon icon={e.icon} />
          <div>{e.text}</div>
        </NavLink>
      ))}
    </NavbarGroup>
  );

  // Handles the Source Academy @ NUS left mobile navbar group
  const mobileNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      {(role || Constants.enableGitHubAssessments) && (
        <Button
          onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
          icon={IconNames.MENU}
          large={true}
          minimal={true}
        />
      )}

      <NavLink
        className={({ isActive }) =>
          classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
            [Classes.ACTIVE]: isActive
          })
        }
        to={courseId == null ? '/welcome' : `/courses/${courseId}`}
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>
          {courseShortName || 'Source Academy @ NUS'}
        </NavbarHeading>
      </NavLink>

      {(role || Constants.enableGitHubAssessments) && (
        <NavigationBarMobileSideMenu
          assessmentTypes={assessmentTypes}
          isOpen={mobileSideMenuOpen}
          onClose={() => setMobileSideMenuOpen(false)}
        />
      )}
    </NavbarGroup>
  );

  const desktopNavbarLeftPopoverContent = (
    <Navbar>
      <NavbarGroup>
        {assessmentTypes?.map((assessmentType, idx) => (
          <NavLink
            to={`/courses/${courseId}/${assessmentTypeLink(assessmentType)}`}
            className={({ isActive }) =>
              classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
                [Classes.ACTIVE]: isActive
              })
            }
            key={assessmentType}
          >
            <Icon icon={icons[idx]} />
            <div className="navbar-button-text">{assessmentType}</div>
            <NotificationBadge
              notificationFilter={filterNotificationsByType(assessmentType)}
              disableHover={true}
            />
          </NavLink>
        ))}
      </NavbarGroup>
    </Navbar>
  );

  const highlightDesktopLogo = React.useCallback(
    (location: Location) => {
      const highlightDesktopSALogoInRoutesExcept = [
        `/courses/${courseId}/sourcecast`,
        `/courses/${courseId}/achievements`
      ];

      return !highlightDesktopSALogoInRoutesExcept.find(x => location.pathname.startsWith(x));
    },
    [courseId]
  );

  const desktopLogoButton = (
    <NavLink
      className={({ isActive }) =>
        classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
          [Classes.ACTIVE]: isActive || highlightDesktopLogo(location)
        })
      }
      to={courseId == null ? '/welcome' : `/courses/${courseId}`}
    >
      <Icon icon={IconNames.SYMBOL_DIAMOND} />
      <NavbarHeading style={{ paddingBottom: '0px' }}>
        {courseShortName || 'Source Academy @ NUS'}
      </NavbarHeading>
    </NavLink>
  );

  const enableDesktopPopoverIn = [
    '/playground',
    '/sicpjs',
    '/contributors',
    `/courses/${courseId}/sourcecast`,
    `/courses/${courseId}/achievements`
  ];
  const enableDesktopPopover =
    courseId != null && !!enableDesktopPopoverIn.find(x => location.pathname.startsWith(x));

  // Handles the Source Academy @ NUS left desktop navbar group
  const desktopNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      {enableDesktopPopover ? (
        <Popover2
          position={Position.BOTTOM_RIGHT}
          interactionKind="hover"
          content={desktopNavbarLeftPopoverContent}
          popoverClassName={'desktop-navbar-popover'}
        >
          {desktopLogoButton}
        </Popover2>
      ) : (
        desktopLogoButton
      )}

      {role && enableSourcecast && (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to={`/courses/${courseId}/sourcecast`}
        >
          <Icon icon={IconNames.MUSIC} />
          <div className="navbar-button-text">Sourcecast</div>
        </NavLink>
      )}
      {role && (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to="/playground"
        >
          <Icon icon={IconNames.CODE} />
          <div className="navbar-button-text">Playground</div>
        </NavLink>
      )}
      {Constants.enableGitHubAssessments && (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to="/githubassessments"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div className="navbar-button-text">Classroom</div>
        </NavLink>
      )}
      {name && (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to={`/sicpjs/`}
        >
          <Icon icon={IconNames.BOOK} />
          <div className="navbar-button-text">SICP JS</div>
        </NavLink>
      )}
      {role && enableAchievements && (
        <NavLink
          className={({ isActive }) =>
            classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: isActive
            })
          }
          to={`/courses/${courseId}/achievements`}
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div className="navbar-button-text">Achievements</div>
        </NavLink>
      )}
    </NavbarGroup>
  );

  const commonNavbarRight = (
    <NavbarGroup align={Alignment.RIGHT}>
      {location.pathname.startsWith('/playground') && <NavigationBarLangSelectButton />}
      <NavLink
        className={({ isActive }) =>
          classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
            [Classes.ACTIVE]: isActive
          })
        }
        to="/contributors"
      >
        <Icon icon={IconNames.HEART} />
      </NavLink>

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>
      <div className="hidden-xs">
        <NavbarDivider className="default-divider" />
      </div>

      <Dropdown />
    </NavbarGroup>
  );

  return (
    <>
      <Navbar className={classNames('NavigationBar', 'primary-navbar', Classes.DARK)}>
        {Constants.playgroundOnly
          ? playgroundOnlyNavbarLeft
          : isMobileBreakpoint
          ? mobileNavbarLeft
          : desktopNavbarLeft}
        {commonNavbarRight}
      </Navbar>

      <Routes>
        <Route path="/playground" element={null} />
        <Route path="/githubassessments/*" element={null} />
        <Route path="/contributors" element={null} />
        <Route path="/courses/:courseId/sourcecast" element={null} />
        <Route path="/courses/:courseId/achievements" element={null} />
        <Route path="/sicpjs/:section?" element={<SicpNavigationBar />} />
        <Route
          path="*"
          element={
            !Constants.playgroundOnly && role && !isMobileBreakpoint ? (
              <AcademyNavigationBar assessmentTypes={assessmentTypes} />
            ) : null
          }
        />
      </Routes>
    </>
  );
};

export default NavigationBar;
