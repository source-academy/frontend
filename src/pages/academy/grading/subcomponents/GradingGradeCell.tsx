import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { GradingCellProps } from '../../../../features/grading/GradingTypes';

/**
 * Used to render the submission grade details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingGradeCell extends React.Component<GradingCellProps, {}> {
  /** Component to render in table - marks */
  public render() {
    if (this.props.data.maxGrade) {
      const tooltip = `Initial Grade: ${this.props.data.initialGrade}
        (${this.props.data.gradeAdjustment >= 0 ? '+' : ''}${
        this.props.data.gradeAdjustment
      } adj.)`;
      return (
        <div>
          <Tooltip2 content={tooltip} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
            {`${this.props.data.currentGrade} / ${this.props.data.maxGrade}`}
          </Tooltip2>
        </div>
      );
    } else {
      return <div>N/A</div>;
    }
  }
}

export default GradingGradeCell;
