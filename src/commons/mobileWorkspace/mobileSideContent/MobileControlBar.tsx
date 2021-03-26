import { Button, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import classNames from 'classnames';

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
    <Popover2 content={controlBarMenu} autoFocus={false}>
      <Button
        icon={IconNames.COG}
        className={classNames(Classes.MINIMAL, 'mobile-control-bar-button')}
      />
    </Popover2>
  );
};

export default MobileControlBar;
