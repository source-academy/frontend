import { ButtonGroup, Classes, Intent, Popover, Tooltip } from '@blueprintjs/core';
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
  onPopoverOpening?: () => any;
};

const stateToIntent: { [state in GitHubState]: Intent } = {
  INACTIVE: Intent.NONE,
  SAVED: Intent.PRIMARY,
  DIRTY: Intent.WARNING
};

export const ControlBarGitHubButtons: React.FC<ControlBarGitHubButtonsProps> = props => {
  const state: GitHubState = props.currentFile ? (props.isDirty ? 'DIRTY' : 'SAVED') : 'INACTIVE';
  const mainButton = controlButton(
    (props.currentFile && props.currentFile.name) || 'GitHub',
    IconNames.GIT_BRANCH,
    null,
    {
      intent: stateToIntent[state]
    }
  );
  const openButton = controlButton('Open', IconNames.DOCUMENT_OPEN, props.onClickOpen);
  const saveButton = controlButton(
    'Save',
    IconNames.FLOPPY_DISK,
    props.onClickSave,
    undefined,
    // disable if logged_in only (i.e. not linked to a file)
    state === 'INACTIVE'
  );
  const saveAsButton = controlButton('Save as', IconNames.SEND_TO, props.onClickSaveAs);
  const loginButton = props.loggedInAs && (
    <Tooltip content={`Logged in as ${props.loggedInAs}`}>
      {controlButton('Log out', IconNames.LOG_IN, props.onClickLogIn)}
    </Tooltip>
  );

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
