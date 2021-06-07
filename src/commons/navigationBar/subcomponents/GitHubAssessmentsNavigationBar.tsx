import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { ControlBarGitHubLoginButton } from '../../controlBar/ControlBarGitHubLoginButton';

type DispatchProps = {
  typeNames: string[];
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

/**
 * The white navbar for the website. Should only be displayed when using GitHub-hosted missions.
 *
 * @param props Component properties
 */
const GitHubAssessmentsNavigationBar: React.FC<DispatchProps> = props => {
  return (
    <Navbar className="NavigationBar secondary-navbar">
      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={`/githubassessments/missions`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.FLAME} />
          <div className="navbar-button-text hidden-xs hidden-sm">{props.typeNames[0]}</div>
        </NavLink>
      </NavbarGroup>

      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={`/githubassessments/${props.typeNames[1]}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.FLAME} />
          <div className="navbar-button-text hidden-xs hidden-sm">{props.typeNames[1]}</div>
        </NavLink>
      </NavbarGroup>

      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={`/githubassessments/${props.typeNames[2]}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.FLAME} />
          <div className="navbar-button-text hidden-xs hidden-sm">{props.typeNames[2]}</div>
        </NavLink>
      </NavbarGroup>

      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={`/githubassessments/${props.typeNames[3]}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.FLAME} />
          <div className="navbar-button-text hidden-xs hidden-sm">{props.typeNames[3]}</div>
        </NavLink>
      </NavbarGroup>

      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          to={`/githubassessments/${props.typeNames[4]}`}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.FLAME} />
          <div className="navbar-button-text hidden-xs hidden-sm">{props.typeNames[4]}</div>
        </NavLink>
      </NavbarGroup>

      <NavbarGroup align={Alignment.RIGHT}>
        <ControlBarGitHubLoginButton
          key="github"
          onClickLogIn={props.handleGitHubLogIn}
          onClickLogOut={props.handleGitHubLogOut}
        />
      </NavbarGroup>
    </Navbar>
  );
};

export default GitHubAssessmentsNavigationBar;
