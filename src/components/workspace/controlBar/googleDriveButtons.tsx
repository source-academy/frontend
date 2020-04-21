import { Menu, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { controlButton } from '../../commons';

export type GoogleDriveButtonsProps = {
  key: string;
  onClickSave?(): any;
  onClickOpen?(): any;
};

export class GoogleDriveButtons extends React.PureComponent<GoogleDriveButtonsProps> {
  constructor(props: GoogleDriveButtonsProps) {
    super(props);
  }

  public render() {
    const saveAsButton = controlButton('Save As', IconNames.FLOPPY_DISK, this.props.onClickSave);

    const openButton = controlButton('Open', IconNames.DOCUMENT_OPEN, this.props.onClickOpen);

    return (
      <Popover
        content={
          <Menu large={true}>
            {saveAsButton}
            {openButton}
          </Menu>
        }
      >
        {controlButton('GoogleDive', IconNames.CLOUD)}
      </Popover>
    );
  }
}
