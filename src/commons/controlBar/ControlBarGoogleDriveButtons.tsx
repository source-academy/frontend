import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import { PersistenceFile, PersistenceState } from '../../features/persistence/PersistenceTypes';
import ControlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';

export type ControlBarGoogleDriveButtonsProps = {
  isFolderModeEnabled: boolean;
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
  const { isMobileBreakpoint } = useResponsive();
  const state: PersistenceState = props.currentFile
    ? props.isDirty
      ? 'DIRTY'
      : 'SAVED'
    : 'INACTIVE';
  const mainButton = (
    <ControlButton
      label={(props.currentFile && props.currentFile.name) || 'Google Drive'}
      icon={IconNames.CLOUD}
      options={{ intent: stateToIntent[state] }}
      isDisabled={props.isFolderModeEnabled}
    />
  );
  const openButton = (
    <ControlButton label="Open" icon={IconNames.DOCUMENT_OPEN} onClick={props.onClickOpen} />
  );
  const saveButton = (
    <ControlButton
      label="Save"
      icon={IconNames.FLOPPY_DISK}
      onClick={props.onClickSave}
      // disable if logged_in only (i.e. not linked to a file)
      isDisabled={state === 'INACTIVE'}
    />
  );
  const saveAsButton = (
    <ControlButton label="Save as" icon={IconNames.SEND_TO} onClick={props.onClickSaveAs} />
  );
  const logoutButton = props.loggedInAs && (
    <Tooltip2 content={`Logged in as ${props.loggedInAs}`}>
      <ControlButton label="Log out" icon={IconNames.LOG_OUT} onClick={props.onClickLogOut} />
    </Tooltip2>
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
              {logoutButton}
            </ButtonGroup>
          </div>
        }
        onOpening={props.onPopoverOpening}
        popoverClassName={Classes.POPOVER_DISMISS}
        disabled={props.isFolderModeEnabled}
      >
        {mainButton}
      </Popover2>
    </Tooltip2>
  );
};
