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
        {props.typeNames.map(typeName => {
          return (
            <NavLink
              key={typeName}
              exact={true}
              to={{
                pathname: `${typeName}`,
                state: props.selectedCourse
              }}
              activeClassName={Classes.ACTIVE}
              className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
            >
              <Icon icon={IconNames.FLAME} />
              <div className="navbar-button-text hidden-xs hidden-sm">{typeName}</div>
            </NavLink>
          );
        })}
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        {props.octokit !== undefined && (
          <InputGroup
            key="courseselect"
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
        )}
        <ControlBarGitHubLoginButton
          key="loginlogout"
          onClickLogIn={props.handleGitHubLogIn}
          onClickLogOut={props.handleGitHubLogOut}
        />
      </NavbarGroup>
    </Navbar>
  );
};

export default GitHubAssessmentsNavigationBar;
