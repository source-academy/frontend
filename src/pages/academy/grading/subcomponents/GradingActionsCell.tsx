import { Button } from '@blueprintjs/core';
import * as React from 'react';
import AnchorButtonLink from 'src/commons/AnchorButtonLink';

import { Role } from '../../../../commons/application/ApplicationTypes';
import { showSimpleConfirmDialog } from '../../../../commons/utils/DialogHelper';
import { GradingOverview } from '../../../../features/grading/GradingTypes';

export type GradingActionsCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleUnsubmitSubmission: (submissionId: number) => void;
  handleReautogradeSubmission: (submissionId: number) => void;
};

type StateProps = {
  data: GradingOverview;
  userId?: number;
  role?: Role;
};

class GradingActionsCell extends React.Component<GradingActionsCellProps> {
  public constructor(props: GradingActionsCellProps) {
    super(props);

    this.state = {
      isAlertOpen: false
    };
  }

  public render() {
    const cannotUnsubmit =
      this.props.data.submissionStatus !== 'submitted' ||
      !this.props.userId ||
      (this.props.userId !== this.props.data.groupLeaderId && this.props.role !== Role.Admin);

    return (
      <>
        <AnchorButtonLink
          to={`/academy/grading/${this.props.data.submissionId}`}
          icon="annotation"
          minimal
          title="Grade"
        />
        <Button
          icon="refresh"
          minimal
          onClick={this.handleConfirmReautograde}
          title="Reautograde"
        />
        <Button
          icon="arrow-left"
          minimal
          onClick={this.handleConfirmUnsubmit}
          disabled={cannotUnsubmit}
          title="Unsubmit"
        />
      </>
    );
  }

  private handleConfirmUnsubmit = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to unsubmit?',
      positiveIntent: 'danger',
      positiveLabel: 'Unsubmit'
    });
    if (confirm) {
      this.props.handleUnsubmitSubmission(this.props.data.submissionId);
    }
  };

  private handleConfirmReautograde = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Reautograde this submission?</p>
          <p>Note: all manual adjustments will be reset to 0.</p>
        </>
      ),
      positiveIntent: 'danger',
      positiveLabel: 'Reautograde'
    });
    if (confirm) {
      this.props.handleReautogradeSubmission(this.props.data.submissionId);
    }
  };
}

export default GradingActionsCell;
