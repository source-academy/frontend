import { Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import controlButton from '../ControlButton';

function ControlBarRecoveryInfoIcon() {
  return (
    <Tooltip2
      content="If Source Academy freezes, just refresh the tab, or close and reopen it"
      placement={Position.TOP}
    >
      {controlButton('Freezing? Try a refresh', IconNames.WARNING_SIGN, null, {
        iconColor: 'yellow',
        className: 'RecoveryInfoIcon'
      })}
    </Tooltip2>
  );
}

export default ControlBarRecoveryInfoIcon;
