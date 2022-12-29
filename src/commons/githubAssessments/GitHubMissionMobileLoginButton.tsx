import { ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import controlButton from '../ControlButton';
import Constants from '../utils/Constants';
import { useTypedSelector } from '../utils/Hooks';

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
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn =
    useTypedSelector(store => store.session.githubOctokitObject).octokit !== undefined;

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.GIT_BRANCH, props.onClickLogOut)
    : controlButton('Log In', IconNames.GIT_BRANCH, props.onClickLogIn);

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
