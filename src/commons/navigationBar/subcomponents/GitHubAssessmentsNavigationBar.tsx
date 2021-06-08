import {
  Alignment,
  Button,
  Classes,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  Navbar,
  NavbarGroup
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { ControlBarGitHubLoginButton } from '../../controlBar/ControlBarGitHubLoginButton';

type GitHubAssessmentsNavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type StateProps = {
  octokit: Octokit;
  courses: string[];
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  typeNames: string[];
};

/**
 * The white navbar for the website. Should only be displayed when using GitHub-hosted missions.
 *
 * @param props Component properties
 */
const GitHubAssessmentsNavigationBar: React.FC<GitHubAssessmentsNavigationBarProps> = props => {
  const handleClick = (e: any) => {
    handleChange(e);
  };

  const handleChange = (e: any) => {
    props.setSelectedCourse(e.target.innerText);
  };

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

      {props.octokit !== undefined && (
        <NavbarGroup align={Alignment.RIGHT}>
          <InputGroup
            disabled={true}
            leftElement={
              <Popover2
                content={
                  <Menu>
                    {props.courses.map((course: string) => (
                      <MenuItem key={course} onClick={handleClick} text={course} />
                    ))}
                  </Menu>
                }
                placement={'bottom-end'}
              >
                <Button minimal={true} rightIcon="caret-down" />
              </Popover2>
            }
            placeholder={'Select Course'}
            onChange={handleChange}
            value={props.selectedCourse}
          />
        </NavbarGroup>
      )}
    </Navbar>
  );
};

export default GitHubAssessmentsNavigationBar;
