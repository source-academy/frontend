import { Alert, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../../commons';
import { GradingOverview } from './gradingShape';

interface IUnsubmitCellProps {
  data: GradingOverview;
  handleUnsubmitSubmission: (submissionId: number) => void;
}

type UnsubmitCellState = {
  isAlertOpen: boolean;
};

class UnsubmitCell extends React.Component<IUnsubmitCellProps, UnsubmitCellState> {
  public constructor(props: IUnsubmitCellProps) {
    super(props);

    this.state = {
      isAlertOpen: false
    };
  }

  public render() {
    return (
      <div>
        <Alert
          canEscapeKeyCancel={true}
          canOutsideClickCancel={true}
          cancelButtonText="Cancel"
          className="unsubmit-alert alert"
          intent={Intent.DANGER}
          onConfirm={this.handleConfirmUnsubmit}
          isOpen={this.state.isAlertOpen}
          onCancel={this.handleUnsubmitAlertClose}
        >
          Are you sure you want to unsubmit?
        </Alert>
        {controlButton('', IconNames.ARROW_LEFT, () => this.setState({ isAlertOpen: true }), {
          fullWidth: true
        })}
      </div>
    );
  }

  private handleConfirmUnsubmit = () => {
    this.props.handleUnsubmitSubmission(this.props.data.submissionId);
    this.setState({ isAlertOpen: false });
  };

  private handleUnsubmitAlertClose = () => this.setState({ isAlertOpen: false });
}

export default UnsubmitCell;
