import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';

import { GitHubSaveInfo } from '../../../features/github/GitHubTypes';
import ControlButton from '../../ControlButton';

export type ControlBarGitHubButtonsProps = {
  isFolderModeEnabled: boolean;
  loggedInAs?: Octokit;
  githubSaveInfo: GitHubSaveInfo;
  isDirty: boolean;
  onClickOpen?: () => void;
  onClickSave?: () => void;
  onClickSaveAs?: () => void;
  onClickLogIn?: () => void;
  onClickLogOut?: () => void;
};

/**
 * GitHub buttons to be used specifically in the Playground.
 * Creates a dropdown upon click.
 *
 * @param props Component properties
 */
export const ControlBarGitHubButtons: React.FC<ControlBarGitHubButtonsProps> = props => {
  const { isMobileBreakpoint } = useResponsive();

  const filePath = props.githubSaveInfo.filePath || '';
  const fileName = (filePath.split('\\').pop() || '').split('/').pop() || '';

  const isLoggedIn = props.loggedInAs !== undefined;
  const shouldDisableButtons = !isLoggedIn;
  const hasFilePath = filePath !== '';
  const hasOpenFile = isLoggedIn && hasFilePath;

  const mainButtonDisplayText = hasOpenFile ? fileName : 'GitHub';
  let mainButtonIntent: Intent = Intent.NONE;
  if (hasOpenFile) {
    mainButtonIntent = props.isDirty ? Intent.WARNING : Intent.PRIMARY;
  }

  const mainButton = (
    <ControlButton
      label={mainButtonDisplayText}
      icon={IconNames.GIT_BRANCH}
      options={{ intent: mainButtonIntent }}
      isDisabled={props.isFolderModeEnabled}
    />
  );

  const openButton = (
    <ControlButton
      label="Open"
      icon={IconNames.DOCUMENT_OPEN}
      onClick={props.onClickOpen}
      isDisabled={shouldDisableButtons}
    />
  );

  const saveButton = (
    <ControlButton
      label="Save"
      icon={IconNames.FLOPPY_DISK}
      onClick={props.onClickSave}
      isDisabled={shouldDisableButtons || !hasOpenFile}
    />
  );

  const saveAsButton = (
    <ControlButton
      label="Save As"
      icon={IconNames.SEND_TO}
      onClick={props.onClickSaveAs}
      isDisabled={shouldDisableButtons}
    />
  );

  const loginButton = isLoggedIn ? (
    <ControlButton label="Log Out" icon={IconNames.LOG_OUT} onClick={props.onClickLogOut} />
  ) : (
    <ControlButton label="Log In" icon={IconNames.LOG_IN} onClick={props.onClickLogIn} />
  );

  const tooltipContent = props.isFolderModeEnabled
    ? 'Currently unsupported in Folder mode'
    : undefined;

  return (
    <Tooltip2 content={tooltipContent} disabled={tooltipContent === undefined}>
      <Popover2
        autoFocus={false}
        content={
          <div>
            <ButtonGroup large={!isMobileBreakpoint}>
              {openButton}
              {saveButton}
              {saveAsButton}
              {loginButton}
            </ButtonGroup>
          </div>
        }
        popoverClassName={Classes.POPOVER_DISMISS}
        disabled={props.isFolderModeEnabled}
      >
        {mainButton}
      </Popover2>
    </Tooltip2>
  );
};
