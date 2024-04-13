import { Button, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { ControlBarProps } from '../../controlBar/ControlBar';

const MobileControlBar: React.FC<ControlBarProps> = props => {
  const controlBarMenu = (
    <div className="mobile-control-bar">
      {props.editorButtons}
      {props.flowButtons}
      {props.editingWorkspaceButtons}
    </div>
  );

  return (
    <Popover content={controlBarMenu} autoFocus={false}>
      <Button minimal icon={IconNames.COG} className="mobile-control-bar-button" />
    </Popover>
  );
};

export default MobileControlBar;
