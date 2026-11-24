import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  handleReplEval: () => void;
  isRunning: boolean;
};

function ControlBarEvalButton({ handleReplEval, isRunning }: Props) {
  return isRunning ? (
    <Tooltip content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={handleReplEval} />
    </Tooltip>
  ) : null;
}

export default ControlBarEvalButton;
