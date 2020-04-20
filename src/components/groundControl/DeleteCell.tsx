import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { IAssessmentOverview } from '../assessment/assessmentShape';
import { controlButton } from '../commons';

interface IDeleteCellProps {
  data: IAssessmentOverview;
  handleDeleteAssessment: (id: number) => void;
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
          title="Delete Assessment"
          canOutsideClickClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            {<p>Are you sure that you want to delete this Assessment?</p>}
            {<p>Students' answers and submissions will be deleted as well.</p>}
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
    this.props.handleDeleteAssessment(data.id);
    this.handleCloseDialog();
  };
}

export default DeleteCell;
