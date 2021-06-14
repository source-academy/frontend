import { ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { OverallState } from '../application/ApplicationTypes';
import controlButton from '../ControlButton';
import Constants from '../utils/Constants';

export type ControlBarGitHubLoginButtonProps = {
  onClickLogIn: () => void;
  onClickLogOut: () => void;
};

/**
 * GitHub buttons to be used for the GitHub-hosted mission interface.
 *
 * @param props Component properties
 */
export const ControlBarGitHubLoginButton: React.FC<ControlBarGitHubLoginButtonProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn =
    useSelector((store: OverallState) => store.session.githubOctokitObject).octokit !== undefined;

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.GIT_BRANCH, props.onClickLogOut)
    : controlButton('Log In', IconNames.GIT_BRANCH, props.onClickLogIn);

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
