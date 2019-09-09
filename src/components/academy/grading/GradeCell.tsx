import { Position, Tooltip } from '@blueprintjs/core';
import * as React from 'react';

import { GradingOverview } from './gradingShape';

type GradeCellProps = {
  data: GradingOverview;
};

/**
 * Used to render the submission grade details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradeCell extends React.Component<GradeCellProps, {}> {
  constructor(props: GradeCellProps) {
    super(props);
  }

  /** Component to render in table - marks */
  public render() {
    if (this.props.data.maxGrade) {
      const tooltip = `Initial Grade: ${this.props.data.initialGrade}
        (${this.props.data.gradeAdjustment >= 0 ? '+' : ''}${
        this.props.data.gradeAdjustment
      } adj.)`;
      return (
        <div>
          <Tooltip content={tooltip} position={Position.LEFT} hoverOpenDelay={10} lazy={true}>
            {`${this.props.data.currentGrade} / ${this.props.data.maxGrade}`}
          </Tooltip>
        </div>
      );
    } else {
      return <div>N/A</div>;
    }
  }
}

export default GradeCell;
