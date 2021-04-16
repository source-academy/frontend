import { Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import { EventType } from '../../features/achievement/AchievementTypes';
import { processEvent } from '../achievement/utils/eventHandler';
import controlButton from '../ControlButton';

type ControlButtonRunButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorEval: () => void;
};

type StateProps = {
  key: string;
};

export function ControlBarRunButton(props: ControlButtonRunButtonProps) {
  return (
    <Tooltip2 content="...or press shift-enter in the editor" placement={Position.TOP}>
      {controlButton('Run', IconNames.PLAY, () => {
        props.handleEditorEval();
        processEvent([EventType.RUN_CODE]);
      })}
    </Tooltip2>
  );
}
