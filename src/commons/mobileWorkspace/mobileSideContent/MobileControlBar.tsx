import { Button, Classes, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

import { ControlBarProps } from '../../controlBar/ControlBar';

function MobileControlBar(props: ControlBarProps) {
  const controlBarMenu = <div className="mobile-control-bar">{props.editorButtons}</div>;

  return (
    <Popover content={controlBarMenu} autoFocus={false}>
      <Button
        icon={IconNames.COG}
        className={classNames(Classes.MINIMAL, 'mobile-control-bar-button')}
      />
    </Popover>
  );
}

export default MobileControlBar;
