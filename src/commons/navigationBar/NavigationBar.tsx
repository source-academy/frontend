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
  Position,
} from '@blueprintjs/core';
import { type IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Translation } from 'react-i18next';
import { type Location, NavLink, useLocation, useMatch } from 'react-router';
import type { i18nDefaultLangKeys } from 'src/i18n/i18next';

import Dropdown from '../dropdown/Dropdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { useAppSelector, useResponsive, useSession } from '../utils/Hooks';
import classes from './NavigationBar.module.css';
import AcademyNavigationBar, {
  assessmentTypesToNavlinkInfo,
  getAcademyNavbarRightInfo,
} from './subcomponents/AcademyNavigationBar';
import NavigationBarLangSelectButton from './subcomponents/NavigationBarLangSelectButton';
import SicpNavigationBar from './subcomponents/SicpNavigationBar';
import SicPyNavigationBar from './subcomponents/SicPyNavigationBar';

export type NavbarEntryInfo = {
  to: string;
  icon: IconName;
  text: string;
  disabled?: boolean; // entry is not rendered when disabled
  hasNotifications?: boolean; // whether to render NotificationBadge
  hiddenInBreakpoints?: ('xs' | 'sm' | 'md' | 'lg')[]; // hide text in Blueprint breakpoints
};

