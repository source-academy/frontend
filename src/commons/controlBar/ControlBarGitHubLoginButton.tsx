import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import * as React from 'react';

import { store } from '../../pages/createStore';
import controlButton from '../ControlButton';

export type ControlBarGitHubLoginButtonProps = {
  loggedInAs?: Octokit;
  onClickLogIn?: () => any;
  onClickLogOut?: () => any;
};

export const ControlBarGitHubLoginButton: React.FC<ControlBarGitHubLoginButtonProps> = props => {
  const isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;

  const mainButton = isLoggedIn
    ? controlButton('GitHub Log Out', IconNames.LOG_OUT, props.onClickLogOut)
    : controlButton('GitHub Log In', IconNames.LOG_IN, props.onClickLogIn);

  return mainButton;
};
