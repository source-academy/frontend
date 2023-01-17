import { ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import ControlButton from '../ControlButton';
import { useResponsive, useTypedSelector } from '../utils/Hooks';

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
  const { isMobileBreakpoint } = useResponsive();
  const isLoggedIn =
    useTypedSelector(store => store.session.githubOctokitObject).octokit !== undefined;

  const loginButton = isLoggedIn ? (
    <ControlButton label="Log Out" icon={IconNames.GIT_BRANCH} onClick={props.onClickLogOut} />
  ) : (
    <ControlButton label="Log In" icon={IconNames.GIT_BRANCH} onClick={props.onClickLogIn} />
  );

  return <ButtonGroup large={!isMobileBreakpoint}>{loginButton}</ButtonGroup>;
};
