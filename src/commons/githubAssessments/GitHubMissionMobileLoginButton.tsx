import { ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import controlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';

export type ControlBarGitHubMobileLoginButtonProps = {
  onClickLogIn: () => void;
  onClickLogOut: () => void;
};

/**
 * GitHub buttons to be used for the GitHub-hosted mission interface.
 *
 * @param props Component properties
 */
export const ControlBarGitHubMobileLoginButton: React.FC<
  ControlBarGitHubMobileLoginButtonProps
> = props => {
  const isMobileBreakpoint = useResponsive();
  const isLoggedIn =
    useSelector((store: OverallState) => store.session.githubOctokitObject).octokit !== undefined;

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.GIT_BRANCH, props.onClickLogOut)
    : controlButton('Log In', IconNames.GIT_BRANCH, props.onClickLogIn);

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
