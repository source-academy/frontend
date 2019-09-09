import { Icon, IconName, Intent, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { GradingStatuses } from '../../assessment/assessmentShape';
import { GradingOverview } from './gradingShape';

type GradingStatusCellProps = {
  data: GradingOverview;
};

/**
 * Used to render the submission grading status details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingStatusCell extends React.Component<GradingStatusCellProps, {}> {
  constructor(props: GradingStatusCellProps) {
    super(props);
  }

  /** Component to render in table - grading status */
  public render() {
    const gradingStatus = this.props.data.gradingStatus;
    let iconName: IconName;
    let tooltip: string;
    let intent: Intent;

    switch (gradingStatus) {
      case GradingStatuses.graded:
        iconName = IconNames.TICK;
        tooltip = `Fully graded: ${this.props.data.gradedCount} of 
          ${this.props.data.questionCount}`;
        intent = Intent.SUCCESS;
        break;
      case GradingStatuses.grading:
        iconName = IconNames.TIME;
        tooltip = `Partially graded: ${this.props.data.gradedCount} of 
          ${this.props.data.questionCount}`;
        intent = Intent.WARNING;
        break;
      case GradingStatuses.none:
        iconName = IconNames.CROSS;
        tooltip = `Not graded: ${this.props.data.gradedCount} of 
          ${this.props.data.questionCount}`;
        intent = Intent.DANGER;
        break;
      default:
        iconName = IconNames.DISABLE;
        tooltip = 'Not applicable';
        intent = Intent.PRIMARY;
    }

    return (
      <div>
        <Tooltip content={tooltip} position={Position.LEFT} hoverOpenDelay={10} lazy={true}>
          <Icon icon={iconName} intent={intent} />
        </Tooltip>
      </div>
    );
  }
}

export default GradingStatusCell;
