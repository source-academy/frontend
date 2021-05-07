import { ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { store } from '../../pages/createStore';
import controlButton from '../ControlButton';
import Constants from '../utils/Constants';

export type ControlBarGitHubLoginButtonProps = {
  loggedInAs?: Octokit;
  onClickLogIn?: () => any;
  onClickLogOut?: () => any;
};

/**
 * GitHub buttons to be used for the GitHub-hosted mission interface.
 *
 * @param props Component properties
 */
export const ControlBarGitHubLoginButton: React.FC<ControlBarGitHubLoginButtonProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.GIT_BRANCH, props.onClickLogOut)
    : controlButton('Log In', IconNames.GIT_BRANCH, props.onClickLogIn);

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
