import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarEvalButtonProps = {
  handleReplEval: () => void;
  isRunning: boolean;
};

export const ControlBarEvalButton: React.FC<ControlBarEvalButtonProps> = ({
  handleReplEval,
  isRunning
}) => {
  return isRunning ? null : (
    <Tooltip2 content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={handleReplEval} />
    </Tooltip2>
  );
};
