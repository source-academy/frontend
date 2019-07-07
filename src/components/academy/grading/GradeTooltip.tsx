import { Position, Tooltip } from '@blueprintjs/core';
import * as React from 'react';

import { GradingOverview } from './gradingShape';

type GradeTooltipProps = {
  data: GradingOverview;
};

/**
 * Used to render the submission grade details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradeTooltip extends React.Component<GradeTooltipProps, {}> {
  constructor(props: GradeTooltipProps) {
    super(props);
  }

  /** Component to render in table - marks */
  public render() {
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
  }
}

export default GradeTooltip;
