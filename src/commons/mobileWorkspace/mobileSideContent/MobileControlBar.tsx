import { Button, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import type { ControlBarProps } from '../../controlBar/ControlBar';

function MobileControlBar(props: ControlBarProps) {
  const controlBarMenu = (
    <div className="mobile-control-bar">
      {props.editorButtons}
      {props.flowButtons}
      {props.editingWorkspaceButtons}
    </div>
  );

  return (
    <Popover content={controlBarMenu} autoFocus={false}>
      <Button variant="minimal" icon={IconNames.COG} className="mobile-control-bar-button" />
    </Popover>
  );
}

export default MobileControlBar;
