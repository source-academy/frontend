import { ButtonGroup, Classes, Intent, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { GitHubFile, GitHubState } from '../../features/github/GitHubTypes';
import controlButton from '../ControlButton';

export type ControlBarGitHubButtonsProps = {
  loggedInAs?: string;
  currentFile?: GitHubFile;
  isDirty?: boolean;
  onClickOpen?: () => any;
  onClickSave?: () => any;
  onClickSaveAs?: () => any;
  onClickLogIn?: () => any;
  onClickLogOut?: () => any;
  onPopoverOpening?: () => any;
};

const stateToIntent: { [state in GitHubState]: Intent } = {
  LOGGED_OUT: Intent.NONE,
  LOGGED_IN: Intent.NONE
};

export const ControlBarGitHubButtons: React.FC<ControlBarGitHubButtonsProps> = props => {
  const isLoggedIn = props.loggedInAs !== undefined;
  const shouldDisableButtons = !isLoggedIn;
  const state: GitHubState = isLoggedIn ? 'LOGGED_IN' : 'LOGGED_OUT';

  const mainButton = controlButton(
    //(props.currentFile && props.currentFile.name) || 'GitHub',
    'GitHub',
    IconNames.GIT_BRANCH,
    null,
    {
      intent: stateToIntent[state]
    }
  );

  const openButton = controlButton(
    'Open',
    IconNames.DOCUMENT_OPEN,
    props.onClickOpen,
    undefined,
    shouldDisableButtons
  );

  const saveButton = controlButton(
    'Save',
    IconNames.FLOPPY_DISK,
    props.onClickSave,
    undefined,
    shouldDisableButtons
  );

  const saveAsButton = controlButton(
    'Save as',
    IconNames.SEND_TO,
    props.onClickSaveAs,
    undefined,
    shouldDisableButtons
  );

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.LOG_OUT, props.onClickLogOut)
    : controlButton('Log In', IconNames.LOG_IN, props.onClickLogIn);

  /*
  const loginButton = props.loggedInAs && (
    <Tooltip content={`Logged in as ${props.loggedInAs}`}>
      {controlButton('Log out', IconNames.LOG_IN, props.onClickLogIn)}
    </Tooltip>
  );
  */

  return (
    <Popover
      autoFocus={false}
      content={
        <div>
          <ButtonGroup large={true}>
            {openButton}
            {saveButton}
            {saveAsButton}
            {loginButton}
          </ButtonGroup>
        </div>
      }
      onOpening={props.onPopoverOpening}
      popoverClassName={Classes.POPOVER_DISMISS}
    >
      {mainButton}
    </Popover>
  );
};
