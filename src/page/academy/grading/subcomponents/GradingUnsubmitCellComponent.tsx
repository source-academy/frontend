import { Alert, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from 'src/commons/ControlButton';
import { GradingOverview } from 'src/feature/grading/gradingTypes';
import { Role } from 'src/reducers/states';

export interface IUnsubmitCellProps {
  data: GradingOverview;
  handleUnsubmitSubmission: (submissionId: number) => void;
  group: string | null;
  role?: Role;
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
    if (this.props.data.submissionStatus !== 'submitted') {
      return null;
    } else if (this.props.group !== this.props.data.groupName && this.props.role! !== Role.Admin) {
      return null;
    }

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
