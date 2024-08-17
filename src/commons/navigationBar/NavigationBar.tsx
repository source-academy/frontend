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
  Popover,
  Position
} from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { Translation } from 'react-i18next';
import { Location, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { i18nDefaultLangKeys } from 'src/i18n/i18next';
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
  icon: IconName;
  text: string;
  disabled?: boolean; // entry is not rendered when disabled
  hasNotifications?: boolean; // whether to render NotificationBadge
  hiddenInBreakpoints?: ('xs' | 'sm' | 'md' | 'lg')[]; // hide text in Blueprint breakpoints
};

const MobileHamburger: React.FC<{ navlinks: NavbarEntryInfo[] }> = ({ navlinks }) => {
  // Don't render drawer when there are 0 navlinks in it
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = useState(false);
  const shownNavlinks = navlinks.filter(e => !e.disabled);
  const renderDrawer = shownNavlinks.length > 0;

  const { courseShortName, courseId } = useSession();

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
        className="NavigationBar__link"
        to={Constants.playgroundOnly ? '/' : courseId == null ? '/welcome' : `/courses/${courseId}`}
      >
        <NavbarHeading>
          <Button className="app-title" minimal icon={IconNames.SYMBOL_DIAMOND}>
            {courseShortName || Constants.sourceAcademyDeploymentName}
          </Button>
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
          {shownNavlinks.map((entry, i) => (
            <MobileNavLink key={i} {...entry} handleClick={() => setMobileSideMenuOpen(false)} />
          ))}
        </Drawer>
      )}
    </NavbarGroup>
  );
};

const NavigationBar: React.FC = () => {
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
      {playgroundOnlyNavbarLeftInfo.map((entry, i) => (
        <DesktopNavLink key={i} {...entry} />
      ))}
    </NavbarGroup>
  );

  const renderPlaygroundOnlyNavbarLeftMobile = () => (
    <MobileHamburger navlinks={playgroundOnlyNavbarLeftInfo} />
  );

  const renderFullAcademyNavbarLeftDesktop = () => {
    const entries = assessmentTypesToNavlinkInfo({
      assessmentTypes,
      courseId,
      isEnrolledInACourse
    });

    const desktopNavbarLeftPopoverContent = (
      <Navbar>
        <NavbarGroup>
          {entries.map((entry, i) => (
            <DesktopNavLink key={i} {...entry} />
          ))}
        </NavbarGroup>
      </Navbar>
    );
    const topNavbarNavlinks = [
      '/playground',
      '/sicpjs',
      '/contributors',
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
        <Popover
          position={Position.BOTTOM_RIGHT}
          interactionKind="hover"
          content={desktopNavbarLeftPopoverContent}
          popoverClassName="desktop-navbar-popover"
          disabled={!enableDesktopPopover}
        >
          <NavLink
            className="NavigationBar__link"
            to={courseId == null ? '/welcome' : `/courses/${courseId}`}
          >
            <NavbarHeading>
              <Button
                className="app-title"
                minimal
                icon={IconNames.SYMBOL_DIAMOND}
                active={highlightDesktopLogo(location)}
              >
                {courseShortName || Constants.sourceAcademyDeploymentName}
              </Button>
            </NavbarHeading>
          </NavLink>
        </Popover>
        {fullAcademyNavbarLeftCommonInfo.map((entry, i) => (
          <DesktopNavLink key={i} {...entry} />
        ))}
      </NavbarGroup>
    );
  };

  const renderFullAcademyNavbarLeftMobile = () => (
    <MobileHamburger navlinks={fullAcademyMobileNavbarLeftInfoWithAssessments} />
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

export const DesktopNavLink: React.FC<NavbarEntryInfo> = props => {
  const responsive = useResponsive();
  const shouldHide = props.hiddenInBreakpoints?.some(bp => responsive[bp]);
  return props.disabled ? null : (
    <NavLink
      className={({ isActive }) => classNames(isActive && Classes.ACTIVE)}
      to={props.to}
      key={props.text}
      title={props.text}
    >
      <Button minimal icon={props.icon}>
        {!shouldHide && (
          <Translation ns="commons" keyPrefix="navigationBar">
            {t =>
              t(props.text as keyof i18nDefaultLangKeys['commons']['navigationBar'], {
                defaultValue: props.text
              })
            }
          </Translation>
        )}
      </Button>
      {props.hasNotifications && (
        <NotificationBadge
          notificationFilter={filterNotificationsByType(props.text)}
          disableHover={true}
        />
      )}
    </NavLink>
  );
};

const MobileNavLink: React.FC<
  NavbarEntryInfo & { handleClick?: React.MouseEventHandler<HTMLAnchorElement> }
> = props =>
  props.disabled ? null : (
    <NavLink
      to={props.to}
      className={({ isActive }) => classNames(isActive && Classes.ACTIVE)}
      onClick={props.handleClick}
      key={props.text}
    >
      <Button minimal large icon={props.icon}>
        <Translation ns="commons" keyPrefix="navigationBar">
          {t =>
            t(props.text as keyof i18nDefaultLangKeys['commons']['navigationBar'], {
              defaultValue: props.text
            })
          }
        </Translation>
      </Button>
      {props.hasNotifications && (
        <NotificationBadge
          notificationFilter={filterNotificationsByType(props.text)}
          disableHover={true}
        />
      )}
    </NavLink>
  );

export default NavigationBar;
