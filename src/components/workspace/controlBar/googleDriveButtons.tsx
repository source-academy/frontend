import { Menu, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { controlButton } from '../../commons';

export type GoogleDriveButtonsProps = {
  key: string;
  onClickSave?(): any;
  onClickOpen?(): any;
  onClickUpdate?(): any;
};

export class GoogleDriveButtons extends React.PureComponent<GoogleDriveButtonsProps> {
  constructor(props: GoogleDriveButtonsProps) {
    super(props);
  }

  public render() {
    const saveAsButton = controlButton('Save As', IconNames.SEND_TO, this.props.onClickSave);

    const openButton = controlButton('Open', IconNames.DOCUMENT_OPEN, this.props.onClickOpen);

    const saveButton = controlButton('Save', IconNames.FLOPPY_DISK, this.props.onClickUpdate);

    return (
      <Popover
        content={
          <Menu large={true}>
            {saveAsButton}
            {saveButton}
            {openButton}
          </Menu>
        }
      >
        {controlButton('GoogleDrive', IconNames.CLOUD)}
      </Popover>
    );
  }
}
