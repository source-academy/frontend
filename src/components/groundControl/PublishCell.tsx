import { Classes, Dialog, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { IAssessmentOverview } from '../assessment/assessmentShape';
import { controlButton } from '../commons';

interface IPublishCellProps {
  data: IAssessmentOverview;
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
}

interface IPublishCellState {
  dialogOpen: boolean;
  isPublished: boolean;
}

class PublishCell extends React.Component<IPublishCellProps, IPublishCellState> {
  public constructor(props: IPublishCellProps) {
    super(props);
    this.state = {
      dialogOpen: false,
      isPublished: this.props.data.isPublished === undefined ? false : this.props.data.isPublished
    };
  }

  public render() {
    const text = this.props.data.isPublished ? 'Unpublish' : 'Publish';
    const lowerText = text.charAt(0).toLowerCase() + text.substring(1);
    return (
      <div>
        <this.toggleButton />
        <Dialog
          icon="info-sign"
          isOpen={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
          title={text + ' Assessment'}
          canOutsideClickClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            {<p>Are you sure to {lowerText} this Assessment?</p>}
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {controlButton('Confirm ' + text, IconNames.CONFIRM, this.handleDelete)}
              {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  private toggleButton = () => {
    return <Switch checked={this.state.isPublished} onChange={this.handleOpenDialog} />;
  };
  private handleCloseDialog = () => this.setState({ dialogOpen: false });
  private handleOpenDialog = () => this.setState({ dialogOpen: true });
  private handleDelete = () => {
    const { data } = this.props;
    this.props.handlePublishAssessment(!data.isPublished, data.id);
    this.handleCloseDialog();
  };
}

export default PublishCell;
