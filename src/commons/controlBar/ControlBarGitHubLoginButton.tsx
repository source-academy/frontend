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

export const ControlBarGitHubLoginButton: React.FC<ControlBarGitHubLoginButtonProps> = props => {
  // The 'loggedInAs' is not used directly in this code block
  // However, keeping it in will ensure that the component re-renders immediately
  // Or else, the re-render has to be triggered by something else

  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.GIT_BRANCH, props.onClickLogOut)
    : controlButton('Log In', IconNames.GIT_BRANCH, props.onClickLogIn);

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
