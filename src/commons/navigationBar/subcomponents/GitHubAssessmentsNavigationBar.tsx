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

import { ControlBarGitHubLoginButton } from '../../controlBar/github/ControlBarGitHubLoginButton';

type GitHubAssessmentsNavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  changeCourseHandler: (e: any) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type StateProps = {
  octokit: Octokit | undefined;
  courses: string[];
  selectedCourse: string;
  types: string[];
};

/**
 * The white navbar for the website. Should only be displayed when using GitHub-hosted missions.
 */
const GitHubAssessmentsNavigationBar: React.FC<GitHubAssessmentsNavigationBarProps> = props => {
  const handleClick = (e: any) => {
    props.changeCourseHandler(e);
  };

  return (
    <Navbar className="NavigationBar secondary-navbar">
      <NavbarGroup align={Alignment.LEFT}>
        {props.types.map(type => {
          return (
            <NavLink
              key={type}
              to={`${type}`}
              activeClassName={Classes.ACTIVE}
              className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
            >
              <Icon icon={IconNames.FLAME} />
              <div className="navbar-button-text hidden-xs hidden-sm">{type}</div>
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
                <Button minimal={true} rightIcon="caret-down" aria-label="choose" />
              </Popover2>
            }
            placeholder={'Select Course'}
            onChange={props.changeCourseHandler}
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
