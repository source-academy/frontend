import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

import * as React from 'react';

import { GradingOverview } from './gradingShape';

type GradingHistoryProps = {
  data: GradingOverview;
  exp: boolean;
  grade: boolean;
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
    const popoverInfo = () => (
      <div className="col-xs-12" style={{ padding: 10 }}>
        {(this.props.grade && (
          <div>
            <p>Initial Grade: {this.props.data.initialGrade}</p>
            <p>Grade Adjustments: {this.props.data.gradeAdjustment}</p>
          </div>
        )) ||
          (this.props.exp && (
            <div>
              <p>Initial XP: {this.props.data.initialXp}</p>
              <p>XP Adjustments: {this.props.data.xpAdjustment}</p>
            </div>
          ))}
      </div>
    );

    /** Component to render in table - marks */
    const GradingMarks = () => {
      if (this.props.data.maxGrade !== 0) {
        return (
          <div>
            {`${this.props.data.currentGrade}`} / {`${this.props.data.maxGrade}`}
          </div>
        );
      } else {
        return <div>N/A</div>;
      }
    };

    /** Component to render in table - XP */
    const GradingExp = () => {
      if (this.props.data.currentXp && this.props.data.maxXp) {
        return (
          <div>
            {`${this.props.data.currentXp}`} / {`${this.props.data.maxXp}`}
          </div>
        );
      } else {
        return <div>No Exp</div>;
      }
    };

    return (
      <Popover
        content={popoverInfo()}
        position={Position.LEFT}
        interactionKind={PopoverInteractionKind.HOVER}
      >
        {(this.props.exp && <GradingExp />) || (this.props.grade && <GradingMarks />)}
      </Popover>
    );
  }
}

export default GradingHistory;
