import { Icon, IconName, Intent, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import * as React from 'react';

import { GradingStatuses } from '../../assessment/assessmentShape';
import { GradingOverview } from './gradingShape';

type GradingHistoryProps = {
  data: GradingOverview;
  exp: boolean;
  grade: boolean;
  status: boolean;
};

/**
 * Used to render the marking history in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingHistory extends React.Component<GradingHistoryProps, {}> {
  constructor(props: GradingHistoryProps) {
    super(props);
  }

  public render() {
    /** Component to render in table - status */
    const GradingStatus = () => {
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
          <Tooltip content={tooltip} position={Position.LEFT}>
            <Icon icon={iconName} intent={intent} />
          </Tooltip>
        </div>
      );
    };

    /** Component to render in table - marks */
    const GradingMarks = () => {
      if (this.props.data.maxGrade !== 0) {
        const tooltip = `Initial Grade: ${this.props.data.initialGrade}
          (${this.props.data.gradeAdjustment > 0 ? '+' : ''}${
          this.props.data.gradeAdjustment
        } adjustment)`;
        return (
          <div>
            <Tooltip content={tooltip} position={Position.LEFT}>
              {`${this.props.data.currentGrade} / ${this.props.data.maxGrade}`}
            </Tooltip>
          </div>
        );
      } else {
        return <div>N/A</div>;
      }
    };

    /** Component to render in table - XP */
    const GradingExp = () => {
      if (this.props.data.currentXp && this.props.data.maxXp) {
        const tooltip = `Initial XP: ${this.props.data.initialXp}
          \(${this.props.data.xpAdjustment > 0 ? '+' : ''}${
          this.props.data.xpAdjustment
        } adjustment\)`;
        return (
          <div>
            <Tooltip content={tooltip} position={Position.LEFT}>
              {`${this.props.data.currentXp} / ${this.props.data.maxXp}`}
            </Tooltip>
          </div>
        );
      } else {
        return <div>No Exp</div>;
      }
    };

    return (
      <div>
        {this.props.exp ? (
          <GradingExp />
        ) : this.props.grade ? (
          <GradingMarks />
        ) : this.props.status ? (
          <GradingStatus />
        ) : null}
        }
      </div>
    );
  }
}

export default GradingHistory;
