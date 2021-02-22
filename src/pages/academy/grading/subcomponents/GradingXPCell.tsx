import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { GradingCellProps } from '../../../../features/grading/GradingTypes';

/**
 * Used to render the submission XP details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingXPCell extends React.Component<GradingCellProps, {}> {
  /** Component to render in table - XP */
  public render() {
    if (this.props.data.maxXp || this.props.data.xpBonus) {
      const tooltip = `Initial XP: ${this.props.data.initialXp}
        (${this.props.data.xpBonus > 0 ? `+${this.props.data.xpBonus} bonus ` : ''}
        ${this.props.data.xpAdjustment >= 0 ? '+' : ''}${this.props.data.xpAdjustment} adj.)`;
      return (
        <div>
          <Tooltip2 content={tooltip} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
            {`${this.props.data.currentXp + this.props.data.xpBonus} / ${this.props.data.maxXp}`}
          </Tooltip2>
        </div>
      );
    } else {
      return <div>No Exp</div>;
    }
  }
}

export default GradingXPCell;
