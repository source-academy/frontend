import { Button, Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
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
  courseId?: number;
  courseRegId?: number;
  role?: Role;
};

const GradingActionsCell: React.FC<GradingActionsCellProps> = props => {
  const handleConfirmUnsubmit = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to unsubmit?',
      positiveIntent: 'danger',
      positiveLabel: 'Unsubmit'
    });
    if (confirm) {
      props.handleUnsubmitSubmission(props.data.submissionId);
    }
  };

  const handleConfirmReautograde = async () => {
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
      props.handleReautogradeSubmission(props.data.submissionId);
    }
  };

  const isOwnSubmission = props.courseRegId && props.courseRegId === props.data.studentId;
  const canReautograde = isOwnSubmission || props.data.submissionStatus === 'submitted';
  const canUnsubmit =
    props.data.submissionStatus === 'submitted' &&
    props.courseRegId &&
    (props.courseRegId === props.data.groupLeaderId ||
      isOwnSubmission ||
      props.role === Role.Admin);

  return (
    <>
      <Tooltip2 content={'Grade'} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
        <AnchorButtonLink
          to={`/courses/${props.courseId}/grading/${props.data.submissionId}`}
          icon="annotation"
          minimal
          //title="Grade"
        />
      </Tooltip2>

      <Tooltip2 content={'Reautograde'} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
        <Button
          icon="refresh"
          minimal
          onClick={handleConfirmReautograde}
          disabled={!canReautograde}
          //title="Reautograde"
        />
      </Tooltip2>
      <Tooltip2 content={'Unsubmit'} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
        <Button
          icon="arrow-left"
          minimal
          onClick={handleConfirmUnsubmit}
          disabled={!canUnsubmit}
          //title="Unsubmit"
        />
      </Tooltip2>
    </>
  );
};

export default GradingActionsCell;
