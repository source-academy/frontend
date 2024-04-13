import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
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
  accessToken?: string;
  currPersistenceFile?: PersistenceFile;
  isDirty?: boolean;
  onClickOpen?: () => any;
  onClickSave?: () => any;
  onClickSaveAll?: () => any;
  onClickSaveAs?: () => any;
  onClickLogOut?: () => any;
  onClickLogIn?: () => any;
  onPopoverOpening?: () => any;
};

export const ControlBarGoogleDriveButtons: React.FC<Props> = props => {
  const { isMobileBreakpoint } = useResponsive();
  const state: PersistenceState = props.currPersistenceFile
    ? props.isDirty
      ? 'DIRTY'
      : 'SAVED'
    : 'INACTIVE';
  const mainButton = (
    <ControlButton
      label={(props.currPersistenceFile && props.currPersistenceFile.name) || 'Google Drive'}
      icon={IconNames.CLOUD}
      options={{ intent: stateToIntent[state] }}
      //isDisabled={props.isFolderModeEnabled}
    />
  );
  const openButton = (
    <ControlButton
      label="Open"
      icon={IconNames.DOCUMENT_OPEN}
      onClick={props.onClickOpen}
      isDisabled={props.accessToken ? false : true}
    />
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
    <ControlButton
      label="Save As"
      icon={IconNames.SEND_TO}
      onClick={props.onClickSaveAs}
      isDisabled={props.accessToken ? false : true}
    />
  );
  const saveAllButton = (
    <ControlButton
      label="Save All"
      icon={IconNames.DOUBLE_CHEVRON_UP}
      onClick={props.onClickSaveAll}
      // disable if persistenceObject is not a folder
      isDisabled={props.accessToken ? false : true}
    />
  );

  const loginButton = props.accessToken ? (
    <Tooltip2 content={`Logged in as ${props.loggedInAs}`} disabled={!props.loggedInAs}>
      <ControlButton label="Log Out" icon={IconNames.LOG_OUT} onClick={props.onClickLogOut} />
    </Tooltip2>
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
        onOpening={props.onPopoverOpening}
        popoverClassName={Classes.POPOVER_DISMISS}
        //disabled={props.isFolderModeEnabled}
      >
        {mainButton}
      </Popover2>
    </Tooltip2>
  );
};
