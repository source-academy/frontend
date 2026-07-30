import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { useConductorEnable } from '../../features/conductor/flagConductorEnable';
import ControlButton from '../ControlButton';

type Props = {
  handleReplEval: () => void;
  isRunning: boolean;
};

function ControlBarEvalButton({ handleReplEval, isRunning }: Props) {
  const conductorEnabled = useConductorEnable();
  const showEvalButton = conductorEnabled ? isRunning : !isRunning;
  return showEvalButton ? (
    <Tooltip content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={handleReplEval} />
    </Tooltip>
  ) : null;
}

export default ControlBarEvalButton;
