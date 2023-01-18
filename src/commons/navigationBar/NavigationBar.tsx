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
import { match, NavLink, Route, Switch, useLocation } from 'react-router-dom';

import SicpNavigationBar from '../../commons/navigationBar/subcomponents/SicpNavigationBar';
import { Role } from '../application/ApplicationTypes';
import { UpdateCourseConfiguration, UserCourse } from '../application/types/SessionTypes';
import { AssessmentType } from '../assessment/AssessmentTypes';
import Dropdown from '../dropdown/Dropdown';
import NotificationBadge from '../notificationBadge/NotificationBadge';
import { filterNotificationsByType } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';
import { useResponsive } from '../utils/Hooks';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import AcademyNavigationBar, { icons } from './subcomponents/AcademyNavigationBar';
import NavigationBarMobileSideMenu from './subcomponents/NavigationBarMobileSideMenu';

type NavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  handleCreateCourse: (courseConfig: UpdateCourseConfiguration) => void;
};

type StateProps = {
  role?: Role;
  name?: string;
  courses: UserCourse[];
  courseId?: number;
  courseShortName?: string;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes?: AssessmentType[];
};

const matchSourcecastAchievement = /^\/courses\/\d+\/(sourcecast|achievements)/;
const matchExceptSourcecastAchievement = (match: match | null, location: Location) => {
  if (!match) {
    return false;
  }

  if (matchSourcecastAchievement.test(location.pathname)) {
    return false;
  }

  return true;
};

const NavigationBar: React.FC<NavigationBarProps> = props => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = React.useState(false);
  const { isMobileBreakpoint } = useResponsive();
  const location = useLocation();

  FocusStyleManager.onlyShowFocusOnTabs();

  // Handles both the desktop and mobile versions of the playground-only left navbar group
  const playgroundOnlyNavbarLeft = Constants.enableGitHubAssessments ? (
    isMobileBreakpoint ? (
      <>
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
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to="/playground"
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.CODE} />
              <div>Playground</div>
            </NavLink>
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to="/githubassessments/missions"
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.BRIEFCASE} />
              <div>Classroom</div>
            </NavLink>
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to={`/sicpjs/`}
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.BOOK} />
              <div>SICP JS</div>
            </NavLink>
          </Drawer>
        </NavbarGroup>
      </>
    ) : (
      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/playground"
        >
          <Icon icon={IconNames.CODE} />
          <div>Playground</div>
        </NavLink>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/githubassessments"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div>Classroom</div>
        </NavLink>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to={`/sicpjs/`}
        >
          <Icon icon={IconNames.BOOK} />
          <div>SICP JS</div>
        </NavLink>
      </NavbarGroup>
    )
  ) : (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div>Playground</div>
      </NavLink>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
        to={`/sicpjs/`}
      >
        <Icon icon={IconNames.BOOK} />
        <div>SICP JS</div>
      </NavLink>
    </NavbarGroup>
  );

  // Handles the Source Academy @ NUS left mobile navbar group
  const mobileNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      {(props.role || Constants.enableGitHubAssessments) && (
        <Button
          onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
          icon={IconNames.MENU}
          large={true}
          minimal={true}
        />
      )}

      <NavLink
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        activeClassName={Classes.ACTIVE}
        to={props.courseId == null ? '/welcome' : `/courses/${props.courseId}`}
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>
          {props.courseShortName || 'Source Academy @ NUS'}
        </NavbarHeading>
      </NavLink>

      {(props.role || Constants.enableGitHubAssessments) && (
        <NavigationBarMobileSideMenu
          name={props.name}
          role={props.role}
          courseId={props.courseId}
          enableAchievements={props.enableAchievements}
          enableSourcecast={props.enableSourcecast}
          assessmentTypes={props.assessmentTypes}
          isOpen={mobileSideMenuOpen}
          onClose={() => setMobileSideMenuOpen(false)}
          handleGitHubLogIn={() => props.handleGitHubLogIn}
          handleGitHubLogOut={() => props.handleGitHubLogOut}
        />
      )}
    </NavbarGroup>
  );

  const desktopNavbarLeftPopoverContent = (
    <Navbar>
      <NavbarGroup>
        {props.assessmentTypes?.map((assessmentType, idx) => (
          <NavLink
            to={`/courses/${props.courseId}/${assessmentTypeLink(assessmentType)}`}
            activeClassName={Classes.ACTIVE}
            className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
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

  const desktopLogoButton = (
    <NavLink
      activeClassName={Classes.ACTIVE}
      className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      to={props.courseId == null ? '/welcome' : `/courses/${props.courseId}`}
      isActive={matchExceptSourcecastAchievement}
    >
      <Icon icon={IconNames.SYMBOL_DIAMOND} />
      <NavbarHeading style={{ paddingBottom: '0px' }}>
        {props.courseShortName || 'Source Academy @ NUS'}
      </NavbarHeading>
    </NavLink>
  );

  const enableDesktopPopoverIn = [
    '/playground',
    '/sicpjs',
    '/contributors',
    `/courses/${props.courseId}/sourcecast`,
    `/courses/${props.courseId}/achievements`
  ];
  const enableDesktopPopover =
    props.courseId != null && !!enableDesktopPopoverIn.find(x => location.pathname.startsWith(x));

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

      {props.role && props.enableSourcecast && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to={`/courses/${props.courseId}/sourcecast`}
        >
          <Icon icon={IconNames.MUSIC} />
          <div className="navbar-button-text">Sourcecast</div>
        </NavLink>
      )}
      {props.role && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/playground"
        >
          <Icon icon={IconNames.CODE} />
          <div className="navbar-button-text">Playground</div>
        </NavLink>
      )}
      {Constants.enableGitHubAssessments && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/githubassessments"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div className="navbar-button-text">Classroom</div>
        </NavLink>
      )}
      {props.name && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to={`/sicpjs/`}
        >
          <Icon icon={IconNames.BOOK} />
          <div className="navbar-button-text">SICP JS</div>
        </NavLink>
      )}
      {props.role && props.enableAchievements && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to={`/courses/${props.courseId}/achievements`}
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div className="navbar-button-text">Achievements</div>
        </NavLink>
      )}
    </NavbarGroup>
  );

  const commonNavbarRight = (
    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
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

      <Dropdown
        handleLogOut={props.handleLogOut}
        handleCreateCourse={props.handleCreateCourse}
        courses={props.courses}
        courseId={props.courseId}
        name={props.name}
      />
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

      <Switch>
        <Route path="/playground" />
        <Route path="/githubassessments" />
        <Route path="/contributors" />
        <Route path="/courses/:courseId/sourcecast" />
        <Route path="/courses/:courseId/achievements" />
        <Route path="/sicpjs/:section?">
          <SicpNavigationBar />
        </Route>
        <Route>
          {!Constants.playgroundOnly && props.role && !isMobileBreakpoint && (
            <AcademyNavigationBar
              role={props.role}
              assessmentTypes={props.assessmentTypes}
              courseId={props.courseId!}
            />
          )}
        </Route>
      </Switch>
    </>
  );
};

export default NavigationBar;
