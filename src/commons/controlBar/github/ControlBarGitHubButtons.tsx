import { ButtonGroup, Classes, Intent, Popover, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import React from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

import { GitHubSaveInfo } from '../../../features/github/GitHubTypes';
import ControlButton from '../../ControlButton';

type Props = {
  isFolderModeEnabled: boolean;
  workspaceLocation: string;
  currPersistenceFile?: PersistenceFile;
  loggedInAs?: Octokit;
  githubSaveInfo: GitHubSaveInfo;
  isDirty: boolean;
  isGDriveSynced: boolean;
  onClickOpen?: () => void;
  onClickSave?: () => void;
  onClickSaveAs?: () => void;
  onClickSaveAll?: () => void;
  onClickLogIn?: () => void;
  onClickLogOut?: () => void;
};

/**
 * GitHub buttons to be used specifically in the Playground.
 * Creates a dropdown upon click.
 *
 * @param props Component properties
 */
export const ControlBarGitHubButtons: React.FC<Props> = props => {
  const { isMobileBreakpoint } = useResponsive();

  const filePath = props.githubSaveInfo.filePath || '';

  const isNotPlayground = props.workspaceLocation !== "playground";

  const isLoggedIn = props.loggedInAs !== undefined;
  const shouldDisableButtons = !isLoggedIn;
  const hasFilePath = filePath !== '';
  const hasOpenFile = isLoggedIn && hasFilePath;
  const GDriveSynced = props.isGDriveSynced;

  const mainButtonDisplayText =
    (props.currPersistenceFile && hasOpenFile && props.currPersistenceFile.name) || 'GitHub';
  let mainButtonIntent: Intent = Intent.NONE;
  if (hasOpenFile) {
    mainButtonIntent = props.isDirty ? Intent.WARNING : Intent.PRIMARY;
  }

  const mainButton = (
    <ControlButton
      label={mainButtonDisplayText}
      icon={IconNames.GIT_BRANCH}
      options={{ intent: mainButtonIntent }}
      isDisabled={isNotPlayground || GDriveSynced}
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

  const saveAllButton = (
    <ControlButton
      label="Save All"
      icon={IconNames.DOUBLE_CHEVRON_UP}
      onClick={props.onClickSaveAll}
      isDisabled={shouldDisableButtons}
    />
  );

  const loginButton = isLoggedIn ? (
    <ControlButton label="Log Out" icon={IconNames.LOG_OUT} onClick={props.onClickLogOut} />
  ) : (
    <ControlButton label="Log In" icon={IconNames.LOG_IN} onClick={props.onClickLogIn} />
  );

  const tooltipContent = isNotPlayground
    ? 'Currently unsupported in non playground workspaces'
    : undefined;

  return (
    <Tooltip content={tooltipContent} disabled={tooltipContent === undefined}>
      <Popover
        autoFocus={false}
        content={
          <div>
            <ButtonGroup large={!isMobileBreakpoint}>
              {openButton}
              {saveButton}
              {saveAsButton}
              {saveAllButton}
              {loginButton}
            </ButtonGroup>
          </div>
        }
        popoverClassName={Classes.POPOVER_DISMISS}
        disabled={isNotPlayground || GDriveSynced}
      >
        {mainButton}
      </Popover>
    </Tooltip>
  );
};