function MobileHamburger({ navlinks }: { navlinks: NavbarEntryInfo[] }) {
  // Don't render drawer when there are 0 navlinks in it
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = useState(false);
  const shownNavlinks = navlinks.filter(e => !e.disabled);
  const renderDrawer = shownNavlinks.length > 0;

  const { courseShortName, courseId } = useSession();

  return (
    <NavbarGroup align={Alignment.START}>
      {renderDrawer && (
        <Button
          onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
          icon={IconNames.MENU}
          size="large"
          variant="minimal"
        />
      )}
      <NavLink
        className="NavigationBar__link"
        to={Constants.playgroundOnly ? '/' : courseId == null ? '/welcome' : `/courses/${courseId}`}
      >
        <NavbarHeading>
          <Button className="app-title" variant="minimal" icon={IconNames.SYMBOL_DIAMOND}>
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
}

function useSecondaryNavbarType() {
  const isPlayground = useMatch('/playground/*');
  const isContributors = useMatch('/contributors');
  const isAchievements = useMatch('/courses/:courseId/achievements/*');
  const isLeaderboard = useMatch('/courses/:courseId/leaderboard/*');
  const isSicp = useMatch('/sicpjs/:section?');
  const isSicpPy = useMatch('/sicpy/:section?');

  const isHidden = isPlayground || isContributors || isAchievements || isLeaderboard;

  if (isSicpPy) {
    return 'sicppy';
  } else if (isSicp) {
    return 'sicp';
  } else if (isHidden) {
    return 'hidden';
  } else {
    return 'academy';
  }
}

function NavigationBar() {
  const { isMobileBreakpoint } = useResponsive();
  const location = useLocation();
  const {
    isLoggedIn,
    isEnrolledInACourse,
    role,
    courseId,
    courseShortName,
    enableAchievements,
    enableOverallLeaderboard,
    enableContestLeaderboard,
    assessmentConfigurations,
  } = useSession();
  const assessmentTypes = useMemo(
    () => assessmentConfigurations?.map(c => c.type),
    [assessmentConfigurations],
  );

  FocusStyleManager.onlyShowFocusOnTabs();

  const fullAcademyNavbarLeftAssessmentsInfo: NavbarEntryInfo[] = useMemo(
    () =>
      assessmentTypesToNavlinkInfo({
        assessmentTypes,
        courseId,
        isEnrolledInACourse,
      }),
    [assessmentTypes, courseId, isEnrolledInACourse],
  );

  const selectedLanguage = useAppSelector(s => {
    const id = s.languageDirectory.selectedLanguageId;
    return id ? s.languageDirectory.languageMap[id] : null;
  });
  const textbookEntry: NavbarEntryInfo = useMemo(
    () =>
      selectedLanguage?.textbook
        ? {
            to: selectedLanguage.textbook.url.endsWith('json_py/') ? '/sicpy' : '/sicpjs',
            icon: IconNames.BOOK,
            text: selectedLanguage.textbook.name,
          }
        : { to: '/sicpjs', icon: IconNames.BOOK, text: 'SICP JS' },
    [selectedLanguage],
  );

  const fullAcademyNavbarLeftCommonInfo: NavbarEntryInfo[] = useMemo(() => {
    return [
      {
        to: '/playground',
        icon: IconNames.CODE,
        text: 'Playground',
        disabled: !isEnrolledInACourse,
      },
      {
        ...textbookEntry,
        disabled: !isLoggedIn,
      },
      {
        to: `/courses/${courseId}/achievements`,
        icon: IconNames.MOUNTAIN,
        text: 'Achievements',
        disabled: !(isEnrolledInACourse && enableAchievements),
      },
      {
        to: `/courses/${courseId}/leaderboard`,
        icon: IconNames.TIMELINE_BAR_CHART,
        text: 'Leaderboard',
        disabled: !(isEnrolledInACourse && (enableContestLeaderboard || enableOverallLeaderboard)),
      },
    ];
  }, [
    courseId,
    isEnrolledInACourse,
    isLoggedIn,
    enableAchievements,
    enableContestLeaderboard,
    enableOverallLeaderboard,
    textbookEntry,
  ]);

  const fullAcademyMobileNavbarLeftAdditionalInfo = useMemo(
    () => getAcademyNavbarRightInfo({ isEnrolledInACourse, courseId, role }),
    [isEnrolledInACourse, courseId, role],
  );

  const fullAcademyMobileNavbarLeftInfoWithAssessments: NavbarEntryInfo[] = useMemo(() => {
    return [
      ...fullAcademyNavbarLeftAssessmentsInfo,
      ...fullAcademyNavbarLeftCommonInfo,
      ...fullAcademyMobileNavbarLeftAdditionalInfo,
    ];
  }, [
    fullAcademyNavbarLeftAssessmentsInfo,
    fullAcademyNavbarLeftCommonInfo,
    fullAcademyMobileNavbarLeftAdditionalInfo,
  ]);

  const playgroundOnlyNavbarLeftInfo: NavbarEntryInfo[] = [
    { to: '/playground', icon: IconNames.CODE, text: 'Playground' },
    textbookEntry,
  ];

  const renderPlaygroundOnlyNavbarLeftDesktop = () => (
    <NavbarGroup align={Alignment.START}>
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
      isEnrolledInACourse,
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
      '/sicpy',
      '/contributors',
      `/courses/${courseId}/achievements`,
      `/courses/${courseId}/leaderboard`,
    ];
    const enableDesktopPopover =
      courseId != null && !!topNavbarNavlinks.find(x => location.pathname.startsWith(x));
    const highlightDesktopLogo = (location: Location) => {
      // Highlight main logo when none of the topmost-blue navbar links are active
      return !topNavbarNavlinks.find(x => location.pathname.startsWith(x));
    };

    return (
      <NavbarGroup align={Alignment.START}>
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
                variant="minimal"
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
    <NavbarGroup align={Alignment.END}>
      <NavigationBarLangSelectButton />
      <NavLink
        className={({ isActive }) =>
          classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL, {
            [Classes.ACTIVE]: isActive,
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
  const navbarType = useSecondaryNavbarType();
  return (
    <>
      <Navbar
        className={classNames(
          'NavigationBar',
          'primary-navbar',
          classes['primary-navbar'],
          Classes.DARK,
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

      {navbarType === 'hidden' ? null : navbarType === 'sicppy' ? (
        <SicPyNavigationBar />
      ) : navbarType === 'sicp' ? (
        <SicpNavigationBar />
      ) : !Constants.playgroundOnly && isEnrolledInACourse && !isMobileBreakpoint ? (
        <AcademyNavigationBar assessmentTypes={assessmentTypes} />
      ) : null}
    </>
  );
}

export function DesktopNavLink(props: NavbarEntryInfo) {
  const responsive = useResponsive();
  const shouldHide = props.hiddenInBreakpoints?.some(bp => responsive[bp]);
  return props.disabled ? null : (
    <NavLink
      className={({ isActive }) => classNames(isActive && Classes.ACTIVE)}
      to={props.to}
      key={props.text}
      title={props.text}
    >
      <Button variant="minimal" icon={props.icon}>
        {!shouldHide && (
          <Translation ns="commons" keyPrefix="navigationBar">
            {t =>
              t($ => $[props.text as keyof i18nDefaultLangKeys['commons']['navigationBar']], {
                defaultValue: props.text,
              })
            }
          </Translation>
        )}
      </Button>
      {props.hasNotifications && (
        <NotificationBadge
          notificationFilter={filterNotificationsByType(props.text)}
          disableHover
        />
      )}
    </NavLink>
  );
}

type MobileNavLinkProps = NavbarEntryInfo & {
  handleClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function MobileNavLink(props: MobileNavLinkProps) {
  return props.disabled ? null : (
    <NavLink
      to={props.to}
      className={({ isActive }) => classNames(isActive && Classes.ACTIVE)}
      onClick={props.handleClick}
      key={props.text}
    >
      <Button variant="minimal" size="large" icon={props.icon}>
        <Translation ns="commons" keyPrefix="navigationBar">
          {t =>
            t($ => $[props.text as keyof i18nDefaultLangKeys['commons']['navigationBar']], {
              defaultValue: props.text,
            })
          }
        </Translation>
      </Button>
      {props.hasNotifications && (
        <NotificationBadge
          notificationFilter={filterNotificationsByType(props.text)}
          disableHover
        />
      )}
    </NavLink>
  );
}

export default NavigationBar;
