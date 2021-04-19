import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { GitHubState } from '../../features/github/GitHubTypes';
import { store } from '../../pages/createStore';
import controlButton from '../ControlButton';
import Constants from '../utils/Constants';

export type ControlBarGitHubLoginButtonProps = {
  loggedInAs?: Octokit;
  onClickLogIn?: () => any;
  onClickLogOut?: () => any;
};

const stateToIntent: { [state in GitHubState]: Intent } = {
  LOGGED_OUT: Intent.NONE,
  LOGGED_IN: Intent.NONE
};

export const ControlBarGitHubLoginButton: React.FC<ControlBarGitHubLoginButtonProps> = props => {
  // The 'loggedInAs' is not used directly in this code block
  // However, keeping it in will ensure that the component re-renders immediately
  // Or else, the re-render has to be triggered by something else

  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;

  const state: GitHubState = isLoggedIn ? 'LOGGED_IN' : 'LOGGED_OUT';

  const mainButton = controlButton('GitHub ' + (isLoggedIn ? 'Logout' : 'Login'), IconNames.GIT_BRANCH, null, {
    intent: stateToIntent[state]
  });

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.LOG_OUT, props.onClickLogOut)
    : controlButton('Log In', IconNames.LOG_IN, props.onClickLogIn);

  return (
    <Popover2
      autoFocus={false}
      content={
        <div>
          <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>
        </div>
      }
      popoverClassName={Classes.POPOVER_DISMISS}
    >
      {mainButton}
    </Popover2>
  );
};
