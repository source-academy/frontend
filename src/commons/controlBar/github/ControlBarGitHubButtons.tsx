import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import React from 'react';
import { useResponsive } from 'src/commons/utils/Hooks';

import { GitHubSaveInfo } from '../../../features/github/GitHubTypes';
import ControlButton from '../../ControlButton';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

type Props = {
  isFolderModeEnabled: boolean;
  currPersistenceFile?: PersistenceFile;
  loggedInAs?: Octokit;
  githubSaveInfo: GitHubSaveInfo;
  isDirty: boolean;
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

  const isLoggedIn = props.loggedInAs !== undefined;
  const shouldDisableButtons = !isLoggedIn;
  const hasFilePath = filePath !== '';
  const hasOpenFile = isLoggedIn && hasFilePath;

  const mainButtonDisplayText = (props.currPersistenceFile && props.currPersistenceFile.name) || 'GitHub';
  let mainButtonIntent: Intent = Intent.NONE;
  if (hasOpenFile) {
    mainButtonIntent = props.isDirty ? Intent.WARNING : Intent.PRIMARY;
  }

  const mainButton = (
    <ControlButton
      label={mainButtonDisplayText}
      icon={IconNames.GIT_BRANCH}
      options={{ intent: mainButtonIntent }}
      //isDisabled={props.isFolderModeEnabled}
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

  //const tooltipContent = props.isFolderModeEnabled
  //  ? 'Currently unsupported in Folder mode'
  //  : undefined;
  const tooltipContent = undefined;

  return (
    <Tooltip2 content={tooltipContent} disabled={false}>
      <Popover2
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
        //disabled={props.isFolderModeEnabled}
      >
        {mainButton}
      </Popover2>
    </Tooltip2>
  );
};
