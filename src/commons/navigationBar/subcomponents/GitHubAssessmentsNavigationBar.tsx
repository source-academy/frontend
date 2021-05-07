import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { ControlBarGitHubLoginButton } from '../../controlBar/ControlBarGitHubLoginButton';
import { getGitHubOctokitInstance } from '../../../features/github/GitHubUtils';

type OwnProps = {
  handleGitHubLogIn: any;
  handleGitHubLogOut: any;
};

/**
 * The white navbar for the website. Should only be displayed when using GitHub-hosted missions.
 * 
 * @param props Component properties
 */
const GitHubAssessmentsNavigationBar: React.FunctionComponent<OwnProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to={`/githubassessments/missions`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs hidden-sm">Missions</div>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <ControlBarGitHubLoginButton
        loggedInAs={getGitHubOctokitInstance()}
        key="github"
        onClickLogIn={props.handleGitHubLogIn}
        onClickLogOut={props.handleGitHubLogOut}
      />
    </NavbarGroup>
  </Navbar>
);

export default GitHubAssessmentsNavigationBar;
