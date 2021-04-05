import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { PersistenceFile, PersistenceState } from '../../features/persistence/PersistenceTypes';
import controlButton from '../ControlButton';

export type ControlBarGoogleDriveButtonsProps = {
  loggedInAs?: string;
  currentFile?: PersistenceFile;
  isDirty?: boolean;
  onClickOpen?: () => any;
  onClickSave?: () => any;
  onClickSaveAs?: () => any;
  onClickLogOut?: () => any;
  onPopoverOpening?: () => any;
};

const stateToIntent: { [state in PersistenceState]: Intent } = {
  INACTIVE: Intent.NONE,
  SAVED: Intent.PRIMARY,
  DIRTY: Intent.WARNING
};

export const ControlBarGoogleDriveButtons: React.FC<ControlBarGoogleDriveButtonsProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: 768 });
  const state: PersistenceState = props.currentFile
    ? props.isDirty
      ? 'DIRTY'
      : 'SAVED'
    : 'INACTIVE';
  const mainButton = controlButton(
    (props.currentFile && props.currentFile.name) || 'Google Drive',
    IconNames.CLOUD,
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
  const logoutButton = props.loggedInAs && (
    <Tooltip2 content={`Logged in as ${props.loggedInAs}`}>
      {controlButton('Log out', IconNames.LOG_OUT, props.onClickLogOut)}
    </Tooltip2>
  );

  return (
    <Popover2
      autoFocus={false}
      content={
        <div>
          <ButtonGroup large={!isMobileBreakpoint}>
            {openButton}
            {saveButton}
            {saveAsButton}
            {logoutButton}
          </ButtonGroup>
        </div>
      }
      onOpening={props.onPopoverOpening}
      popoverClassName={Classes.POPOVER_DISMISS}
    >
      {mainButton}
    </Popover2>
  );
};
