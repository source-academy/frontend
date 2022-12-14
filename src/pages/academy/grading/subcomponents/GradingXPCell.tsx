import { Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import { GradingCellProps } from '../../../../features/grading/GradingTypes';

/**
 * Used to render the submission XP details in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
const GradingXPCell: React.FC<GradingCellProps> = props => {
  if (props.data.maxXp || props.data.xpBonus) {
    const tooltip = `Initial XP: ${props.data.initialXp}
        (${props.data.xpBonus > 0 ? `+${props.data.xpBonus} bonus ` : ''}
        ${props.data.xpAdjustment >= 0 ? '+' : ''}${props.data.xpAdjustment} adj.)`;
    return (
      <div>
        <Tooltip2 content={tooltip} placement={Position.LEFT} hoverOpenDelay={10} lazy={true}>
          {`${props.data.currentXp + props.data.xpBonus} / ${props.data.maxXp}`}
        </Tooltip2>
      </div>
    );
  } else {
    return <div>No Exp</div>;
  }
};

export default GradingXPCell;
