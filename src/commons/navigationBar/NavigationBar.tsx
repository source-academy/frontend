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
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated-icons/16px/blueprint-icons-16';
import { Popover2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import { Location } from 'history';
import { useCallback, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import classes from 'src/styles/NavigationBar.module.scss';

import Dropdown from '../dropdown/Dropdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { useResponsive, useSession } from '../utils/Hooks';
import AcademyNavigationBar, {
  assessmentTypesToNavlinkInfo,
  getAcademyNavbarRightInfo
} from './subcomponents/AcademyNavigationBar';
import NavigationBarLangSelectButton from './subcomponents/NavigationBarLangSelectButton';
import SicpNavigationBar from './subcomponents/SicpNavigationBar';

export type NavbarEntryInfo = {
  to: string;
  icon: BlueprintIcons_16Id;
  text: string;
  disabled?: boolean; // entry is not rendered when disabled
  hasNotifications?: boolean; // whether to render NotificationBadge
  hiddenInBreakpoints?: ('xs' | 'sm' | 'md' | 'lg')[]; // hide text in Blueprint breakpoints
};

type CreateNavlinkFunction = (navbarEntry: NavbarEntryInfo) => React.ReactElement;

const NavigationBar: React.FC = () => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = useState(false);
  const { isMobileBreakpoint } = useResponsive();
  const location = useLocation();
  const {
    isLoggedIn,
    isEnrolledInACourse,
    role,
    courseId,
    courseShortName,
    enableAchievements,
    enableSourcecast,
    enableStories,
    assessmentConfigurations
  } = useSession();
  const assessmentTypes = useMemo(
    () => assessmentConfigurations?.map(c => c.type),
    [assessmentConfigurations]
  );

  FocusStyleManager.onlyShowFocusOnTabs();

  const createMobileNavlink: CreateNavlinkFunction = useCallback(
    navbarEntry => (
      <NavLink
        to={navbarEntry.to}
        className={({ isActive }) =>
          classNames(Classes.BUTTON, Classes.MINIMAL, Classes.LARGE, { [Classes.ACTIVE]: isActive })
        }
        onClick={() => setMobileSideMenuOpen(false)}
        key={navbarEntry.text}
      >
        <Icon icon={navbarEntry.icon} />
        <div>{navbarEntry.text}</div>
        {navbarEntry.hasNotifications && (
          <NotificationBadge
            notificationFilter={filterNotificationsByType(navbarEntry.text)}
            disableHover={true}
          />
        )}
      </NavLink>
    ),
    [setMobileSideMenuOpen]
  );

  const wrapWithMobileHamburger = (navlinks: (React.ReactElement | null)[]) => {
    // Don't render drawer when there are 0 navlinks in it
    const nonNullNavlinks = navlinks.filter(e => e !== null);
    const renderDrawer = nonNullNavlinks.length > 0;

    return (
      <NavbarGroup align={Alignment.LEFT}>
        {renderDrawer && (
          <Button
            onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
            icon={IconNames.MENU}
            large={true}
            minimal={true}
          />
        )}
        <NavLink
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to={
            Constants.playgroundOnly ? '/' : courseId == null ? '/welcome' : `/courses/${courseId}`
          }
        >
          <Icon icon={IconNames.SYMBOL_DIAMOND} />
          <NavbarHeading style={{ paddingBottom: '0px' }}>
            {courseShortName || Constants.sourceAcademyDeploymentName}
          </NavbarHeading>
        </NavLink>
        {renderDrawer && (
          <Drawer
            isOpen={mobileSideMenuOpen}
            position="left"
            onClose={() => setMobileSideMenuOpen(false)}
            title=""
            className={Classes.DARK}
            style={{ overflowY: 'auto' }}
          >
            {navlinks}
          </Drawer>
        )}
      </NavbarGroup>
    );
  };

  const fullAcademyNavbarLeftAssessmentsInfo: NavbarEntryInfo[] = useMemo(
    () =>
      assessmentTypesToNavlinkInfo({
        assessmentTypes,
        courseId,
        isEnrolledInACourse
      }),
    [assessmentTypes, courseId, isEnrolledInACourse]
  );

  const fullAcademyNavbarLeftCommonInfo: NavbarEntryInfo[] = useMemo(() => {
    return [
      {
        to: `/courses/${courseId}/sourcecast`,
        icon: IconNames.MUSIC,
        text: 'Sourcecast',
        disabled: !(isEnrolledInACourse && enableSourcecast)
      },
      {
        to: '/playground',
        icon: IconNames.CODE,
        text: 'Playground',
        disabled: !isEnrolledInACourse
      },
      {
        to: '/githubassessments',
        icon: IconNames.BRIEFCASE,
        text: 'Classroom',
        disabled: !Constants.enableGitHubAssessments
      },
      {
        to: '/sicpjs',
        icon: IconNames.BOOK,
        text: 'SICP JS',
        disabled: !isLoggedIn
      },
      {
        to: `/courses/${courseId}/achievements`,
        icon: IconNames.MOUNTAIN,
        text: 'Achievements',
        disabled: !(isEnrolledInACourse && enableAchievements)
      },
      {
        to: `/courses/${courseId}/stories`,
        icon: IconNames.GIT_REPO,
        text: 'Stories',
        // TODO: Enable for public deployment
        disabled: !(isEnrolledInACourse && enableStories)
      }
    ];
  }, [
    courseId,
    isEnrolledInACourse,
    enableSourcecast,
    enableStories,
    isLoggedIn,
    enableAchievements
  ]);

  const fullAcademyMobileNavbarLeftAdditionalInfo = useMemo(
    () => getAcademyNavbarRightInfo({ isEnrolledInACourse, courseId, role }),
    [isEnrolledInACourse, courseId, role]
  );

  const fullAcademyMobileNavbarLeftInfoWithAssessments: NavbarEntryInfo[] = useMemo(() => {
    return [
      ...fullAcademyNavbarLeftAssessmentsInfo,
      ...fullAcademyNavbarLeftCommonInfo,
      ...fullAcademyMobileNavbarLeftAdditionalInfo
    ];
  }, [
    fullAcademyNavbarLeftAssessmentsInfo,
    fullAcademyNavbarLeftCommonInfo,
    fullAcademyMobileNavbarLeftAdditionalInfo
  ]);

  const renderPlaygroundOnlyNavbarLeftDesktop = () => (
    <NavbarGroup align={Alignment.LEFT}>
      {renderNavlinksFromInfo(playgroundOnlyNavbarLeftInfo, createDesktopNavlink)}
    </NavbarGroup>
  );

  const renderPlaygroundOnlyNavbarLeftMobile = () =>
    wrapWithMobileHamburger(
      renderNavlinksFromInfo(playgroundOnlyNavbarLeftInfo, createMobileNavlink)
    );

  const renderFullAcademyNavbarLeftDesktop = () => {
    const desktopNavbarLeftPopoverContent = (
      <Navbar>
        <NavbarGroup>
          {renderNavlinksFromInfo(
            assessmentTypesToNavlinkInfo({
              assessmentTypes,
              courseId,
              isEnrolledInACourse
            }),
            createDesktopNavlink
          )}
        </NavbarGroup>
      </Navbar>
    );
    const topNavbarNavlinks = [
      '/playground',
      '/sicpjs',
      '/contributors',
      '/githubassessments',
      `/courses/${courseId}/sourcecast`,
      `/courses/${courseId}/achievements`
    ];
    const enableDesktopPopover =
      courseId != null && !!topNavbarNavlinks.find(x => location.pathname.startsWith(x));
    const highlightDesktopLogo = (location: Location) => {
      // Highlight main logo when none of the topmost-blue navbar links are active
      return !topNavbarNavlinks.find(x => location.pathname.startsWith(x));
    };

    return (
      <NavbarGroup align={Alignment.LEFT}>
        <Popover2
          position={Position.BOTTOM_RIGHT}
          interactionKind="hover"
          content={desktopNavbarLeftPopoverContent}
          popoverClassName={'desktop-navbar-popover'}
          disabled={!enableDesktopPopover}
        >
          <NavLink
            className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
              [Classes.ACTIVE]: highlightDesktopLogo(location)
            })}
            to={courseId == null ? '/welcome' : `/courses/${courseId}`}
          >
            <Icon icon={IconNames.SYMBOL_DIAMOND} />
            <NavbarHeading style={{ paddingBottom: '0px' }}>
              {courseShortName || Constants.sourceAcademyDeploymentName}
            </NavbarHeading>
          </NavLink>
        </Popover2>
        {renderNavlinksFromInfo(fullAcademyNavbarLeftCommonInfo, createDesktopNavlink)}
      </NavbarGroup>
    );
  };

  const renderFullAcademyNavbarLeftMobile = () =>
    wrapWithMobileHamburger(
      renderNavlinksFromInfo(fullAcademyMobileNavbarLeftInfoWithAssessments, createMobileNavlink)
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
      <Navbar
        className={classNames(
          'NavigationBar',
          'primary-navbar',
          classes['primary-navbar'],
          Classes.DARK
        )}
      >
        {Constants.playgroundOnly
          ? isMobileBreakpoint
            ? renderPlaygroundOnlyNavbarLeftMobile()
            : renderPlaygroundOnlyNavbarLeftDesktop()
          : isMobileBreakpoint
          ? renderFullAcademyNavbarLeftMobile()
          : renderFullAcademyNavbarLeftDesktop()}
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
            !Constants.playgroundOnly && isEnrolledInACourse && !isMobileBreakpoint ? (
              <AcademyNavigationBar assessmentTypes={assessmentTypes} />
            ) : null
          }
        />
      </Routes>
    </>
  );
};

