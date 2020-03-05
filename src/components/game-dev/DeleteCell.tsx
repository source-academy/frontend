import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { MaterialData } from './storyShape';

interface IDeleteCellProps {
  data: MaterialData;
  handleDeleteMaterial: (id: number) => void;
  handleDeleteMaterialFolder: (id: number) => void;
}

interface IDeleteCellState {
  dialogOpen: boolean;
}

class DeleteCell extends React.Component<IDeleteCellProps, IDeleteCellState> {
  public constructor(props: IDeleteCellProps) {
    super(props);
    this.state = {
      dialogOpen: false
    };
  }

  public render() {
    return (
      <div>
        {controlButton('', IconNames.TRASH, this.handleOpenDialog)}
        <Dialog
          icon="info-sign"
          isOpen={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
          title="Delete Material"
          canOutsideClickClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            {this.props.data.url ? (
              <p>Are you sure to delete this material file?</p>
            ) : (
              <p>Are you sure to delete this material folder?</p>
            )}
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {controlButton('Confirm Delete', IconNames.TRASH, this.handleDelete)}
              {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  private handleCloseDialog = () => this.setState({ dialogOpen: false });
  private handleOpenDialog = () => this.setState({ dialogOpen: true });
  private handleDelete = () => {
    const { data } = this.props;
    if (data.url) {
      this.props.handleDeleteMaterial(data.id);
    } else {
      this.props.handleDeleteMaterialFolder(data.id);
    }
  };
}

export default DeleteCell;
