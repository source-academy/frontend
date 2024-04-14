import { ButtonGroup, Classes, Intent, Popover, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { PersistenceFile, PersistenceState } from '../../features/persistence/PersistenceTypes';
import ControlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';

const stateToIntent: { [state in PersistenceState]: Intent } = {
  INACTIVE: Intent.NONE,
  SAVED: Intent.PRIMARY,
  DIRTY: Intent.WARNING
};

type Props = {
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

export const ControlBarGoogleDriveButtons: React.FC<Props> = props => {
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
    <Tooltip content={`Logged in as ${props.loggedInAs}`}>
      <ControlButton label="Log out" icon={IconNames.LOG_OUT} onClick={props.onClickLogOut} />
    </Tooltip>
  );
  const tooltipContent = props.isFolderModeEnabled
    ? 'Currently unsupported in Folder mode'
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
              {logoutButton}
            </ButtonGroup>
          </div>
        }
        onOpening={props.onPopoverOpening}
        popoverClassName={Classes.POPOVER_DISMISS}
        disabled={props.isFolderModeEnabled}
      >
        {mainButton}
      </Popover>
    </Tooltip>
  );
};
