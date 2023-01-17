import { Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import ControlButton from '../ControlButton';

type ControlButtonRunButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorEval: () => void;
};

type StateProps = {
  key: string;
  color?: string;
  className?: string;
};

export function ControlBarRunButton(props: ControlButtonRunButtonProps) {
  return (
    <Tooltip2 content="...or press shift-enter in the editor" placement={Position.TOP}>
      <ControlButton
        label="Run"
        icon={IconNames.PLAY}
        onClick={props.handleEditorEval}
        options={{ iconColor: props.color, className: props.className }}
      />
    </Tooltip2>
  );
}
