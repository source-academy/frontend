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
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import { NavLink, Route, Switch } from 'react-router-dom';

import { Role } from '../application/ApplicationTypes';
import { AssessmentType } from '../assessment/AssessmentTypes';
import Dropdown from '../dropdown/Dropdown';
import Constants from '../utils/Constants';
import AcademyNavigationBar from './subcomponents/AcademyNavigationBar';
import GitHubAssessmentsNavigationBar from './subcomponents/GitHubAssessmentsNavigationBar';
import NavigationBarMobileSideMenu from './subcomponents/NavigationBarMobileSideMenu';

type NavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type StateProps = {
  role?: Role;
  title: string;
  name?: string;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes: AssessmentType[];
};

const NavigationBar: React.FC<NavigationBarProps> = props => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = React.useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(true);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

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
              <div>GitHub Assessments</div>
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
          <div>Source Academy Playground</div>
        </NavLink>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/githubassessments/missions"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div>GitHub Assessments</div>
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
        <div>Source Academy Playground</div>
      </NavLink>
    </NavbarGroup>
  );

  // Handles the Source Academy @NUS left mobile navbar group
  const mobileNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      {props.name && (
        <Button
          onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
          icon={IconNames.MENU}
          large={true}
          minimal={true}
        />
      )}

      <NavLink
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      {props.name && (
        <NavigationBarMobileSideMenu
          role={props.role}
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

  // Handles the Source Academy @NUS left desktop navbar group
  const desktopNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      {props.role && props.enableSourcecast && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/sourcecast"
        >
          <Icon icon={IconNames.MUSIC} />
          <div className="navbar-button-text">Sourcecast</div>
        </NavLink>
      )}
      {props.name && (
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
          to="/githubassessments/missions"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div className="navbar-button-text">GitHub Assessments</div>
        </NavLink>
      )}

      {props.role && props.enableAchievements && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/achievement"
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div className="navbar-button-text">Achievement</div>
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
        <div className="navbar-button-text hidden-sm hidden-xs">Contributors</div>
      </NavLink>

      {!Constants.playgroundOnly && props.role && !isMobileBreakpoint && (
        <>
          <NavbarDivider className="default-divider" />
          <Tooltip2 content="Toggle Menu" placement={Position.BOTTOM}>
            <Button
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              icon={IconNames.COMPASS}
              minimal={true}
              style={{ outline: 'none' }}
            />
          </Tooltip2>
        </>
      )}

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>
      <div className="hidden-xs">
        <NavbarDivider className="default-divider" />
      </div>

      <Dropdown handleLogOut={props.handleLogOut} name={props.name} />
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
        <Route path="/githubassessments">
          {Constants.enableGitHubAssessments && !isMobileBreakpoint && desktopMenuOpen && (
            <GitHubAssessmentsNavigationBar {...props} />
          )}
        </Route>
        <Route>
          {!Constants.playgroundOnly && props.role && !isMobileBreakpoint && desktopMenuOpen && (
            <AcademyNavigationBar role={props.role} assessmentTypes={props.assessmentTypes} />
          )}
        </Route>
      </Switch>
    </>
  );
};

export default NavigationBar;