const playgroundOnlyNavbarLeftInfo: NavbarEntryInfo[] = [
  {
    to: '/playground',
    icon: IconNames.CODE,
    text: 'Playground'
  },
  {
    to: '/githubassessments',
    icon: IconNames.BRIEFCASE,
    text: 'Classroom',
    disabled: !Constants.enableGitHubAssessments
  },
  {
    to: '/sicpjs',
    icon: IconNames.BOOK,
    text: 'SICP JS'
  }
  // {
  //   to: '/stories',
  //   icon: IconNames.GIT_REPO,
  //   text: 'Stories',
  //   // TODO: Enable for public deployment
  //   disabled: true
  // }
];

export const renderNavlinksFromInfo = (
  navbarEntries: NavbarEntryInfo[],
  createNavlink: CreateNavlinkFunction
): (React.ReactElement | null)[] =>
  navbarEntries.map(entry => {
    if (entry.disabled) {
      return null;
    }

    return createNavlink(entry);
  });

export const createDesktopNavlink: CreateNavlinkFunction = navbarEntry => (
  <NavLink
    className={({ isActive }) =>
      classNames(Classes.BUTTON, Classes.MINIMAL, {
        [Classes.ACTIVE]: isActive
      })
    }
    to={navbarEntry.to}
    key={navbarEntry.text}
    title={navbarEntry.text}
  >
    <Icon icon={navbarEntry.icon} />
    <div className={classNames(navbarEntry.hiddenInBreakpoints?.map(bp => `hidden-${bp}`))}>
      {navbarEntry.text}
    </div>
    {navbarEntry.hasNotifications && (
      <NotificationBadge
        notificationFilter={filterNotificationsByType(navbarEntry.text)}
        disableHover={true}
      />
    )}
  </NavLink>
);

export default NavigationBar;
