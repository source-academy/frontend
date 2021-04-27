import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink, Route } from 'react-router-dom';
import { ControlBarGitHubLoginButton } from 'src/commons/controlBar/ControlBarGitHubLoginButton';
import { GitHubMissionBrowserDialog } from 'src/commons/githubAssessments/GitHubMissionBrowserDialog';
import { store } from 'src/pages/createStore';

type OwnProps = {
  githubOctokitInstance: Octokit | undefined;
  handleGitHubLogIn: any;
  handleGitHubLogOut: any;
};

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
        <Route path="/githubassessments/missions" component={GitHubMissionBrowserDialog}></Route>
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <ControlBarGitHubLoginButton
        loggedInAs={store.getState().session.githubOctokitInstance}
        key="github"
        onClickLogIn={props.handleGitHubLogIn}
        onClickLogOut={props.handleGitHubLogOut}
      />
    </NavbarGroup>
  </Navbar>
);

export default GitHubAssessmentsNavigationBar;
