import { Icon, IconName, Intent, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import { GradingStatuses } from '../../../../commons/assessment/AssessmentTypes';
import { GradingCellProps } from '../../../../features/grading/GradingTypes';

/**
 * Used to render the submission grading status details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
const GradingStatusCell: React.FC<GradingCellProps> = props => {
  const gradingStatus = props.data.gradingStatus;
  let iconName: IconName;
  let tooltip: string;
  let intent: Intent;

  switch (gradingStatus) {
    case GradingStatuses.graded:
      iconName = IconNames.TICK;
      tooltip = `Fully graded: ${props.data.gradedCount} of
          ${props.data.questionCount}`;
      intent = Intent.SUCCESS;
      break;
    case GradingStatuses.grading:
      iconName = IconNames.TIME;
      tooltip = `Partially graded: ${props.data.gradedCount} of
          ${props.data.questionCount}`;
      intent = Intent.WARNING;
      break;
    case GradingStatuses.none:
      iconName = IconNames.CROSS;
      tooltip = `Not graded: ${props.data.gradedCount} of
          ${props.data.questionCount}`;
      intent = Intent.DANGER;
      break;
    default:
      iconName = IconNames.DISABLE;
      tooltip = 'Not applicable';
      intent = Intent.PRIMARY;
  }

  return (
    <div>
      <Tooltip2 content={tooltip} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
        <Icon icon={iconName} intent={intent} />
      </Tooltip2>
    </div>
  );
};

export default GradingStatusCell;
